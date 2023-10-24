import { User } from 'src/db/entities/User.entity';
import { BulkToZipReportGenerator, DataToExcelReportGenerator, IDataToExcelReportGenerator, IGetReportDataFunction, ReactToPdfReportGenerator } from '@shared/utils/report/report.generators';
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { TeacherReportStatus } from 'src/db/view-entities/TeacherReportStatus.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { In } from 'typeorm';


export interface TeacherReportFileData extends IDataToExcelReportGenerator {
    user: User,
    teacher: Teacher,
    lesson: Lesson,
}
const getReportData: IGetReportDataFunction = async (params, dataSource): Promise<TeacherReportFileData[]> => {
    const [userId, teacherId, reportMonthId, year] = params.id.split('_');
    const [user, teacher, teacherReportStatus] = await Promise.all([
        dataSource.getRepository(User).findOneBy({ id: params.userId }),
        dataSource.getRepository(Teacher).findOneBy({ id: teacherId }),
        dataSource.getRepository(TeacherReportStatus).findOneBy({ id: params.id }),
    ])
    const [lessons] = await Promise.all([
        dataSource.getRepository(Lesson).findBy({ id: In(teacherReportStatus.notReportedLessons) }),
    ]);
    const lessonStudents: { [key: number]: StudentKlass[] } = {};
    for (const lesson of lessons) {
        if (lesson.klassReferenceIds?.length) {
            const students = await dataSource.getRepository(StudentKlass).find({
                where: {
                    klassReferenceId: In(lesson.klassReferenceIds),
                    year: lesson.year,
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
        headerRow,
        formattedData: lessonStudents[lesson.id].map(sk => (
            [sk.klass.key, sk.student.tz, sk.student.name]
        )),
        sheetName: teacherReportStatus.reportMonthName ?? 'דיווח נוכחות',
        specialFields: [
            { cell: { c: 0, r: 0 }, value: 'מורה: ' },
            { cell: { c: 1, r: 0 }, value: teacher.name },
            { cell: { c: 2, r: 0 }, value: teacher.tz },
            { cell: { c: 0, r: 1 }, value: 'שיעור:' },
            { cell: { c: 1, r: 1 }, value: lesson.name },
            { cell: { c: 2, r: 1 }, value: lesson.key.toString() },
        ],
        user,
        teacher,
        lesson,
    }));
}

const getReportName = (data: TeacherReportFileData) => `קובץ נוכחות למורה ${data.teacher?.name} לשיעור ${data.lesson?.name}`;

const generator = new DataToExcelReportGenerator(getReportName);

export default new BulkToZipReportGenerator(() => 'קבצי נוכחות למורה', generator, getReportData);
