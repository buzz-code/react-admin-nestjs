import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import {
  GenericDataToExcelReportGenerator,
  IDataToExcelReportGenerator,
} from '@shared/utils/report/data-to-excel.generator';
import { BulkToZipReportGenerator } from '@shared/utils/report/bulk-to-zip.generator';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { User } from '@shared/entities/User.entity';
import { In, FindOptionsWhere } from 'typeorm';
import { getReportDateFilter, getDateRange } from '@shared/utils/entity/filters.util';
import { IImageField, ISpecialField } from '@shared/utils/importer/types';
import * as ExcelJS from 'exceljs';
import { getUniqueValues, groupDataByKeysAndCalc, groupDataByKeyFn } from '@shared/utils/reportData.util';
import { ReportGroup } from 'src/db/entities/ReportGroup.entity';
import { formatTime, formatDate, formatDisplayName } from '@shared/utils/formatting/formatter.util';

export interface KlassAttendanceReportParams {
  userId: number;
  klassId: number; // Single klass ID
  startDate: Date; // ISO date string (required)
  endDate: Date; // ISO date string (required)
  lessonReferenceIds?: number[];
  groupByDate?: boolean;
}

export interface KlassAttendanceReportData extends IDataToExcelReportGenerator {
  klassName: string;
  institutionName: string;
  institutionCode: string;
  sessions: SessionData[];
  students: StudentAttendanceData[];
  startDate: Date;
  endDate: Date;
}

interface SessionData {
  sessionId: number | null; // null for placeholder (no session that day)
  sessionIds?: number[];
  date: Date;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  topic: string;
  lessonCount: number;
  teacherName: string;
  signatureData?: string;
}

interface StudentAttendanceData {
  studentName: string;
  tz: string;
  attendanceMarks: string[]; // 'V', '±', 'X', '--' for each session
}

const buildSessionWhere = (
  userId: number,
  klassId: number,
  lessonReferenceIds: number[] | undefined,
  startDate: Date,
  endDate: Date,
): FindOptionsWhere<ReportGroupSession> => {
  const sessionWhere: FindOptionsWhere<ReportGroupSession> = {
    reportGroup: { userId, klassReferenceId: klassId },
  };
  if (lessonReferenceIds?.length > 0) {
    (sessionWhere.reportGroup as FindOptionsWhere<ReportGroup>).lessonReferenceId = In(lessonReferenceIds);
  }
  sessionWhere.sessionDate = getReportDateFilter(startDate, endDate);
  return sessionWhere;
};

const buildEmptySession = (date: Date): SessionData => ({
  sessionId: null,
  sessionIds: [],
  date,
  dayOfWeek: FORMATTING.getHebrewDayOfWeek(date),
  startTime: '',
  endTime: '',
  topic: '',
  lessonCount: 0,
  teacherName: '',
  signatureData: undefined,
});

const buildGroupedSession = (
  date: Date,
  dateSessions: ReportGroupSession[],
  lessonCountsBySession: Record<number, number>,
): SessionData => {
  const sessionIdsForDay = dateSessions.map((s) => s.id);
  const topics = getUniqueValues(dateSessions, (s) => s?.reportGroup?.lesson?.name).filter(Boolean);
  const teachers = getUniqueValues(dateSessions, (s) => s?.reportGroup?.teacher?.name).filter(Boolean);

  return {
    sessionId: null,
    sessionIds: sessionIdsForDay,
    date,
    dayOfWeek: FORMATTING.getHebrewDayOfWeek(date),
    startTime: '',
    endTime: '',
    topic: topics.join(' + '),
    lessonCount: sessionIdsForDay.reduce((sum, id) => sum + (lessonCountsBySession[id] || 0), 0),
    teacherName: teachers.join(' + '),
    signatureData: dateSessions.find((s) => s?.reportGroup?.signatureData)?.reportGroup?.signatureData,
  };
};

const buildSingleSessions = (
  date: Date,
  dataSessions: ReportGroupSession[],
  lessonCountsBySession: Record<number, number>,
): SessionData[] =>
  dataSessions.map((session) => ({
    sessionId: session.id,
    sessionIds: [session.id],
    date,
    dayOfWeek: FORMATTING.getHebrewDayOfWeek(date),
    startTime: session.startTime || '',
    endTime: session.endTime || '',
    topic: session.reportGroup?.lesson?.name || '',
    lessonCount: lessonCountsBySession[session.id] || 0,
    teacherName: session.reportGroup?.teacher?.name || '',
    signatureData: session.reportGroup?.signatureData,
  }));

