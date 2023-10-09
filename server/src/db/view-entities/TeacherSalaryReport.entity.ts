import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { AttReport } from "../entities/AttReport.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";

@ViewEntity("teacher_salary_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(att_reports.user_id, "_", att_reports.teacherReferenceId, "_", att_reports.lessonReferenceId, "_", att_reports.klassReferenceId, "_", att_reports.how_many_lessons, "_", att_reports.year)', 'id')
    .addSelect('att_reports.user_id', 'userId')
    .addSelect('att_reports.teacherReferenceId', 'teacherReferenceId')
    .addSelect('att_reports.lessonReferenceId', 'lessonReferenceId')
    .addSelect('att_reports.klassReferenceId', 'klassReferenceId')
    .addSelect('att_reports.how_many_lessons', 'how_many_lessons')
    .addSelect('att_reports.year', 'year')
    .addSelect('report_months.id', 'reportMonthReferenceId')
    .distinct(true)
    .from(AttReport, 'att_reports')
    .leftJoin(ReportMonth, 'report_months', 'att_reports.user_id = report_months.userId AND att_reports.report_date <= report_months.endDate AND att_reports.report_date >= report_months.startDate')
})
export class TeacherSalaryReport implements IHasUserId {
  @Column()
  id: number;

  @Column()
  userId: number;

  @Column()
  teacherReferenceId: number;

  @Column()
  lessonReferenceId: number;

  @Column()
  klassReferenceId: number;

  @Column({ name: 'how_many_lessons' })
  howManyLessons: number;

  @Column()
  year: number;

  @Column()
  reportMonthReferenceId: number;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;

  @ManyToOne(() => ReportMonth, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'reportMonthReferenceId' })
  reportMonth: ReportMonth;
}
