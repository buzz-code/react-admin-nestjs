import * as ExcelJS from 'exceljs';
import { DataSource, In } from 'typeorm';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Student } from 'src/db/entities/Student.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { getCurrentHebrewYear, getHebrewYearByGregorianDate } from '@shared/utils/entity/year.util';

// Attendance sheet layout (1-based rows/columns, as in Excel)
export const KLASS_LABEL_CELL = 'E2';
export const KLASS_VALUE_CELL = 'F2';
export const TEACHER_NAME_ROW = 3;
export const TEACHER_TZ_ROW = 4;
export const LESSON_KEY_ROW = 5;
export const DATE_ROW = 6;
export const LESSONS_COUNT_ROW = 7;
export const HEADER_ROW = 8;
export const FIRST_STUDENT_ROW = 9;
export const STUDENT_TZ_COL = 1;
export const FIRST_BLOCK_COL = 4;
export const KLASS_LABEL = 'קוד כיתה:';

export interface SheetIssue {
  sheet: string;
  cell: string;
  message: string;
}

export interface ParsedColumn {
  col: number;
  dateCell: string;
  reportDate: string;
  howManyLessons: number;
}

export interface ParsedBlock {
  teacherTz: string | null;
  teacherName: string | null;
  teacherCell: string;
  lessonKey: number | null;
  lessonValue: any;
  lessonCell: string;
  columns: ParsedColumn[];
}

export interface ParsedReport {
  cell: string;
  studentTz: string;
  studentCell: string;
  block: ParsedBlock;
  reportDate: string;
  howManyLessons: number;
  absCount: number;
}

export interface ParsedSheet {
  name: string;
  klassKey: number | null;
  blocks: ParsedBlock[];
  reports: ParsedReport[];
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
  errors: SheetIssue[];
}

export interface AttendanceSheetSummaryRow {
  sheet: string;
  teacherTz: string;
  teacherName: string;
  lessonKey: number;
  lessonName: string;
  created: number;
  updated: number;
}

export interface AttendanceSheetPreviewRow {
  sheet: string;
  cell: string;
  studentTz: string;
  studentName: string;
  teacherName: string;
  lessonName: string;
  reportDate: string;
  howManyLessons: number;
  absCount: number;
  isUpdate: boolean;
}

export interface AttendanceSheetImportResult {
  success: boolean;
  errors: SheetIssue[];
  warnings: SheetIssue[];
  created: number;
  updated: number;
  details: AttendanceSheetSummaryRow[];
  // dry run only: the reports that would be saved
  rows?: AttendanceSheetPreviewRow[];
}

const isEmpty = (value: any) => value === null || value === undefined;

// Reads a cell's own value: merged slave cells count as empty, formulas/rich text are unwrapped
export function getCellValue(cell: ExcelJS.Cell): any {
  if (cell.isMerged && cell.master.address !== cell.address) {
    return null;
  }
  let value: any = cell.value;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    if ('result' in value) value = value.result;
    else if ('richText' in value) value = value.richText.map((part) => part.text).join('');
    else if ('text' in value) value = value.text;
    else if ('error' in value) value = String(value.error);
  }
  if (typeof value === 'string') {
    value = value.trim();
    if (value === '') return null;
  }
  return value ?? null;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toYmd = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;
const isSaneYear = (year: number) => year >= 2000 && year <= 2100;

// Accepts Excel dates, Excel serial numbers and dd/mm/yy or dd/mm/yyyy text; returns YYYY-MM-DD or null
export function parseSheetDate(value: any): string | null {
  if (value instanceof Date) {
    if (isNaN(value.getTime()) || !isSaneYear(value.getUTCFullYear())) return null;
    return toYmd(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }
  if (typeof value === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
    return parseSheetDate(date);
  }
  if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2}|\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return parseSheetDate(date);
  }
  return null;
}

// null = empty cell, NaN = not a number
export function parseSheetNumber(value: any): number | null {
  if (isEmpty(value)) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) return Number(value);
  return NaN;
}

const parseTz = (value: any): string | null => (isEmpty(value) ? null : String(value).replace(/\s/g, ''));

const isAttendanceSheet = (worksheet: ExcelJS.Worksheet) => {
  const label = getCellValue(worksheet.getCell(KLASS_LABEL_CELL));
  return (
    (typeof label === 'string' && label.includes('קוד כיתה')) ||
    !isEmpty(getCellValue(worksheet.getCell(KLASS_VALUE_CELL)))
  );
};

