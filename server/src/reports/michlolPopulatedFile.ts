import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { DataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { In } from 'typeorm';
import { Grade } from 'src/db/entities/Grade.entity';
import * as path from 'path';
import { Student } from 'src/db/entities/Student.entity';
import { calcAvg, groupDataByKeysAndCalc } from 'src/utils/reportData.util';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';

export interface MichlolPopulatedFileParams {
    userId: number;
    michlolFileName: string;
    michlolFileData: { [key: string]: string }[];
}
export interface MichlolPopulatedFileData extends IDataToExcelReportGenerator {
    lesson: Partial<Lesson>;
    filename: string;
    extension: string;
}
const getReportData: IGetReportDataFunction = async (params: MichlolPopulatedFileParams, dataSource): Promise<MichlolPopulatedFileData> => {
    const extension = path.extname(params.michlolFileName);
    const filename = path.basename(params.michlolFileName, extension);

    const lessonKey = params.michlolFileData[0]['D'];
    const studentTzs = params.michlolFileData.slice(3).map(row => row['B']).filter(Boolean);

    const [lesson, students] = await Promise.all([
        dataSource.getRepository(Lesson).findOne({ where: { userId: params.userId, key: Number(lessonKey) }, select: { id: true } }),
        dataSource.getRepository(Student).find({ where: { userId: params.userId, tz: In(studentTzs) }, select: { id: true, tz: true } }),
    ]);

    if (!lesson) {
        throw new Error('שיעור לא נמצא');
    }
    if (!students.length) {
        throw new Error('תלמידים לא נמצאים');
    }

    const grades = await dataSource
        .getRepository(Grade)
        .find({
            where: {
                studentReferenceId: In(students.map(s => s.id)),
                lessonReferenceId: lesson.id,
                year: getCurrentHebrewYear(),
            },
            select: { id: true, studentReferenceId: true, grade: true },
        });

    const studentGradeMap = groupDataByKeysAndCalc(grades, ['studentReferenceId'], (arr) => Math.round(calcAvg(arr, item => item.grade)));
    const studentIdMap = groupDataByKeysAndCalc(students, ['tz'], (arr) => arr[0].id);

    const updatedData = params.michlolFileData.map(row => {
        const studentId = studentIdMap[row['B']];
        return {
            ...row,
            E: studentGradeMap[studentId] ?? row['E'],
        };
    });

    const specialFields = updatedData.map((row, index) => ([
        { cell: { c: 0, r: index }, value: row['A'] },
        { cell: { c: 1, r: index }, value: row['B'] },
        { cell: { c: 2, r: index }, value: row['C'] },
        { cell: { c: 3, r: index }, value: row['D'] },
        { cell: { c: 4, r: index }, value: row['E'] },
        { cell: { c: 5, r: index }, value: row['F'] },
        { cell: { c: 6, r: index }, value: row['G'] },
        { cell: { c: 7, r: index }, value: row['H'] },
        { cell: { c: 8, r: index }, value: row['I'] },
        { cell: { c: 9, r: index }, value: row['J'] },
        { cell: { c: 10, r: index }, value: row['K'] },
        { cell: { c: 11, r: index }, value: row['L'] },
        { cell: { c: 12, r: index }, value: row['M'] },
        { cell: { c: 13, r: index }, value: row['N'] },
    ])).flat();

    return {
        lesson: lesson ?? {
            key: Number(lessonKey),
            name: params.michlolFileData[0]['C'],
        },
        filename,
        extension,
        headerRow: [],
        formattedData: [],
        sheetName: 'נתונים מעודכנים',
        specialFields,
    };
}

const getReportName = (data: MichlolPopulatedFileData) => `${data.lesson?.key} - ${data.lesson?.name}`;

export default new DataToExcelReportGenerator(getReportName, getReportData);
