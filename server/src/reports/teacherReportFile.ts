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
    const [userId, teacherId, reportMonthId] = params.id.split('_');
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
        const students = await dataSource.getRepository(StudentKlass).find({
            where: {
                klassReferenceId: In(lesson.klassReferenceIds)
            },
            relations: {
                student: true,
            }
        });
        lessonStudents[lesson.id] = students;
    }
    return lessons.map(lesson => ({
        headerRow: ['תז', 'שם תלמידה'],
        formattedData: lessonStudents[lesson.id].map(sk => ([sk.student.tz, sk.student.name])),
        sheetName: teacherReportStatus.reportMonthName ?? 'דיווח נוכחות',
        user,
        teacher,
        lesson,
    }));
}

const getReportName = (data: TeacherReportFileData) => `קובץ נוכחות למורה ${data.teacher?.name} לשיעור ${data.lesson?.name}`;

const generator = new DataToExcelReportGenerator(getReportName);

export default new BulkToZipReportGenerator(generator, getReportData);
