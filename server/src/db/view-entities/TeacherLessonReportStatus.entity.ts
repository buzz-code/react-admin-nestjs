import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "../entities/Teacher.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Lesson } from "../entities/Lesson.entity";
import { AttReport } from "../entities/AttReport.entity";

@ViewEntity("teacher_lesson_report_status", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('lessons.teacherReferenceId', 'teacherId')
    .addSelect('lessons.userId', 'userId')
    .addSelect('lessons.id', 'lessonId')
    .addSelect('lessons.name', 'lessonName')
    .addSelect('lessons.year', 'year')
    .addSelect('report_months.id', 'reportMonthId')
    .addSelect('CASE WHEN COUNT(att_reports.id) > 0 THEN 1 ELSE 0 END', 'isReported')
    .from(Lesson, 'lessons')
    .innerJoin(Teacher, 'teachers', 'teachers.id = lessons.teacherReferenceId AND teachers.user_id = lessons.userId')
    .leftJoin(ReportMonth, 'report_months', 'report_months.userId = lessons.userId AND report_months.year = lessons.year')
    .leftJoin(AttReport, 'att_reports', 'att_reports.teacherReferenceId = lessons.teacherReferenceId AND att_reports.lessonReferenceId = lessons.id AND att_reports.report_date BETWEEN report_months.startDate AND report_months.endDate')
    .where('report_months.id IS NOT NULL')
    .andWhere('(lessons.start_date IS NULL OR lessons.start_date <= report_months.endDate)')
    .andWhere('(lessons.end_date IS NULL OR lessons.end_date >= report_months.startDate)')
    .groupBy('lessons.teacherReferenceId')
    .addGroupBy('lessons.userId')
    .addGroupBy('lessons.id')
    .addGroupBy('report_months.id')
    .orderBy('report_months.id')
})
export class TeacherLessonReportStatus implements IHasUserId {
  @Column()
  userId: number;

  @Column()
  year: number;

  @Column()
  teacherId: number;

  @Column()
  lessonId: number;

  @Column()
  lessonName: string;

  @Column()
  reportMonthId: number;

  @Column()
  isReported: boolean;
}