export function parseAttendanceWorkbook(workbook: ExcelJS.Workbook): ParsedWorkbook {
  const sheets: ParsedSheet[] = [];
  const errors: SheetIssue[] = [];
  const seenReports = new Set<string>();

  workbook.eachSheet((worksheet) => {
    if (!isAttendanceSheet(worksheet)) return;

    const sheetName = worksheet.name;
    const addError = (cell: string, message: string) => errors.push({ sheet: sheetName, cell, message });
    const cellAt = (row: number, col: number) => worksheet.getCell(row, col);

    const blocks: ParsedBlock[] = [];
    let block: ParsedBlock = null;
    for (let col = FIRST_BLOCK_COL; col <= worksheet.columnCount; col++) {
      const teacherName = getCellValue(cellAt(TEACHER_NAME_ROW, col));
      const teacherTz = getCellValue(cellAt(TEACHER_TZ_ROW, col));
      const lessonValue = getCellValue(cellAt(LESSON_KEY_ROW, col));
      // A new block starts where teacher name, teacher tz or lesson key is filled (merged slave cells read as empty)
      if (!isEmpty(teacherName) || !isEmpty(teacherTz) || !isEmpty(lessonValue) || !block) {
        const lessonKey = parseSheetNumber(lessonValue);
        block = {
          teacherTz: parseTz(teacherTz),
          teacherName: isEmpty(teacherName) ? null : String(teacherName),
          teacherCell: cellAt(TEACHER_TZ_ROW, col).address,
          lessonKey: Number.isInteger(lessonKey) ? lessonKey : null,
          lessonValue,
          lessonCell: cellAt(LESSON_KEY_ROW, col).address,
          columns: [],
        };
        blocks.push(block);
      }

      const dateCell = cellAt(DATE_ROW, col);
      const dateValue = getCellValue(dateCell);
      if (isEmpty(dateValue)) continue;
      const reportDate = parseSheetDate(dateValue);
      if (!reportDate) {
        addError(dateCell.address, `תאריך "${dateValue}" לא תקין`);
        continue;
      }
      const howManyCell = cellAt(LESSONS_COUNT_ROW, col);
      const howManyLessons = parseSheetNumber(getCellValue(howManyCell)) ?? 1;
      if (isNaN(howManyLessons) || howManyLessons <= 0) {
        addError(howManyCell.address, 'מספר השיעורים אינו מספר תקין');
        continue;
      }
      block.columns.push({ col, dateCell: dateCell.address, reportDate, howManyLessons });
    }

    const activeBlocks = blocks.filter((b) => b.columns.length);
    activeBlocks.forEach((b) => {
      if (!b.teacherTz) addError(b.teacherCell, 'חסרה ת.ז. מורה');
      if (b.lessonKey === null) {
        addError(b.lessonCell, isEmpty(b.lessonValue) ? 'חסר קוד שיעור' : `קוד שיעור "${b.lessonValue}" לא תקין`);
      }
    });

    const klassValue = getCellValue(worksheet.getCell(KLASS_VALUE_CELL));
    const klassKey = parseSheetNumber(klassValue);
    const sheet: ParsedSheet = {
      name: sheetName,
      klassKey: Number.isInteger(klassKey) ? klassKey : null,
      blocks: activeBlocks,
      reports: [],
    };
    if (activeBlocks.length && sheet.klassKey === null) {
      addError(KLASS_VALUE_CELL, isEmpty(klassValue) ? 'חסר קוד כיתה' : `קוד כיתה "${klassValue}" לא תקין`);
    }

    for (let row = FIRST_STUDENT_ROW; row <= worksheet.rowCount; row++) {
      const studentCell = cellAt(row, STUDENT_TZ_COL);
      const studentTz = parseTz(getCellValue(studentCell));
      if (!studentTz) continue;

      activeBlocks.forEach((b) =>
        b.columns.forEach((column) => {
          const cell = cellAt(row, column.col);
          const rawValue = getCellValue(cell);
          const absCount = parseSheetNumber(rawValue) ?? 0;
          if (isNaN(absCount)) {
            addError(cell.address, `הערך "${rawValue}" אינו מספר`);
            return;
          }
          if (absCount > column.howManyLessons) {
            addError(cell.address, `מספר החיסורים (${absCount}) גדול ממספר השיעורים (${column.howManyLessons})`);
            return;
          }
          const reportKey = [studentTz, b.teacherTz, b.lessonKey, column.reportDate].join('|');
          if (seenReports.has(reportKey)) {
            addError(cell.address, 'דיווח כפול לאותה תלמידה, מורה, שיעור ותאריך');
            return;
          }
          seenReports.add(reportKey);
          sheet.reports.push({
            cell: cell.address,
            studentTz,
            studentCell: studentCell.address,
            block: b,
            reportDate: column.reportDate,
            howManyLessons: column.howManyLessons,
            absCount,
          });
        }),
      );
    }

    sheets.push(sheet);
  });

  return { sheets, errors };
}

