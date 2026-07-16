import { Column, DataSource, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { AttReport } from '../entities/AttReport.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Lesson } from '../entities/Lesson.entity';

@ViewEntity('teacher_reported_today', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(
        "CONCAT(att_report.userId, '_', teacher.id, '_', att_report.reportDate, '_', COALESCE(lesson.id, 'null'))",
        'id',
      )
      .addSelect('att_report.userId', 'userId')
      .addSelect('att_report.reportDate', 'reportDate')
      .addSelect('teacher.id', 'teacherReferenceId')
      .addSelect('teacher.name', 'teacherName')
      .addSelect('lesson.id', 'lessonReferenceId')
      .addSelect('lesson.name', 'lessonName')
      .addSelect(
        'MIN(MIN(att_report.createdAt)) OVER (PARTITION BY att_report.userId, teacher.id, att_report.reportDate)',
        'reportHour',
      )
      .from(AttReport, 'att_report')
      .innerJoin(Teacher, 'teacher', 'teacher.id = att_report.teacherReferenceId AND teacher.userId = att_report.userId')
      .leftJoin(Lesson, 'lesson', 'lesson.id = att_report.lessonReferenceId AND lesson.userId = att_report.userId')
      .groupBy('att_report.userId')
      .addGroupBy('teacher.id')
      .addGroupBy('att_report.reportDate')
      .addGroupBy('lesson.id'),
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

  @Column()
  teacherName: string;

  @Column({ nullable: true })
  lessonReferenceId: number;

  @Column({ nullable: true })
  lessonName: string;

  @Column()
  reportHour: Date;
}
