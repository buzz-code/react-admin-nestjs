import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { GenericDataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { BulkToZipReportGenerator } from '@shared/utils/report/bulk-to-zip.generator';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { User } from '@shared/entities/User.entity';
import { In, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere, FindOperator } from 'typeorm';
import { ISpecialField } from '@shared/utils/importer/types';
import * as ExcelJS from 'exceljs';
import { getUniqueValues, groupDataByKeysAndCalc } from 'src/utils/reportData.util';
import { ReportGroup } from 'src/db/entities/ReportGroup.entity';

export interface KlassAttendanceReportParams {
  userId: number;
  klassId: number;        // Single klass ID
  startDate?: Date;     // ISO date string (optional)
  endDate?: Date;       // ISO date string (optional)
  lessonReferenceIds?: number[];
}

export interface KlassAttendanceReportData extends IDataToExcelReportGenerator {
  klassName: string;
  institutionName: string;
  institutionCode: string;
  sessions: SessionData[];
  students: StudentAttendanceData[];
}

interface SessionData {
  date: Date;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  topic: string;
  lessonCount: number;
  teacherName: string;
}

interface StudentAttendanceData {
  studentName: string;
  attendanceMarks: string[];  // 'V', '±', 'X', '--' for each session
}

const getReportData: IGetReportDataFunction<KlassAttendanceReportParams, KlassAttendanceReportData> =
  async (params, dataSource): Promise<KlassAttendanceReportData> => {

    console.log('klass attendance report params:', params);

    const { userId, klassId, startDate, endDate, lessonReferenceIds } = params;

    // Build where conditions for sessions
    const sessionWhere: FindOptionsWhere<ReportGroupSession> = {
      reportGroup: {
        userId,
        klassReferenceId: klassId,
      }
    };

    // Add lesson filtering if provided
    if (lessonReferenceIds?.length > 0) {
      (sessionWhere.reportGroup as FindOptionsWhere<ReportGroup>).lessonReferenceId = In(lessonReferenceIds);
    }

    // Add date filtering using TypeORM operators
    if (startDate && endDate) {
      sessionWhere.sessionDate = Between(startDate, endDate);
    } else if (startDate) {
      sessionWhere.sessionDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      sessionWhere.sessionDate = LessThanOrEqual(endDate);
    }

    // Fetch all data in parallel
    const [user, klass, allSessions] = await Promise.all([
      dataSource.getRepository(User).findOne({
        where: { id: userId }
      }),
      dataSource.getRepository(Klass).findOne({
        where: { id: klassId }
      }),
      dataSource.getRepository(ReportGroupSession).find({
        where: sessionWhere,
        relations: ['reportGroup', 'reportGroup.teacher', 'reportGroup.lesson'],
        order: { sessionDate: 'ASC' }
      })
    ]);

    if (!klass) {
      console.log('klass attendance report: klass not found', klassId);
      return null;
    }

    if (allSessions.length === 0) {
      console.log('klass attendance report: no sessions found for klass', klassId);
      return null;
    }

    // Get attendance reports for these sessions
    const sessionIds = getUniqueValues(allSessions, s => s.id);
    const attReports = await dataSource.getRepository(AttReport).find({
      where: { reportGroupSessionId: In(sessionIds) },
      relations: ['student'],
      order: { student: { name: 'ASC' } }
    });

    // Group attendance reports by session to calculate lesson counts
    const lessonCountsBySession = groupDataByKeysAndCalc(
      attReports,
      ['reportGroupSessionId'],
      (reports) => Math.max(...reports.map(r => r.howManyLessons || 0), 0)
    );

    // Group attendance reports by student and session for easy lookup
    const reportsByStudentAndSession = groupDataByKeysAndCalc(
      attReports,
      ['studentReferenceId', 'reportGroupSessionId'],
      (reports) => reports[0]
    );

    // Build session data - each session has its own teacher and lesson
    const sessions: SessionData[] = allSessions
      .filter(session => lessonCountsBySession[session.id])
      .map(session => ({
        date: new Date(session.sessionDate),
        dayOfWeek: FORMATTING.getHebrewDayOfWeek(new Date(session.sessionDate)),
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        topic: session.topic || session.reportGroup?.lesson?.name || '',
        lessonCount: lessonCountsBySession[session.id],
        teacherName: session.reportGroup?.teacher?.name || ''
      }));

    // Get unique students from attendance reports
    const uniqueStudentIds = getUniqueValues(attReports, r => r.studentReferenceId);
    const studentByIdMap = groupDataByKeysAndCalc(
      attReports,
      ['studentReferenceId'],
      (reports) => reports[0].student
    );
    const uniqueStudents = uniqueStudentIds
      .map(studentId => studentByIdMap[studentId])
      .filter(s => s)
      .sort((a, b) => a.name.localeCompare(b.name, 'he'));

    // Build student data with attendance marks
    const students: StudentAttendanceData[] = uniqueStudents.map(student => {
      const attendanceMarks = allSessions
        .filter(session => lessonCountsBySession[session.id])
        .map(session => {
          const key = `${student.id}_${session.id}`;
          const report = reportsByStudentAndSession[key];
          return FORMATTING.getAttendanceMark(report);
        });

      return {
        studentName: student.name,
        attendanceMarks
      };
    });
    console.log(`klass attendance report: built attendance data for ${students.length} students`);

    // Build and return Excel data
    const excelData = BUILDING.buildExcelData({
      klassName: klass?.name || '',
      institutionName: user?.userInfo?.organizationName || 'לא ידוע',
      institutionCode: user?.userInfo?.organizationCode || 'לא ידוע',
      sessions,
      students,
      headerRow: [],
      formattedData: [],
      sheetName: '',
      specialFields: []
    });

    console.log('Excel data summary:', {
      klassName: excelData.klassName,
      sessionCount: excelData.sessions.length,
      studentCount: excelData.students.length,
      formattedDataRows: excelData.formattedData.length,
      formattedDataPreview: excelData.formattedData.slice(0, 3)
    });

    return excelData;
  };


// Row index constants
const ROW_INDEX = {
  TITLE_1: 0,
  TITLE_2: 1,
  SPACING: 2,
  TABLE_START: 3,
} as const;

const ROW_COUNT = {
  TITLE_ROWS: 2,
  SPACING_ROWS: 1,
  HEADER_OFFSET: 3,  // Title rows + spacing
} as const;

const STYLING: Record<string, Partial<ExcelJS.Style>> = {
  headerStyle: {
    font: { bold: true, size: 16, name: 'Arial' },
    alignment: {
      horizontal: 'center',
      vertical: 'middle',
      readingOrder: 'rtl',
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    }
  },
  subHeaderStyle: {
    font: { bold: true, size: 14, name: 'Arial' },
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl'
    }
  },
  tableHeaderStyle: {
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl',
      wrapText: true
    },
    font: { name: 'Arial', size: 11, bold: true },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }  // Light gray background
    }
  },
  tableStyle: {
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl',
      wrapText: true
    },
    font: { name: 'Arial', size: 11 }
  }
}

