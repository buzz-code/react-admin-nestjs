import * as ExcelJS from 'exceljs';
import { DataSource } from 'typeorm';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Student } from 'src/db/entities/Student.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import {
  importAttendanceWorkbook,
  parseAttendanceWorkbook,
  parseSheetDate,
  ParsedWorkbook,
} from '../attendanceSheet.util';

interface TestBlock {
  name?: string;
  tz?: string | number;
  lesson?: string | number;
  dates: any[];
  counts?: any[];
  merge?: boolean;
}
interface TestSheet {
  name?: string;
  klass?: any;
  blocks: TestBlock[];
  students: { tz?: string | number; values: any[] }[];
}

// Builds a sheet in the client template layout; student values are listed across all blocks' columns in order
function addSheet(workbook: ExcelJS.Workbook, sheet: TestSheet) {
  const ws = workbook.addWorksheet(sheet.name ?? 'כיתה א');
  ws.getCell('E2').value = 'קוד כיתה:';
  if (sheet.klass !== undefined) ws.getCell('F2').value = sheet.klass;
  ws.getCell('A8').value = 'ת.ז. תלמידה';
  let col = 4;
  const columns: number[] = [];
  sheet.blocks.forEach((block) => {
    const width = block.dates.length;
    if (block.name !== undefined) ws.getCell(3, col).value = block.name;
    if (block.tz !== undefined) ws.getCell(4, col).value = block.tz;
    if (block.lesson !== undefined) ws.getCell(5, col).value = block.lesson;
    if (block.merge && width > 1) {
      [3, 4, 5].forEach((row) => ws.mergeCells(row, col, row, col + width - 1));
    }
    block.dates.forEach((date, index) => {
      if (date !== null) ws.getCell(6, col + index).value = date;
      const count = block.counts?.[index];
      if (count !== undefined) ws.getCell(7, col + index).value = count;
      columns.push(col + index);
    });
    col += width;
  });
  sheet.students.forEach((student, index) => {
    const row = 9 + index;
    if (student.tz !== undefined) ws.getCell(row, 1).value = student.tz;
    student.values.forEach((value, i) => {
      if (value !== null && value !== undefined) ws.getCell(row, columns[i]).value = value;
    });
  });
  return ws;
}

function buildWorkbook(...sheets: TestSheet[]) {
  const workbook = new ExcelJS.Workbook();
  sheets.forEach((sheet) => addSheet(workbook, sheet));
  return workbook;
}

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const messages = (parsed: { errors: { message: string }[] }) => parsed.errors.map((e) => e.message);

describe('parseSheetDate', () => {
  it('parses excel dates, serial numbers and text dates', () => {
    expect(parseSheetDate(d(2026, 9, 1))).toBe('2026-09-01');
    expect(parseSheetDate(46266)).toBe('2026-09-01');
    expect(parseSheetDate('01/09/26')).toBe('2026-09-01');
    expect(parseSheetDate('1/9/2026')).toBe('2026-09-01');
  });

  it('rejects invalid dates', () => {
    expect(parseSheetDate('31/02/26')).toBeNull();
    expect(parseSheetDate('abc')).toBeNull();
    expect(parseSheetDate(5)).toBeNull();
  });
});

