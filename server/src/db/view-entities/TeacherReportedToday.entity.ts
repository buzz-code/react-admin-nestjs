import { Column, DataSource, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { AttReport } from '../entities/AttReport.entity';
import { Teacher } from '../entities/Teacher.entity';

@ViewEntity('teacher_reported_today', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(
        "CONCAT(att_report.userId, '_', att_report.teacherReferenceId, '_', att_report.reportDate)",
        'id',
      )
      .addSelect('att_report.userId', 'userId')
      .addSelect('teacher.id', 'teacherReferenceId')
      .addSelect('teacher.name', 'teacherName')
      .addSelect('att_report.reportDate', 'reportDate')
      .from(AttReport, 'att_report')
      .innerJoin(Teacher, 'teacher', 'teacher.id = att_report.teacherReferenceId AND teacher.userId = att_report.userId')
      .groupBy('att_report.userId')
      .addGroupBy('teacher.id')
      .addGroupBy('att_report.reportDate'),
})
export class TeacherReportedToday implements IHasUserId {
  @Column()
  id: string;

  @Column()
  userId: number;

  @Column()
  teacherReferenceId: number;

  @Column()
  teacherName: string;

  @Column('date')
  reportDate: Date;
}