const getReportData: IGetReportDataFunction<KlassAttendanceReportParams, KlassAttendanceReportData> = async (
  params,
  dataSource,
): Promise<KlassAttendanceReportData> => {
  console.log('klass attendance report params:', params);

  const { userId, klassId, startDate, endDate, lessonReferenceIds, groupByDate } = params;

  // Fetch all data in parallel
  const sessionWhere = buildSessionWhere(userId, klassId, lessonReferenceIds, startDate, endDate);
  const [user, klass, allSessions] = await Promise.all([
    dataSource.getRepository(User).findOne({ where: { id: userId } }),
    dataSource.getRepository(Klass).findOne({ where: { id: klassId } }),
    dataSource.getRepository(ReportGroupSession).find({
      where: sessionWhere,
      relations: ['reportGroup', 'reportGroup.teacher', 'reportGroup.lesson'],
      order: { sessionDate: 'ASC' },
    }),
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
  const sessionIds = getUniqueValues(allSessions, (s) => s.id);
  const attReports = await dataSource.getRepository(AttReport).find({
    where: { reportGroupSessionId: In(sessionIds) },
    relations: ['student'],
    order: { student: { name: 'ASC' } },
  });

  // Group attendance reports
  const lessonCountsBySession = groupDataByKeysAndCalc(attReports, ['reportGroupSessionId'], (reports) =>
    Math.max(...reports.map((r) => r.howManyLessons || 0), 0),
  );
  const reportsByStudentAndSession = groupDataByKeysAndCalc(
    attReports,
    ['studentReferenceId', 'reportGroupSessionId'],
    (reports) => reports[0],
  );
  const sessionsByDate = groupDataByKeyFn(
    allSessions.filter((s) => lessonCountsBySession[s.id]),
    (s) => formatDate(s.sessionDate),
  );

  // Build sessions list
  const sessions: SessionData[] = getDateRange(startDate, endDate).flatMap((date) => {
    const dateSessions = sessionsByDate[formatDate(date)] || [];
    if (!dateSessions.length) return [buildEmptySession(date)];
    return groupByDate
      ? [buildGroupedSession(date, dateSessions, lessonCountsBySession)]
      : buildSingleSessions(date, dateSessions, lessonCountsBySession);
  });

  // Build student data
  const uniqueStudentIds = getUniqueValues(attReports, (r) => r.studentReferenceId);
  const studentByIdMap = groupDataByKeysAndCalc(attReports, ['studentReferenceId'], (reports) => reports[0].student);
  const uniqueStudents = uniqueStudentIds
    .map((studentId) => studentByIdMap[studentId])
    .filter((s) => s)
    .sort((a, b) => a.name.localeCompare(b.name, 'he'));

  // Build student data with attendance marks (one mark per session column)
  const students: StudentAttendanceData[] = uniqueStudents.map((student) => {
    const attendanceMarks = sessions.map((session) => {
      if (!session.sessionIds?.length) return '';
      const reports = session.sessionIds
        .map((sessionId) => {
          const key = `${student.id}_${sessionId}`;
          return reportsByStudentAndSession[key];
        })
        .filter(Boolean);
      return FORMATTING.getAttendanceMark(reports);
    });

    return {
      studentName: student.name,
      tz: student.tz,
      attendanceMarks,
    };
  });
  console.log(`klass attendance report: built attendance data for ${students.length} students`);

  const klassName = formatDisplayName(klass) || 'לא ידוע';

  // Build and return Excel data
  const excelData = BUILDING.buildExcelData({
    klassName: `${klassName} - ${klass.key}`,
    institutionName: user?.userInfo?.organizationName || 'לא ידוע',
    institutionCode: user?.userInfo?.organizationCode || 'לא ידוע',
    sessions,
    students,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    headerRow: [],
    formattedData: [],
    sheetName: '',
    specialFields: [],
  });

  console.log('Excel data summary:', {
    klassName: excelData.klassName,
    sessionCount: excelData.sessions.length,
    studentCount: excelData.students.length,
    formattedDataRows: excelData.formattedData.length,
    formattedDataPreview: excelData.formattedData.slice(0, 3),
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
  HEADER_OFFSET: 3, // Title rows + spacing
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
      fgColor: { argb: 'FFE6F3FF' },
    },
  },
  subHeaderStyle: {
    font: { bold: true, size: 14, name: 'Arial' },
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl',
    },
  },
  tableHeaderStyle: {
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl',
      wrapText: true,
    },
    font: { name: 'Arial', size: 11, bold: true },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }, // Light gray background
    },
  },
  tableStyle: {
    alignment: {
      horizontal: 'center',
      readingOrder: 'rtl',
      wrapText: true,
    },
    font: { name: 'Arial', size: 11 },
  },
};

