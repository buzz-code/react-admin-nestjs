import * as ExcelJS from 'exceljs';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Klass } from 'src/db/entities/Klass.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import attendanceSheetTemplate, {
  AttendanceSheetTemplateData,
  DATE_COLUMNS_PER_TEACHER,
} from '../attendanceSheetTemplate';
import { parseAttendanceWorkbook } from 'src/utils/attendanceSheet.util';

const data: AttendanceSheetTemplateData = {
  klass: { key: 11, name: 'א1' },
  blocks: [
    { lessonKey: 101, teacherTz: '111', teacherName: 'מורה א' },
    { lessonKey: 102, teacherTz: null, teacherName: null },
  ],
  students: [
    { tz: '900', name: 'תלמידה א' },
    { tz: '901', name: 'תלמידה ב' },
  ],
};

const loadTemplate = async (templateData = data) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await attendanceSheetTemplate.getFileBuffer(templateData));
  return workbook;
};

const YELLOW = 'FFFFF2CC';

describe('attendanceSheetTemplate', () => {
  describe('getFileBuffer', () => {
    it('builds the sheet layout with a block of date columns per lesson', async () => {
      const workbook = await loadTemplate();
      const sheet = workbook.getWorksheet('א1');

      expect(sheet.views[0].rightToLeft).toBe(true);
      expect(sheet.getCell('E2').value).toBe('קוד כיתה:');
      expect(sheet.getCell('F2').value).toBe(11);
      expect(sheet.getCell('D3').value).toBe('מורה א');
      expect(sheet.getCell('D4').value).toBe('111');
      expect(sheet.getCell('D5').value).toBe(101);
      const secondBlock = 4 + DATE_COLUMNS_PER_TEACHER;
      expect(sheet.getCell(5, secondBlock).value).toBe(102);
      expect(sheet.getCell('A9').value).toBe('900');
      expect(sheet.getCell('B10').value).toBe('תלמידה ב');

      const dateCell = sheet.getCell(6, secondBlock + DATE_COLUMNS_PER_TEACHER - 1);
      expect(dateCell.dataValidation.type).toBe('date');
      expect((dateCell.fill as ExcelJS.FillPattern).fgColor.argb).toBe(YELLOW);
      expect(sheet.getCell(10, secondBlock + DATE_COLUMNS_PER_TEACHER - 1).dataValidation.type).toBe('whole');
      expect(sheet.getCell(6, secondBlock + DATE_COLUMNS_PER_TEACHER).dataValidation).toBeUndefined();

      expect(workbook.getWorksheet('הוראות').getCell('A1').value).toBe('הוראות מילוי');
    });

    it('leaves teacher cells empty and yellow when the lesson has no teacher', async () => {
      const sheet = (await loadTemplate()).getWorksheet('א1');
      const secondBlock = 4 + DATE_COLUMNS_PER_TEACHER;
      [3, 4].forEach((row) => {
        const cell = sheet.getCell(row, secondBlock);
        expect(cell.value).toBeNull();
        expect((cell.fill as ExcelJS.FillPattern).fgColor.argb).toBe(YELLOW);
      });
    });

    it('imports a downloaded file filled without other changes with no errors', async () => {
      const workbook = await loadTemplate({ ...data, blocks: [data.blocks[0]] });
      const sheet = workbook.getWorksheet('א1');
      sheet.getCell('D6').value = new Date(Date.UTC(2026, 8, 1));
      sheet.getCell('E6').value = '08/09/26';
      sheet.getCell('D7').value = 2;
      sheet.getCell('D9').value = 1;

      const reloaded = new ExcelJS.Workbook();
      await reloaded.xlsx.load(await workbook.xlsx.writeBuffer());
      const parsed = parseAttendanceWorkbook(reloaded);

      expect(parsed.errors).toEqual([]);
      expect(parsed.sheets).toHaveLength(1);
      expect(parsed.sheets[0].reports.map((r) => [r.studentTz, r.reportDate, r.howManyLessons, r.absCount])).toEqual([
        ['900', '2026-09-01', 2, 1],
        ['900', '2026-09-08', 1, 0],
        ['901', '2026-09-01', 2, 0],
        ['901', '2026-09-08', 1, 0],
      ]);
    });
  });

  describe('getReportData', () => {
    const repos = {
      klass: { findOne: jest.fn() },
      lesson: { find: jest.fn() },
      teacher: { find: jest.fn() },
      studentKlass: { find: jest.fn() },
    };
    const dataSource = {
      getRepository: jest.fn((entity) => {
        switch (entity) {
          case Klass:
            return repos.klass;
          case Lesson:
            return repos.lesson;
          case Teacher:
            return repos.teacher;
          case StudentKlass:
            return repos.studentKlass;
        }
      }),
    } as unknown as DataSource;

    beforeEach(() => {
      jest.clearAllMocks();
      repos.klass.findOne.mockResolvedValue({ id: 1, key: 11, name: 'א1' });
      repos.lesson.find.mockResolvedValue([
        { id: 4, key: 101, teacherReferenceId: 2 },
        { id: 5, key: 102, teacherReferenceId: null },
      ]);
      repos.teacher.find.mockResolvedValue([{ id: 2, tz: '111', name: 'מורה א' }]);
      repos.studentKlass.find.mockResolvedValue([
        { student: { tz: '901', name: 'ת' } },
        { student: { tz: '900', name: 'א' } },
      ]);
    });

    it('fills klass, lesson teachers and klass students for the user', async () => {
      const result = await attendanceSheetTemplate.getReportData(
        { userId: 7, klassId: 1, lessonIds: [4, 5] },
        dataSource,
      );

      expect(result).toEqual({
        klass: { id: 1, key: 11, name: 'א1' },
        blocks: [
          { lessonKey: 101, teacherTz: '111', teacherName: 'מורה א' },
          { lessonKey: 102, teacherTz: null, teacherName: null },
        ],
        students: [
          { tz: '900', name: 'א' },
          { tz: '901', name: 'ת' },
        ],
      });
      expect(repos.klass.findOne.mock.calls[0][0].where).toMatchObject({ id: 1, userId: 7 });
      expect(repos.lesson.find.mock.calls[0][0].where).toMatchObject({ userId: 7 });
      expect(repos.studentKlass.find.mock.calls[0][0].where).toMatchObject({ klassReferenceId: 1, userId: 7 });
    });

    it('rejects a klass of another user or year', async () => {
      repos.klass.findOne.mockResolvedValue(null);
      await expect(
        attendanceSheetTemplate.getReportData({ userId: 7, klassId: 1, lessonIds: [4] }, dataSource),
      ).rejects.toThrow(BadRequestException);
    });

    it('requires at least one lesson', async () => {
      await expect(
        attendanceSheetTemplate.getReportData({ userId: 7, klassId: 1, lessonIds: [] }, dataSource),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