describe('parseAttendanceWorkbook', () => {
  it('parses several teacher blocks of different widths', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [
          { name: 'מורה א', tz: '111', lesson: 101, dates: [d(2026, 9, 1), d(2026, 9, 8)], counts: [2], merge: true },
          {
            name: 'מורה ב',
            tz: 222,
            lesson: '102',
            dates: [d(2026, 9, 2), d(2026, 9, 9), d(2026, 9, 16)],
            merge: true,
          },
        ],
        students: [{ tz: '900', values: [1, null, null, 1, null] }],
      }),
    );

    expect(parsed.errors).toEqual([]);
    const [sheet] = parsed.sheets;
    expect(sheet.klassKey).toBe(11);
    expect(sheet.blocks.map((b) => [b.teacherTz, b.lessonKey, b.columns.length])).toEqual([
      ['111', 101, 2],
      ['222', 102, 3],
    ]);
    expect(sheet.reports.map((r) => [r.block.teacherTz, r.reportDate, r.howManyLessons, r.absCount])).toEqual([
      ['111', '2026-09-01', 2, 1],
      ['111', '2026-09-08', 1, 0],
      ['222', '2026-09-02', 1, 0],
      ['222', '2026-09-09', 1, 1],
      ['222', '2026-09-16', 1, 0],
    ]);
  });

  it('parses a file with one teacher', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [{ name: 'מורה א', tz: '111', lesson: 101, dates: ['01/09/26', '08/09/2026'] }],
        students: [{ tz: '900', values: [null, 1] }],
      }),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.sheets[0].reports.map((r) => r.reportDate)).toEqual(['2026-09-01', '2026-09-08']);
  });

  it('assigns a column added at the end of a merged block to the same teacher', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [
          { name: 'מורה א', tz: '111', lesson: 101, dates: [d(2026, 9, 1), d(2026, 9, 8)], merge: true },
          // column inserted by hand after the merged block: no teacher header of its own
          { dates: [d(2026, 9, 15)] },
          { name: 'מורה ב', tz: '222', lesson: 102, dates: [d(2026, 9, 2)] },
        ],
        students: [{ tz: '900', values: [null, null, 1, null] }],
      }),
    );
    expect(parsed.errors).toEqual([]);
    const byDate = (date: string) => parsed.sheets[0].reports.find((r) => r.reportDate === date);
    expect(byDate('2026-09-15')).toMatchObject({ absCount: 1, block: { teacherTz: '111', lessonKey: 101 } });
    expect(byDate('2026-09-02').block.teacherTz).toBe('222');
  });

  it('skips columns without a date, even with values', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [{ name: 'מורה א', tz: '111', lesson: 101, dates: [d(2026, 9, 1), null, null] }],
        students: [{ tz: '900', values: [null, 'x', 1] }],
      }),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.sheets[0].reports).toHaveLength(1);
  });

  it('parses several sheets, skips the instructions sheet and rows without student tz', () => {
    const workbook = buildWorkbook(
      {
        name: 'כיתה א',
        klass: 11,
        blocks: [{ tz: '111', lesson: 101, dates: [d(2026, 9, 1)] }],
        students: [{ tz: '900', values: [] }, { values: [1] }],
      },
      {
        name: 'כיתה ב',
        klass: 12,
        blocks: [{ tz: '111', lesson: 103, dates: [d(2026, 9, 1)] }],
        students: [{ tz: '901', values: [] }],
      },
    );
    workbook.addWorksheet('הוראות').getCell('A1').value = 'הוראות מילוי';

    const parsed = parseAttendanceWorkbook(workbook);
    expect(parsed.errors).toEqual([]);
    expect(parsed.sheets.map((s) => [s.name, s.klassKey, s.reports.length])).toEqual([
      ['כיתה א', 11, 1],
      ['כיתה ב', 12, 1],
    ]);
  });

  it('ignores template blocks that have no dates yet', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [
          { name: 'מורה א', tz: '111', lesson: 101, dates: [d(2026, 9, 1)] },
          { lesson: 102, dates: [null, null] },
        ],
        students: [{ tz: '900', values: [] }],
      }),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.sheets[0].blocks).toHaveLength(1);
  });

  it('reports structural errors with sheet and cell', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        name: 'גיליון',
        blocks: [
          { name: 'מורה א', lesson: 101, dates: [d(2026, 9, 1), 'not a date'], counts: [2] },
          { name: 'מורה ב', tz: '222', dates: [d(2026, 9, 1)] },
        ],
        students: [{ tz: '900', values: [3, null, 'x'] }],
      }),
    );

    expect(parsed.errors).toEqual(
      expect.arrayContaining([
        { sheet: 'גיליון', cell: 'F2', message: 'חסר קוד כיתה' },
        { sheet: 'גיליון', cell: 'D4', message: 'חסרה ת.ז. מורה' },
        { sheet: 'גיליון', cell: 'F5', message: 'חסר קוד שיעור' },
        { sheet: 'גיליון', cell: 'E6', message: 'תאריך "not a date" לא תקין' },
        { sheet: 'גיליון', cell: 'D9', message: 'מספר החיסורים (3) גדול ממספר השיעורים (2)' },
        { sheet: 'גיליון', cell: 'F9', message: 'הערך "x" אינו מספר' },
      ]),
    );
    expect(parsed.errors).toHaveLength(6);
  });

  it('reports the same student, teacher, lesson and date twice as an error', () => {
    const parsed = parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [{ tz: '111', lesson: 101, dates: [d(2026, 9, 1), d(2026, 9, 1)] }],
        students: [{ tz: '900', values: [] }],
      }),
    );
    expect(messages(parsed)).toEqual(['דיווח כפול לאותה תלמידה, מורה, שיעור ותאריך']);
  });
});

