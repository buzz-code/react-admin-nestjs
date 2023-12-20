import { User } from 'src/db/entities/User.entity';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { DataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { BulkToZipReportGenerator } from '@shared/utils/report/bulk-to-zip.generator';
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { TeacherReportStatus } from 'src/db/view-entities/TeacherReportStatus.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { ReportMonth } from 'src/db/entities/ReportMonth.entity';
import { FindOptionsWhere, In, IsNull, Not } from 'typeorm';


export interface TeacherReportFileParams {
    id: string;
    userId: number;
    lessonReferenceId?: number;
    isGrades?: boolean;
}
export interface TeacherReportFileData extends IDataToExcelReportGenerator {
    fileTitle: string;
    user: User,
    teacher: Teacher,
    lesson: Lesson,
    teacherReportStatus: TeacherReportStatus,
    reportMonth: ReportMonth,
}
const getReportData: IGetReportDataFunction = async (params: TeacherReportFileParams, dataSource): Promise<TeacherReportFileData[]> => {
    const [userId, teacherId, reportMonthId, year] = params.id.split('_');
    const [user, teacher, teacherReportStatus, reportMonth] = await Promise.all([
        dataSource.getRepository(User).findOneBy({ id: params.userId }),
        dataSource.getRepository(Teacher).findOneBy({ id: Number(teacherId) }),
        dataSource.getRepository(TeacherReportStatus).findOneBy({ id: params.id }),
        dataSource.getRepository(ReportMonth).findOneBy({ id: Number(reportMonthId) }),
    ])
    if ((teacherReportStatus.notReportedLessons?.length ?? 0) === 0) {
        console.log('teacher report file: no lessons to report')
        return [];
    }

    const lessonFilter: FindOptionsWhere<Lesson> = { id: In(teacherReportStatus.notReportedLessons) };
    if (params.lessonReferenceId) {
        if (teacherReportStatus.notReportedLessons?.includes(String(params.lessonReferenceId))) {
            lessonFilter.id = params.lessonReferenceId;
        } else {
            console.log('teacher report file: lesson not in notReportedLessons')
            return [];
        }
    }
    const [lessons] = await Promise.all([
        dataSource.getRepository(Lesson).findBy(lessonFilter),
    ]);

    console.log('teacher report file: lessons', lessons.length)

    const lessonStudents: { [key: number]: StudentKlass[] } = {};
    for (const lesson of lessons) {
        if (lesson.klassReferenceIds?.length) {
            const students = await dataSource.getRepository(StudentKlass).find({
                where: {
                    klassReferenceId: In(lesson.klassReferenceIds),
                    year: teacherReportStatus.year,
                    studentReferenceId: Not(IsNull()),
                    student: {
                        id: Not(IsNull())
                    }
                },
                relations: {
                    student: true,
                    klass: true,
                },
                order: {
                    student: {
                        name: 'ASC'
                    }
                }
            });
            lessonStudents[lesson.id] = students;
        } else {
            lessonStudents[lesson.id] = [];
        }
    }

    const dataCols = params.isGrades ? ['ציונים'] : ['מספר שיעורים', 'חיסורים']
    const headerRow = ['קוד כיתה', 'ת.ז.', 'שם תלמידה', ...dataCols, 'הערות'];

    return lessons.map(lesson => ({
        fileTitle: params.isGrades ? 'קובץ ציונים' : 'קובץ נוכחות',
        headerRow,
        formattedData: lessonStudents[lesson.id].map(sk => (
            [sk.klass.key, sk.student.tz, sk.student.name]
        )),
        sheetName: teacherReportStatus.reportMonthName ?? 'דיווח נוכחות',
        specialFields: [
            { cell: { c: 0, r: 0 }, value: 'מורה: ' },
            { cell: { c: 1, r: 0 }, value: teacher.name },
            { cell: { c: 2, r: 0 }, value: teacher.tz },
            { cell: { c: 3, r: 0 }, value: 'תאריך: (ניתן להשאיר ריק)' },
            { cell: { c: 0, r: 1 }, value: 'שיעור:' },
            { cell: { c: 1, r: 1 }, value: lesson.name },
            { cell: { c: 2, r: 1 }, value: lesson.key.toString() },
        ],
        user,
        teacher,
        lesson,
        teacherReportStatus,
        reportMonth,
    }));
}

const getReportName = (data: TeacherReportFileData) => `${data.fileTitle} למורה ${data.teacher?.name} לשיעור ${data.lesson?.name} - ${data.reportMonth?.name}`;

const generator = new DataToExcelReportGenerator(getReportName);

export default new BulkToZipReportGenerator(() => 'קבצי נוכחות למורה', generator, getReportData);
