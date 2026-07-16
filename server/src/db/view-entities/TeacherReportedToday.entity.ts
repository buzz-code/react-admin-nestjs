import { Column, DataSource, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { AttReport } from '../entities/AttReport.entity';

@ViewEntity('teacher_reported_today', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(
        "CONCAT(att_report.userId, '_', att_report.teacherReferenceId, '_', att_report.reportDate, '_', COALESCE(att_report.lessonReferenceId, 'null'))",
        'id',
      )
      .addSelect('att_report.userId', 'userId')
      .addSelect('att_report.reportDate', 'reportDate')
      .addSelect('att_report.teacherReferenceId', 'teacherReferenceId')
      .addSelect('att_report.lessonReferenceId', 'lessonReferenceId')
      .addSelect(
        'MIN(MIN(att_report.createdAt)) OVER (PARTITION BY att_report.userId, att_report.teacherReferenceId, att_report.reportDate)',
        'reportHour',
      )
      .from(AttReport, 'att_report')
      .where('att_report.teacherReferenceId IS NOT NULL')
      .groupBy('att_report.userId')
      .addGroupBy('att_report.teacherReferenceId')
      .addGroupBy('att_report.reportDate')
      .addGroupBy('att_report.lessonReferenceId'),
})
export class TeacherReportedToday implements IHasUserId {
  @Column()
  id: string;

  @Column()
  userId: number;

  @Column('date')
  reportDate: Date;

  @Column()
  teacherReferenceId: number;

  @Column({ nullable: true })
  lessonReferenceId: number;

  @Column()
  reportHour: Date;
}