describe('importAttendanceWorkbook', () => {
  const userId = 7;
  const year = 5787;
  let repos: Record<string, { find: jest.Mock }>;
  let save: jest.Mock;
  let dataSource: DataSource;

  beforeEach(() => {
    repos = {
      Klass: { find: jest.fn().mockResolvedValue([{ id: 1, key: 11, name: 'א1' }]) },
      Teacher: {
        find: jest.fn().mockResolvedValue([
          { id: 2, tz: '111', name: 'מורה א' },
          { id: 3, tz: '222', name: 'מורה ב' },
        ]),
      },
      Lesson: {
        find: jest.fn().mockResolvedValue([
          { id: 4, key: 101, name: 'שיעור א' },
          { id: 5, key: 102, name: 'שיעור ב' },
        ]),
      },
      Student: {
        find: jest.fn().mockResolvedValue([
          { id: 8, tz: '900', name: 'תלמידה א' },
          { id: 9, tz: '901', name: 'תלמידה ב' },
        ]),
      },
      StudentKlass: { find: jest.fn().mockResolvedValue([{ studentReferenceId: 8, klassReferenceId: 1 }]) },
      AttReport: { find: jest.fn().mockResolvedValue([]) },
    };
    const entities = { Klass, Teacher, Lesson, Student, StudentKlass, AttReport };
    save = jest.fn();
    dataSource = {
      getRepository: jest.fn((entity) => repos[Object.keys(entities).find((k) => entities[k] === entity)]),
      transaction: jest.fn((cb) => cb({ save })),
    } as any;
  });

  const parse = (sheet: Partial<TestSheet>): ParsedWorkbook =>
    parseAttendanceWorkbook(
      buildWorkbook({
        klass: 11,
        blocks: [
          { name: 'מורה א', tz: '111', lesson: 101, dates: [d(2026, 9, 1)] },
          { name: 'מורה ב', tz: '222', lesson: 102, dates: [d(2026, 9, 2)], counts: [2] },
        ],
        students: [
          { tz: '900', values: [1, null] },
          { tz: '901', values: [null, 2] },
        ],
        ...sheet,
      }),
    );

  it('creates a report per student and dated column, filtered by user', async () => {
    const result = await importAttendanceWorkbook(dataSource, userId, parse({}), year);

    expect(result).toMatchObject({ success: true, errors: [], created: 4, updated: 0 });
    expect(result.details).toEqual([
      {
        sheet: 'כיתה א',
        teacherTz: '111',
        teacherName: 'מורה א',
        lessonKey: 101,
        lessonName: 'שיעור א',
        created: 2,
        updated: 0,
      },
      {
        sheet: 'כיתה א',
        teacherTz: '222',
        teacherName: 'מורה ב',
        lessonKey: 102,
        lessonName: 'שיעור ב',
        created: 2,
        updated: 0,
      },
    ]);
    Object.values(repos).forEach((repo) =>
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) })),
    );
    expect(repos.Klass.find.mock.calls[0][0].where.year).toBe(year);
    expect(repos.Lesson.find.mock.calls[0][0].where.year).toBe(year);

    const [, saved, options] = save.mock.calls[0];
    expect(options).toMatchObject({ listeners: false });
    expect(saved[0]).toEqual({
      userId,
      year: 5787,
      studentTz: '900',
      studentReferenceId: 8,
      teacherId: '111',
      teacherReferenceId: 2,
      klassId: 11,
      klassReferenceId: 1,
      lessonId: 101,
      lessonReferenceId: 4,
      reportDate: '2026-09-01',
      howManyLessons: 1,
      absCount: 1,
    });
    expect(saved.map((r) => [r.howManyLessons, r.absCount])).toEqual([
      [1, 1],
      [2, 0],
      [1, 0],
      [2, 2],
    ]);
  });

  it('updates existing reports on re-upload instead of duplicating', async () => {
    repos.AttReport.find.mockResolvedValue([
      { id: 50, studentReferenceId: 8, teacherReferenceId: 2, lessonReferenceId: 4, reportDate: '2026-09-01' },
    ]);

    const result = await importAttendanceWorkbook(dataSource, userId, parse({}), year);

    expect(result).toMatchObject({ success: true, created: 3, updated: 1 });
    expect(result.details[0]).toMatchObject({ created: 1, updated: 1 });
    const saved = save.mock.calls[0][1];
    expect(saved).toHaveLength(4);
    expect(saved.filter((r) => r.id)).toEqual([expect.objectContaining({ id: 50, absCount: 1 })]);
  });

  it('saves nothing and lists every unknown klass, teacher, lesson and student', async () => {
    repos.Klass.find.mockResolvedValue([]);
    repos.Teacher.find.mockResolvedValue([{ id: 2, tz: '111' }]);
    repos.Lesson.find.mockResolvedValue([{ id: 4, key: 101 }]);
    repos.Student.find.mockResolvedValue([{ id: 8, tz: '900' }]);

    const result = await importAttendanceWorkbook(dataSource, userId, parse({}), year);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      { sheet: 'כיתה א', cell: 'F2', message: 'קוד כיתה 11 לא קיים בשנה הנוכחית' },
      { sheet: 'כיתה א', cell: 'E4', message: 'ת.ז. מורה 222 לא קיימת' },
      { sheet: 'כיתה א', cell: 'E5', message: 'קוד שיעור 102 לא קיים בשנה הנוכחית' },
      { sheet: 'כיתה א', cell: 'A10', message: 'ת.ז. תלמידה 901 לא קיימת' },
    ]);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('saves nothing when the file has structural errors', async () => {
    const result = await importAttendanceWorkbook(dataSource, userId, parse({ klass: undefined }), year);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual([{ sheet: 'כיתה א', cell: 'F2', message: 'חסר קוד כיתה' }]);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('warns without blocking when a student is not assigned to the sheet klass', async () => {
    const result = await importAttendanceWorkbook(dataSource, userId, parse({}), year);
    expect(result.success).toBe(true);
    expect(result.warnings).toEqual([
      { sheet: 'כיתה א', cell: 'A10', message: 'התלמידה תלמידה ב (901) לא משויכת לכיתה א1' },
    ]);
  });
});