const uniq = <T>(values: T[]) => [...new Set(values.filter((v) => !isEmpty(v)))];

const findByKeys = async <T>(dataSource: DataSource, entity: any, where: any, values: any[], field: string) => {
  if (!values.length) return [] as T[];
  return dataSource.getRepository(entity).find({ where: { ...where, [field]: In(values) } }) as Promise<T[]>;
};

const toDateKey = (value: string | Date) =>
  value instanceof Date
    ? toYmd(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate())
    : String(value).slice(0, 10);

const getReportKey = (studentId: number, teacherId: number, lessonId: number, reportDate: string | Date) =>
  [studentId, teacherId, lessonId, toDateKey(reportDate)].join('|');

const getYearByDate = (reportDate: string) => {
  const [year, month, day] = reportDate.split('-').map(Number);
  return getHebrewYearByGregorianDate(new Date(year, month - 1, day));
};

export async function importAttendanceWorkbook(
  dataSource: DataSource,
  userId: number,
  parsed: ParsedWorkbook,
  { dryRun = false, year = getCurrentHebrewYear() } = {},
): Promise<AttendanceSheetImportResult> {
  const errors: SheetIssue[] = [...parsed.errors];
  const warnings: SheetIssue[] = [];
  const result = (success: boolean, created = 0, updated = 0, details: AttendanceSheetSummaryRow[] = []) => ({
    success,
    errors,
    warnings,
    created,
    updated,
    details,
  });

  const sheets = parsed.sheets.filter((sheet) => sheet.blocks.length);
  if (!sheets.length && !errors.length) {
    errors.push({ sheet: '', cell: '', message: 'לא נמצאו בקובץ עמודות עם תאריך לקליטה' });
  }
  const allBlocks = sheets.flatMap((sheet) => sheet.blocks);
  const allReports = sheets.flatMap((sheet) => sheet.reports);

  const [klasses, teachers, lessons, students] = await Promise.all([
    findByKeys<Klass>(dataSource, Klass, { userId, year }, uniq(sheets.map((s) => s.klassKey)), 'key'),
    findByKeys<Teacher>(dataSource, Teacher, { userId }, uniq(allBlocks.map((b) => b.teacherTz)), 'tz'),
    findByKeys<Lesson>(dataSource, Lesson, { userId, year }, uniq(allBlocks.map((b) => b.lessonKey)), 'key'),
    findByKeys<Student>(dataSource, Student, { userId }, uniq(allReports.map((r) => r.studentTz)), 'tz'),
  ]);
  const klassByKey = new Map(klasses.map((k) => [k.key, k]));
  const teacherByTz = new Map(teachers.map((t) => [t.tz, t]));
  const lessonByKey = new Map(lessons.map((l) => [l.key, l]));
  const studentByTz = new Map(students.map((s) => [s.tz, s]));

  sheets.forEach((sheet) => {
    const addError = (cell: string, message: string) => errors.push({ sheet: sheet.name, cell, message });
    if (sheet.klassKey !== null && !klassByKey.has(sheet.klassKey)) {
      addError(KLASS_VALUE_CELL, `קוד כיתה ${sheet.klassKey} לא קיים בשנה הנוכחית`);
    }
    sheet.blocks.forEach((block) => {
      if (block.teacherTz && !teacherByTz.has(block.teacherTz)) {
        addError(block.teacherCell, `ת.ז. מורה ${block.teacherTz} לא קיימת`);
      }
      if (block.lessonKey !== null && !lessonByKey.has(block.lessonKey)) {
        addError(block.lessonCell, `קוד שיעור ${block.lessonKey} לא קיים בשנה הנוכחית`);
      }
    });
    uniq(sheet.reports.map((r) => r.studentCell)).forEach((studentCell) => {
      const report = sheet.reports.find((r) => r.studentCell === studentCell);
      if (!studentByTz.has(report.studentTz)) {
        addError(studentCell, `ת.ז. תלמידה ${report.studentTz} לא קיימת`);
      }
    });
  });

  if (errors.length) {
    return result(false);
  }
  if (!allReports.length) {
    return result(true);
  }

  const studentKlasses = await findByKeys<StudentKlass>(
    dataSource,
    StudentKlass,
    { userId, year, studentReferenceId: In(students.map((s) => s.id)) },
    klasses.map((k) => k.id),
    'klassReferenceId',
  );
  const studentKlassSet = new Set(studentKlasses.map((sk) => `${sk.studentReferenceId}|${sk.klassReferenceId}`));
  sheets.forEach((sheet) => {
    const klass = klassByKey.get(sheet.klassKey);
    uniq(sheet.reports.map((r) => r.studentTz)).forEach((studentTz) => {
      const student = studentByTz.get(studentTz);
      if (!studentKlassSet.has(`${student.id}|${klass.id}`)) {
        const report = sheet.reports.find((r) => r.studentTz === studentTz);
        warnings.push({
          sheet: sheet.name,
          cell: report.studentCell,
          message: `התלמידה ${student.name} (${studentTz}) לא משויכת לכיתה ${klass.name}`,
        });
      }
    });
  });

  const existingReports = await dataSource.getRepository(AttReport).find({
    where: {
      userId,
      studentReferenceId: In(students.map((s) => s.id)),
      teacherReferenceId: In(teachers.map((t) => t.id)),
      lessonReferenceId: In(lessons.map((l) => l.id)),
      reportDate: In(uniq(allReports.map((r) => r.reportDate))) as any,
    },
    select: { id: true, studentReferenceId: true, teacherReferenceId: true, lessonReferenceId: true, reportDate: true },
  });
  const existingIdByKey = new Map<string, number>();
  existingReports.forEach((r) => {
    const key = getReportKey(r.studentReferenceId, r.teacherReferenceId, r.lessonReferenceId, r.reportDate);
    if (!existingIdByKey.has(key)) existingIdByKey.set(key, r.id);
  });

  const summary = new Map<string, AttendanceSheetSummaryRow>();
  const toSave: Partial<AttReport>[] = [];
  const rows: AttendanceSheetPreviewRow[] = [];
  let created = 0;
  let updated = 0;
  sheets.forEach((sheet) => {
    const klass = klassByKey.get(sheet.klassKey);
    sheet.reports.forEach((report) => {
      const student = studentByTz.get(report.studentTz);
      const teacher = teacherByTz.get(report.block.teacherTz);
      const lesson = lessonByKey.get(report.block.lessonKey);
      const existingId = existingIdByKey.get(getReportKey(student.id, teacher.id, lesson.id, report.reportDate));

      toSave.push({
        ...(existingId ? { id: existingId } : {}),
        userId,
        year: getYearByDate(report.reportDate),
        studentTz: student.tz,
        studentReferenceId: student.id,
        teacherId: teacher.tz,
        teacherReferenceId: teacher.id,
        klassId: klass.key,
        klassReferenceId: klass.id,
        lessonId: lesson.key,
        lessonReferenceId: lesson.id,
        reportDate: report.reportDate as any,
        howManyLessons: report.howManyLessons,
        absCount: report.absCount,
      });

      rows.push({
        sheet: sheet.name,
        cell: report.cell,
        studentTz: student.tz,
        studentName: student.name,
        teacherName: teacher.name,
        lessonName: lesson.name,
        reportDate: report.reportDate,
        howManyLessons: report.howManyLessons,
        absCount: report.absCount,
        isUpdate: Boolean(existingId),
      });

      const summaryKey = [sheet.name, teacher.id, lesson.id].join('|');
      if (!summary.has(summaryKey)) {
        summary.set(summaryKey, {
          sheet: sheet.name,
          teacherTz: teacher.tz,
          teacherName: teacher.name,
          lessonKey: lesson.key,
          lessonName: lesson.name,
          created: 0,
          updated: 0,
        });
      }
      const row = summary.get(summaryKey);
      if (existingId) {
        row.updated++;
        updated++;
      } else {
        row.created++;
        created++;
      }
    });
  });

  if (dryRun) {
    return { ...result(true, created, updated, [...summary.values()]), rows };
  }

  // Reference ids are resolved above, so entity listeners (one DB connection per row) are skipped
  await dataSource.transaction((manager) =>
    manager.save(AttReport, toSave as AttReport[], { listeners: false, chunk: 500 }),
  );

  return result(true, created, updated, [...summary.values()]);
}
