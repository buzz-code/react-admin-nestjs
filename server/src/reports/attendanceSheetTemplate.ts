import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { BaseReportGenerator, IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { getIntegerDataValidation } from '@shared/utils/report/data-to-excel.generator';
import { CommonFileFormat } from '@shared/utils/report/types';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { Klass } from 'src/db/entities/Klass.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import {
  DATE_ROW,
  FIRST_BLOCK_COL,
  FIRST_STUDENT_ROW,
  HEADER_ROW,
  KLASS_LABEL,
  KLASS_LABEL_CELL,
  KLASS_VALUE_CELL,
  LESSON_KEY_ROW,
  LESSONS_COUNT_ROW,
  STUDENT_TZ_COL,
  TEACHER_NAME_ROW,
  TEACHER_TZ_ROW,
} from 'src/utils/attendanceSheet.util';

export const DATE_COLUMNS_PER_TEACHER = 10;

export interface AttendanceSheetTemplateParams {
  userId: number;
  klassId: number;
  lessonIds: number[];
}

export interface AttendanceSheetTemplateData {
  klass: Pick<Klass, 'key' | 'name'>;
  blocks: { lessonKey: number; teacherTz: string | null; teacherName: string | null }[];
  students: { tz: string; name: string }[];
}

const getReportData: IGetReportDataFunction<AttendanceSheetTemplateParams, AttendanceSheetTemplateData> = async (
  params,
  dataSource,
) => {
  const year = getCurrentHebrewYear();
  const klass = await dataSource
    .getRepository(Klass)
    .findOne({ where: { id: params.klassId, userId: params.userId, year } });
  if (!klass) {
    throw new BadRequestException('יש לבחור כיתה מהשנה הנוכחית');
  }
  const lessons = params.lessonIds.length
    ? await dataSource
        .getRepository(Lesson)
        .find({ where: { id: In(params.lessonIds), userId: params.userId }, order: { key: 'ASC' } })
    : [];
  if (!lessons.length) {
    throw new BadRequestException('יש לבחור לפחות שיעור אחד');
  }
  const teacherIds = lessons.map((l) => l.teacherReferenceId).filter(Boolean);
  const [teachers, studentKlasses] = await Promise.all([
    teacherIds.length
      ? dataSource.getRepository(Teacher).find({ where: { id: In(teacherIds), userId: params.userId } })
      : ([] as Teacher[]),
    dataSource.getRepository(StudentKlass).find({
      where: { klassReferenceId: klass.id, userId: params.userId, year },
      relations: { student: true },
    }),
  ]);
  const teacherById = new Map(teachers.map((t) => [t.id, t]));

  return {
    klass,
    blocks: lessons.map((lesson) => {
      const teacher = teacherById.get(lesson.teacherReferenceId);
      return { lessonKey: lesson.key, teacherTz: teacher?.tz ?? null, teacherName: teacher?.name ?? null };
    }),
    students: studentKlasses
      .map((sk) => sk.student)
      .filter(Boolean)
      .map((s) => ({ tz: s.tz, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'he')),
  };
};

const fill = (argb: string): ExcelJS.Fill => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const REQUIRED_FILL = fill('FFFFF2CC');
const LABEL_FILL = fill('FFD9E1F2');
const TEACHER_FILL = fill('FFE2EFDA');
const thin: Partial<ExcelJS.Border> = { style: 'thin' };
const BORDER: Partial<ExcelJS.Borders> = { top: thin, bottom: thin, left: thin, right: thin };

const getDateValidation = (): ExcelJS.DataValidation => ({
  type: 'date',
  operator: 'greaterThan',
  formulae: [new Date(2000, 0, 1)],
  allowBlank: true,
  showErrorMessage: true,
  errorStyle: 'stop',
  errorTitle: 'הערך אינו תאריך תקין',
  error: 'יש להזין תאריך, לדוגמה 01/09/26',
});

const instructions = [
  'הוראות מילוי',
  'כל גיליון = כיתה אחת. כל מורה = בלוק עמודות. אפשר להוסיף גיליונות לכיתות נוספות ובלוקים למורות נוספות.',
  'תאים צהובים = חובה למלא.',
  '',
  'ברמת הגיליון:',
  'קוד כיתה – הקוד מתוך מסך הכיתות.',
  'ת.ז. תלמידה – בעמודה A, לכל תלמידה. שם התלמידה לנוחות בלבד.',
  '',
  'לכל מורה:',
  'ת.ז. מורה – כפי שמופיעה במסך המורות.',
  'קוד שיעור – הקוד מתוך מסך השיעורים.',
  'תאריך – בראש כל עמודה, תאריך השיעור. עמודה ריקה מתאריך לא תיקלט.',
  "מס' שיעורים – כמה שיעורים התקיימו באותו תאריך (ברירת מחדל 1).",
  'אפשר להוסיף עמודות בתוך הבלוק של המורה, לפני העמודה של המורה הבאה.',
  '',
  'סימון בתאי התלמידות:',
  'ריק = נוכחת בכל השיעורים.',
  "מספר = כמה שיעורים התלמידה חיסרה באותו תאריך (לא יותר ממס' השיעורים).",
];

const sanitizeSheetName = (name: string) => name.replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31) || 'כיתה';