const BUILDING = {
  // Build table header section: rows + special fields + borders
  buildTableHeaderSection(sessions: SessionData[]) {
    const dayRow = ['יום בשבוע', ...sessions.map((s) => s.dayOfWeek)];
    const dateRow = ['תאריך', ...sessions.map((s) => s.date.getDate().toString())];
    // const hoursRow = ['שעות לימוד', ...sessions.map(s => `${formatTime(s.startTime)}-${formatTime(s.endTime)}`)];
    // const topicRow = ['שיעור', ...sessions.map(s => s.topic)];
    // const lessonCountRow = ['מס\' שעות לימוד', ...sessions.map(s => s.lessonCount.toString())];
    // const teacherRow = ['שם המורה', ...sessions.map(s => s.teacherName)];
    // const separatorRow = ['', ...sessions.map(() => '--')];

    const rows = [
      dayRow,
      dateRow,
      // hoursRow,
      // topicRow,
      // lessonCountRow,
      // teacherRow,
      // separatorRow
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
            style: STYLING.tableHeaderStyle,
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
        innerBorder: { style: 'thin' } as ExcelJS.Border,
      },
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
      const studentNameAndTz = `${student.studentName} (${student.tz})`;
      const row = [studentNameAndTz, ...student.attendanceMarks];

      row.forEach((cell, colIndex) => {
        if (cell !== '') {
          specialFields.push({
            cell: { r: actualRowIndex, c: colIndex },
            value: cell,
            style: STYLING.tableStyle,
          });
        }
      });
    });

    // Define borders for student name column
    const borderRanges = [
      {
        from: { r: startRow, c: 0 },
        to: { r: lastRow, c: 0 },
        innerBorder: { style: 'thin' } as ExcelJS.Border,
      },
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
    const specialFields = [...headerSection.specialFields, ...dataSection.specialFields];

    // Combine border ranges + add outer border for entire table
    const borderRanges = [
      // Heavy outer border around entire table
      {
        from: { r: ROW_INDEX.TABLE_START, c: 0 },
        to: { r: lastRow, c: lastCol },
        outerBorder: { style: 'medium' } as ExcelJS.Border,
      },
      ...headerSection.borderRanges,
      ...dataSection.borderRanges,
    ];

    return { totalRowCount, specialFields, borderRanges };
  },

  // Build title section: special fields (merged cells) + borders
  buildTitleSection(
    institutionName: string,
    institutionCode: string,
    klassName: string,
    sessionCount: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const titleRow1 = `יומן נוכחות ${institutionName} סמל מוסד ${institutionCode}`;
    const titleRow2 = klassName;
    const dateRangeText = `מתאריך ${startDate ? formatDate(startDate) : ''} עד תאריך ${endDate ? formatDate(endDate) : ''}`;
    const lastCol = sessionCount;

    return {
      specialFields: [
        {
          cell: { r: ROW_INDEX.TITLE_1, c: 0 },
          value: titleRow1,
          style: STYLING.headerStyle,
          merge: { s: { r: ROW_INDEX.TITLE_1, c: 0 }, e: { r: ROW_INDEX.TITLE_1, c: sessionCount } },
        },
        {
          cell: { r: ROW_INDEX.TITLE_2, c: 0 },
          value: titleRow2,
          style: STYLING.subHeaderStyle,
          merge: { s: { r: ROW_INDEX.TITLE_2, c: 0 }, e: { r: ROW_INDEX.TITLE_2, c: sessionCount } },
        },
        {
          cell: { r: ROW_INDEX.SPACING, c: 0 },
          value: dateRangeText,
          style: STYLING.subHeaderStyle,
          merge: { s: { r: ROW_INDEX.SPACING, c: 0 }, e: { r: ROW_INDEX.SPACING, c: sessionCount } },
        },
      ],
      borderRanges: [
        // Heavy border around title rows
        {
          from: { r: ROW_INDEX.TITLE_1, c: 0 },
          to: { r: ROW_INDEX.SPACING, c: lastCol },
          outerBorder: { style: 'medium' } as ExcelJS.Border,
        },
      ],
    };
  },

  // Build signature section: one signature (first available) below the entire table
  buildSignatureSection(sessions: SessionData[], tableEndRow: number) {
    const signatureRow = tableEndRow + 2; // Leave 2 rows spacing after table

    const firstSignature = sessions.find((s) => s.signatureData)?.signatureData;

    const specialFields: ISpecialField[] = [];
    const images: IImageField[] = [];

    if (firstSignature) {
      specialFields.push({
        cell: { r: signatureRow, c: 0 },
        value: 'חתימת המורה',
        style: {
          font: { bold: true, size: 12, name: 'Arial' },
          alignment: {
            horizontal: 'center' as const,
            vertical: 'middle' as const,
            readingOrder: 'rtl' as const,
          },
        },
      });

      images.push({
        imageBase64Data: firstSignature,
        position: {
          tl: { row: signatureRow, col: 1 },
          ext: { width: 120, height: 80 },
        },
      });
    }

    return {
      specialFields,
      images,
      additionalRows: firstSignature ? 8 : 0,
    };
  },

  // Main function - orchestrates building the Excel data structure
  buildExcelData(data: KlassAttendanceReportData): KlassAttendanceReportData {
    const { klassName, institutionName, institutionCode, sessions, students, startDate, endDate } = data;

    console.log('buildExcelData input:', {
      klassName,
      sessionCount: sessions.length,
      studentCount: students.length,
    });

    // 1. Build title section (merged headers + borders)
    const titleSection = BUILDING.buildTitleSection(
      institutionName,
      institutionCode,
      klassName,
      sessions.length,
      startDate,
      endDate,
    );

    // 2. Build complete table section (header rows + student rows + borders)
    const tableSection = BUILDING.buildTableSection(sessions, students);

    // 3. Build signature section - one signature below the table
    const signatureSection = BUILDING.buildSignatureSection(sessions, tableSection.totalRowCount);

    // 4. Combine everything
    const specialFields = [
      ...titleSection.specialFields,
      ...tableSection.specialFields,
      ...signatureSection.specialFields,
    ];
    const borderRanges = [...titleSection.borderRanges, ...tableSection.borderRanges];
    const images = signatureSection.images;

    console.log('buildExcelData output:', {
      rowCount: tableSection.totalRowCount + signatureSection.additionalRows,
      specialFieldCount: specialFields.length,
      borderRangeCount: borderRanges.length,
      imageCount: images.length,
    });

    return {
      klassName,
      institutionName,
      institutionCode,
      sessions,
      students,
      startDate,
      endDate,
      headerRow: [],
      formattedData: [],
      sheetName: klassName || 'יומן נוכחות',
      specialFields,
      borderRanges,
      images,
    };
  },
};

const FORMATTING = {
  getHebrewDayOfWeek(date: Date): string {
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    return days[date.getDay()];
  },

  getAttendanceMark(reports: (AttReport | null | undefined)[]): string {
    const existingReports = reports.filter(Boolean) as AttReport[];
    if (!existingReports.length) return '--'; // No report for this session/day

    const marks = existingReports.map((report) => {
      const absPercent = report.howManyLessons > 0 ? report.absCount / report.howManyLessons : 0;

      if (absPercent === 0) return '3'; // נוכחות מלאה - Full attendance
      if (absPercent < 1.0) return '1'; // איחור - Partial absence (late)
      return '0'; // העדרות מלאה - Full absence
    });

    // Day aggregation rule: show the most severe mark of the day.
    if (marks.includes('0')) return '0';
    if (marks.includes('1')) return '1';
    return '3';
  },
};

const getReportName = (data: KlassAttendanceReportData) => `יומן נוכחות - ${data.klassName}`;
const singleGenerator = new GenericDataToExcelReportGenerator<KlassAttendanceReportParams>(
  getReportName,
  getReportData,
);
const generator = new BulkToZipReportGenerator(() => 'יומני נוכחות', singleGenerator);

export default generator;
