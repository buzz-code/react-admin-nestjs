import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "../entities/Teacher.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { TeacherLessonReportStatus } from "./TeacherLessonReportStatus.entity";

@ViewEntity("teacher_report_status", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(tlrs.userId, "_", tlrs.teacherId, "_", COALESCE(tlrs.reportMonthId, "null"))', 'id')
    .addSelect('tlrs.userId', 'userId')
    .addSelect('tlrs.teacherId', 'teacherId')
    .addSelect('tlrs.reportMonthId', 'reportMonthId')
    .addSelect('GROUP_CONCAT(DISTINCT CASE WHEN tlrs.isReported = 1 THEN tlrs.lessonId END ORDER BY tlrs.lessonId)', 'reportedLessons')
    .addSelect('GROUP_CONCAT(DISTINCT CASE WHEN tlrs.isReported = 0 THEN tlrs.lessonId END ORDER BY tlrs.lessonId)', 'notReportedLessons')
    .from(TeacherLessonReportStatus, 'tlrs')
    .groupBy('tlrs.userId')
    .addGroupBy('tlrs.teacherId')
    .addGroupBy('tlrs.reportMonthId')
    .orderBy('tlrs.reportMonthId')
    .addOrderBy('tlrs.teacherId')
})
export class TeacherReportStatus implements IHasUserId {
  @PrimaryColumn()
  @ViewColumn()
  id: string;

  @ViewColumn()
  userId: number;

  @ViewColumn({ name: 'teacherId' })
  teacherReferenceId: number;

  @ViewColumn({ name: 'reportMonthId' })
  reportMonthReferenceId: number;

  @Column('simple-array')
  reportedLessons: number[];

  @Column('simple-array')
  notReportedLessons: number[];

  // @ManyToOne(() => Teacher)
  // @JoinColumn({ name: 'teacherReferenceId' })
  // teacher: Teacher;

  // @ManyToOne(() => ReportMonth)
  // @JoinColumn({ name: 'reportMonthId' })
  // reportMonth: ReportMonth;
}
