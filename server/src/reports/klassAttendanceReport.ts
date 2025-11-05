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
        dayOfWeek: getHebrewDayOfWeek(new Date(session.sessionDate)),
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
          return getAttendanceMark(report);
        });

      return {
        studentName: student.name,
        attendanceMarks
      };
    });
    console.log(`klass attendance report: built attendance data for ${students.length} students`);

    // Build and return Excel data
    const excelData = buildExcelData({
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


// Header styling
const headerStyle: Partial<ExcelJS.Style> = {
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
};

const subHeaderStyle: Partial<ExcelJS.Style> = {
  font: { bold: true, size: 14, name: 'Arial' },
  alignment: {
    horizontal: 'center',
    readingOrder: 'rtl'
  }
};

const tableStyle: Partial<ExcelJS.Style> = {
  alignment: {
    horizontal: 'center',
    readingOrder: 'rtl',
    wrapText: true
  },
  font: { name: 'Arial', size: 11 }
};

function buildExcelData(data: KlassAttendanceReportData): KlassAttendanceReportData {
  const { klassName, institutionName, institutionCode, sessions, students } = data;

  console.log('buildExcelData input:', {
    klassName,
    sessionCount: sessions.length,
    studentCount: students.length,
    firstStudent: students[0]?.studentName,
    firstSession: sessions[0]?.date
  });

  // Build header rows
  const titleRow1 = `יומן נוכחות ${institutionName} סמל מוסד ${institutionCode}`;
  const titleRow2 = `כיתה ${klassName}`;

  // Build session header rows
  const dayRow = ['יום בשבוע', ...sessions.map(s => s.dayOfWeek)];
  const dateRow = ['תאריך', ...sessions.map(s => formatDate(s.date))];
  const hoursRow = ['שעות לימוד', ...sessions.map(s => `${formatTime(s.startTime)}-${formatTime(s.endTime)}`)];
  const topicRow = ['נושא הלימוד', ...sessions.map(s => s.topic)];
  const lessonCountRow = ['מס\' שעות לימוד', ...sessions.map(s => s.lessonCount.toString())];
  const teacherRow = ['שם המורה', ...sessions.map(s => s.teacherName)];

  // Build separator row
  const separatorRow = ['', ...sessions.map(() => '--')];

  // Build student rows
  const studentRows = students.map(student => {
    return [student.studentName, ...student.attendanceMarks];
  });

  // Combine all rows (skip header titles initially, will add via specialFields)
  const formattedData = [
    [''],  // Empty row for title 1
    [''],  // Empty row for title 2
    [''],  // Empty spacing row
    dayRow,
    dateRow,
    hoursRow,
    topicRow,
    lessonCountRow,
    teacherRow,
    separatorRow,
    ...studentRows
  ];

  // Special fields for styling headers (merged cells will be added in Phase 4)
  const specialFields: ISpecialField[] = [
    {
      cell: { r: 0, c: 0 },
      value: titleRow1,
      style: headerStyle,
      merge: { s: { r: 0, c: 0 }, e: { r: 0, c: sessions.length } }
    },
    {
      cell: { r: 1, c: 0 },
      value: titleRow2,
      style: subHeaderStyle,
      merge: { s: { r: 1, c: 0 }, e: { r: 1, c: sessions.length } }
    }
  ];

  console.log('buildExcelData output:', {
    formattedDataRows: formattedData.length,
    formattedDataCols: formattedData[0]?.length,
    sampleRows: formattedData.slice(9, 12) // Show separator + first 2 students
  });

  // Add formattedData to specialFields as individual cells
  // This bypasses the table structure and writes data directly
  formattedData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '') {  // Skip empty cells to avoid overwriting
        specialFields.push({
          cell: { r: rowIndex, c: colIndex },
          value: cell,
          style: tableStyle
        });
      }
    });
  });

  // Calculate border ranges
  const lastRow = formattedData.length - 1;  // 0-indexed
  const lastCol = sessions.length;  // 0-indexed (sessions + 1 column for names - 1 for 0-index)

  const borderRanges = [
    // Heavy border around title rows (rows 0-1)
    {
      from: { r: 0, c: 0 },
      to: { r: 1, c: lastCol },
      outerBorder: { style: 'medium' } as ExcelJS.Border
    },
    // Heavy outer border around entire table (rows 3 onwards = dayRow to last student)
    {
      from: { r: 3, c: 0 },
      to: { r: lastRow, c: lastCol },
      outerBorder: { style: 'medium' } as ExcelJS.Border
    },
    // Light borders for header section (dayRow through teacherRow = rows 3-8)
    {
      from: { r: 3, c: 0 },
      to: { r: 8, c: lastCol },
      innerBorder: { style: 'thin' } as ExcelJS.Border
    },
    // Light borders for student name column (first column of student rows = rows 10 onwards)
    {
      from: { r: 10, c: 0 },
      to: { r: lastRow, c: 0 },
      innerBorder: { style: 'thin' } as ExcelJS.Border
    }
  ];

  return {
    klassName,
    institutionName,
    institutionCode,
    sessions,
    students,
    headerRow: [],  // No table - using specialFields instead
    formattedData: [],  // Empty since we're using specialFields
    sheetName: klassName || 'יומן נוכחות',
    specialFields,
    borderRanges
  };
}

function getHebrewDayOfWeek(date: Date): string {
  const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  return days[date.getDay()];
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(2);  // Last 2 digits of year
  return `${day}/${month}/${year}`;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

function getAttendanceMark(report: AttReport | null | undefined): string {
  if (!report) return '--';  // No report for this session

  const absPercent = report.howManyLessons > 0 ? report.absCount / report.howManyLessons : 0;

  if (absPercent === 0) return 'V';      // Full attendance
  if (absPercent < 1.0) return '±';      // Partial absence
  return 'X';                             // Full absence
}

const getReportName = (data: KlassAttendanceReportData) => `יומן נוכחות - ${data.klassName}`;
const singleGenerator = new GenericDataToExcelReportGenerator<KlassAttendanceReportParams>(getReportName, getReportData);
const generator = new BulkToZipReportGenerator(() => 'יומני נוכחות', singleGenerator);

export default generator;