const BUILDING = {
  // Build table header section: rows + special fields + borders
  buildTableHeaderSection(sessions: SessionData[]) {
    const dayRow = ['יום בשבוע', ...sessions.map(s => s.dayOfWeek)];
    const dateRow = ['תאריך', ...sessions.map(s => FORMATTING.formatDate(s.date))];
    const hoursRow = ['שעות לימוד', ...sessions.map(s => `${FORMATTING.formatTime(s.startTime)}-${FORMATTING.formatTime(s.endTime)}`)];
    const topicRow = ['נושא הלימוד', ...sessions.map(s => s.topic)];
    const lessonCountRow = ['מס\' שעות לימוד', ...sessions.map(s => s.lessonCount.toString())];
    const teacherRow = ['שם המורה', ...sessions.map(s => s.teacherName)];
    const separatorRow = ['', ...sessions.map(() => '--')];

    const rows = [
      dayRow,
      dateRow,
      hoursRow,
      topicRow,
      lessonCountRow,
      teacherRow,
      separatorRow
    ];

    // Convert header rows to special fields with styling
    const specialFields: ISpecialField[] = [];
    rows.forEach((row, rowIndex) => {
      const actualRowIndex = ROW_COUNT.HEADER_OFFSET + rowIndex;
      row.forEach((cell, colIndex) => {
        if (cell !== '') {
          specialFields.push({
            cell: { r: actualRowIndex, c: colIndex },
            value: cell,
            style: STYLING.tableHeaderStyle
          });
        }
      });
    });

    // Define borders for header section
    const lastCol = sessions.length;
    const startRow = ROW_INDEX.TABLE_START;
    const endRow = startRow + rows.length - 1;
    
    const borderRanges = [
      {
        from: { r: startRow, c: 0 },
        to: { r: endRow, c: lastCol },
        innerBorder: { style: 'thin' } as ExcelJS.Border
      }
    ];

    return { rowCount: rows.length, specialFields, borderRanges };
  },

  // Build table data section: student rows + special fields + borders
  buildTableDataSection(students: StudentAttendanceData[], headerRowCount: number) {
    const startRow = ROW_COUNT.HEADER_OFFSET + headerRowCount;
    const lastRow = startRow + students.length - 1;

    // Convert student rows to special fields
    const specialFields: ISpecialField[] = [];
    students.forEach((student, rowIndex) => {
      const actualRowIndex = startRow + rowIndex;
      const row = [student.studentName, ...student.attendanceMarks];
      
      row.forEach((cell, colIndex) => {
        if (cell !== '') {
          specialFields.push({
            cell: { r: actualRowIndex, c: colIndex },
            value: cell,
            style: STYLING.tableStyle
          });
        }
      });
    });

    // Define borders for student name column
    const borderRanges = [
      {
        from: { r: startRow, c: 0 },
        to: { r: lastRow, c: 0 },
        innerBorder: { style: 'thin' } as ExcelJS.Border
      }
    ];

    return { specialFields, borderRanges };
  },

  // Build complete table section: header + data + overall borders
  buildTableSection(sessions: SessionData[], students: StudentAttendanceData[]) {
    const headerSection = BUILDING.buildTableHeaderSection(sessions);
    const dataSection = BUILDING.buildTableDataSection(students, headerSection.rowCount);

    const totalRowCount = ROW_COUNT.HEADER_OFFSET + headerSection.rowCount + students.length;
    const lastRow = totalRowCount - 1;
    const lastCol = sessions.length;

    // Combine special fields from both sections
    const specialFields = [
      ...headerSection.specialFields,
      ...dataSection.specialFields
    ];

    // Combine border ranges + add outer border for entire table
    const borderRanges = [
      // Heavy outer border around entire table
      {
        from: { r: ROW_INDEX.TABLE_START, c: 0 },
        to: { r: lastRow, c: lastCol },
        outerBorder: { style: 'medium' } as ExcelJS.Border
      },
      ...headerSection.borderRanges,
      ...dataSection.borderRanges
    ];

    return { totalRowCount, specialFields, borderRanges };
  },

  // Build title section: special fields (merged cells) + borders
  buildTitleSection(
    institutionName: string,
    institutionCode: string,
    klassName: string,
    sessionCount: number
  ) {
    const titleRow1 = `יומן נוכחות ${institutionName} סמל מוסד ${institutionCode}`;
    const titleRow2 = `כיתה ${klassName}`;
    const lastCol = sessionCount;

    return {
      specialFields: [
        {
          cell: { r: ROW_INDEX.TITLE_1, c: 0 },
          value: titleRow1,
          style: STYLING.headerStyle,
          merge: { s: { r: ROW_INDEX.TITLE_1, c: 0 }, e: { r: ROW_INDEX.TITLE_1, c: sessionCount } }
        },
        {
          cell: { r: ROW_INDEX.TITLE_2, c: 0 },
          value: titleRow2,
          style: STYLING.subHeaderStyle,
          merge: { s: { r: ROW_INDEX.TITLE_2, c: 0 }, e: { r: ROW_INDEX.TITLE_2, c: sessionCount } }
        }
      ],
      borderRanges: [
        // Heavy border around title rows
        {
          from: { r: ROW_INDEX.TITLE_1, c: 0 },
          to: { r: ROW_INDEX.TITLE_2, c: lastCol },
          outerBorder: { style: 'medium' } as ExcelJS.Border
        }
      ]
    };
  },

  // Main function - orchestrates building the Excel data structure
  buildExcelData(data: KlassAttendanceReportData): KlassAttendanceReportData {
    const { klassName, institutionName, institutionCode, sessions, students } = data;

    console.log('buildExcelData input:', {
      klassName,
      sessionCount: sessions.length,
      studentCount: students.length
    });

    // 1. Build title section (merged headers + borders)
    const titleSection = BUILDING.buildTitleSection(institutionName, institutionCode, klassName, sessions.length);

    // 2. Build complete table section (header rows + student rows + borders)
    const tableSection = BUILDING.buildTableSection(sessions, students);

    // 3. Combine everything
    const specialFields = [...titleSection.specialFields, ...tableSection.specialFields];
    const borderRanges = [...titleSection.borderRanges, ...tableSection.borderRanges];

    console.log('buildExcelData output:', {
      rowCount: tableSection.totalRowCount,
      specialFieldCount: specialFields.length,
      borderRangeCount: borderRanges.length
    });

    return {
      klassName,
      institutionName,
      institutionCode,
      sessions,
      students,
      headerRow: [],
      formattedData: [],
      sheetName: klassName || 'יומן נוכחות',
      specialFields,
      borderRanges
    };
  }
}

const FORMATTING = {
  getHebrewDayOfWeek(date: Date): string {
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    return days[date.getDay()];
  },

  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(2);  // Last 2 digits of year
    return `${day}/${month}/${year}`;
  },

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  },

  getAttendanceMark(report: AttReport | null | undefined): string {
    if (!report) return '--';  // No report for this session

    const absPercent = report.howManyLessons > 0 ? report.absCount / report.howManyLessons : 0;

    if (absPercent === 0) return 'V';      // Full attendance
    if (absPercent < 1.0) return '±';      // Partial absence
    return 'X';                             // Full absence
  },
}

const getReportName = (data: KlassAttendanceReportData) => `יומן נוכחות - ${data.klassName}`;
const singleGenerator = new GenericDataToExcelReportGenerator<KlassAttendanceReportParams>(getReportName, getReportData);
const generator = new BulkToZipReportGenerator(() => 'יומני נוכחות', singleGenerator);

export default generator;