export class AttendanceSheetTemplateGenerator extends BaseReportGenerator<
  AttendanceSheetTemplateParams,
  AttendanceSheetTemplateData
> {
  fileFormat = CommonFileFormat.Excel;

  async getFileBuffer(data: AttendanceSheetTemplateData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sanitizeSheetName(data.klass.name), {
      views: [{ rightToLeft: true, state: 'frozen', xSplit: 3, ySplit: HEADER_ROW }],
    });
    const lastStudentRow = FIRST_STUDENT_ROW + Math.max(data.students.length, 1) - 1;
    const lastCol = FIRST_BLOCK_COL + data.blocks.length * DATE_COLUMNS_PER_TEACHER - 1;

    sheet.getCell('A1').value = 'ב"ה';
    sheet.getCell('B2').value = `נוכחות ${data.klass.name}`;
    sheet.getCell('B2').font = { bold: true };
    sheet.getCell(KLASS_LABEL_CELL).value = KLASS_LABEL;
    sheet.getCell(KLASS_LABEL_CELL).font = { bold: true };
    Object.assign(sheet.getCell(KLASS_VALUE_CELL), { value: data.klass.key, fill: REQUIRED_FILL, border: BORDER });

    const labels: [number, string][] = [
      [TEACHER_NAME_ROW, 'שם מורה'],
      [TEACHER_TZ_ROW, 'ת.ז. מורה'],
      [LESSON_KEY_ROW, 'קוד שיעור'],
      [DATE_ROW, 'תאריך'],
      [LESSONS_COUNT_ROW, "מס' שיעורים"],
    ];
    labels.forEach(([row, label]) =>
      Object.assign(sheet.getCell(row, 3), { value: label, fill: LABEL_FILL, font: { bold: true }, border: BORDER }),
    );
    ['ת.ז. תלמידה', 'שם התלמידה', ''].forEach((label, index) =>
      Object.assign(sheet.getCell(HEADER_ROW, index + 1), {
        value: label,
        fill: LABEL_FILL,
        font: { bold: true },
        border: BORDER,
      }),
    );

    data.students.forEach((student, index) => {
      const row = FIRST_STUDENT_ROW + index;
      Object.assign(sheet.getCell(row, STUDENT_TZ_COL), { value: student.tz, fill: REQUIRED_FILL, border: BORDER });
      Object.assign(sheet.getCell(row, 2), { value: student.name, border: BORDER });
      sheet.getCell(row, 3).border = BORDER;
    });

    data.blocks.forEach((block, index) => {
      const startCol = FIRST_BLOCK_COL + index * DATE_COLUMNS_PER_TEACHER;
      const endCol = startCol + DATE_COLUMNS_PER_TEACHER - 1;
      const headerCells: [number, any, ExcelJS.Fill][] = [
        [TEACHER_NAME_ROW, block.teacherName, block.teacherName ? TEACHER_FILL : REQUIRED_FILL],
        [TEACHER_TZ_ROW, block.teacherTz, REQUIRED_FILL],
        [LESSON_KEY_ROW, block.lessonKey, REQUIRED_FILL],
      ];
      headerCells.forEach(([row, value, cellFill]) => {
        sheet.mergeCells(row, startCol, row, endCol);
        Object.assign(sheet.getCell(row, startCol), {
          value,
          fill: cellFill,
          font: { bold: row === TEACHER_NAME_ROW },
          alignment: { horizontal: 'center' },
          border: BORDER,
        });
      });
      for (let col = startCol; col <= endCol; col++) {
        Object.assign(sheet.getCell(DATE_ROW, col), {
          fill: REQUIRED_FILL,
          border: BORDER,
          numFmt: 'dd/mm/yy',
          dataValidation: getDateValidation(),
        });
        Object.assign(sheet.getCell(LESSONS_COUNT_ROW, col), {
          fill: REQUIRED_FILL,
          border: BORDER,
          dataValidation: getIntegerDataValidation(),
        });
        for (let row = FIRST_STUDENT_ROW; row <= lastStudentRow; row++) {
          Object.assign(sheet.getCell(row, col), { border: BORDER, dataValidation: getIntegerDataValidation() });
        }
      }
    });

    sheet.getColumn(1).width = 13;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 13;
    for (let col = FIRST_BLOCK_COL; col <= lastCol; col++) {
      sheet.getColumn(col).width = 9;
    }

    const instructionsSheet = workbook.addWorksheet('הוראות', { views: [{ rightToLeft: true }] });
    instructions.forEach((line, index) => (instructionsSheet.getCell(index + 1, 1).value = line));
    instructionsSheet.getCell('A1').font = { bold: true, size: 14 };
    instructionsSheet.getColumn(1).width = 100;

    return workbook.xlsx.writeBuffer().then((buffer) => Buffer.from(buffer));
  }
}

const getReportName = (data: AttendanceSheetTemplateData) => `נוכחות ${data.klass.name}`;

export default new AttendanceSheetTemplateGenerator(getReportName, getReportData);
