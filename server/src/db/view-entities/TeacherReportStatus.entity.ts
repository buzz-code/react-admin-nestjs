import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "../entities/Teacher.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { TeacherLessonReportStatus } from "./TeacherLessonReportStatus.entity";
import { getGroupConcatExpression } from "@shared/utils/entity/column-types.util";

@ViewEntity("teacher_report_status", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(COALESCE(tlrs.userId, "null"), "_", COALESCE(tlrs.teacherId, "null"), "_", ' +
      'COALESCE(tlrs.reportMonthId, "null"), "_", COALESCE(tlrs.year, "null"))', 'id')
    .addSelect('tlrs.userId', 'userId')
    .addSelect('tlrs.teacherId', 'teacherId')
    .addSelect('teacher.name', 'teacherName')
    .addSelect('teacher.comment', 'teacherComment')
    .addSelect('tlrs.reportMonthId', 'reportMonthId')
    .addSelect('tlrs.year', 'year')
    .addSelect('rm.name', 'reportMonthName')
    .addSelect(getGroupConcatExpression('CASE WHEN tlrs.isReported = 1 THEN tlrs.lessonId END', ',', true, 'tlrs.lessonName'), 'reportedLessons')
    .addSelect(getGroupConcatExpression('CASE WHEN tlrs.isReported = 0 THEN tlrs.lessonId END', ',', true, 'tlrs.lessonName'), 'notReportedLessons')
    .addSelect(getGroupConcatExpression('CASE WHEN tlrs.isReported = 1 THEN tlrs.lessonName END', ', ', true, 'tlrs.lessonName'), 'reportedLessonNames')
    .addSelect(getGroupConcatExpression('CASE WHEN tlrs.isReported = 0 THEN tlrs.lessonName END', ', ', true, 'tlrs.lessonName'), 'notReportedLessonNames')
    .from(TeacherLessonReportStatus, 'tlrs')
    .leftJoin(Teacher, 'teacher', 'tlrs.teacherId = teacher.id')
    .leftJoin(ReportMonth, 'rm', 'tlrs.reportMonthId = rm.id')
    .groupBy('tlrs.userId')
    .addGroupBy('tlrs.year')
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

  @ViewColumn()
  year: number;

  @ViewColumn({ name: 'teacherId' })
  teacherReferenceId: number;

  @ViewColumn()
  teacherName: string;

  @ViewColumn()
  teacherComment: string;

  @ViewColumn({ name: 'reportMonthId' })
  reportMonthReferenceId: number;

  @ViewColumn()
  reportMonthName: string;

  @Column('simple-array')
  reportedLessons: string[];

  @Column('simple-array')
  notReportedLessons: string[];

  @Column()
  reportedLessonNames: string;

  @Column()
  notReportedLessonNames: string;
}
