import { Column, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { getAddMinutesExpression, getConcatExpression } from '@shared/utils/entity/column-types.util';

// Reports of the same teacher+lesson+klass+date more than this many minutes apart are separate lessons.
const NEW_LESSON_GAP_MINUTES = 15;

const PREVIOUS_REPORT_TIME = `LAG(att_reports.created_at) OVER (
                      PARTITION BY att_reports.user_id, att_reports.teacherReferenceId, att_reports.report_date, att_reports.lessonReferenceId, att_reports.klassReferenceId
                      ORDER BY att_reports.created_at, att_reports.id
                    )`;

// One row per lesson taught: rows of the same teacher+lesson+klass+date are split into
// separate lessons wherever there is a gap of more than NEW_LESSON_GAP_MINUTES between
// consecutive reports. Works for every report source (phone saves a whole lesson at once,
// the web form saves each student separately a few seconds apart).
@ViewEntity('teacher_reported_today', {
  expression: `
    SELECT ${getConcatExpression('lesson_reports.userId', "'_'", 'lesson_reports.teacherReferenceId', "'_'", 'lesson_reports.reportDate', "'_'", "COALESCE(lesson_reports.lessonReferenceId, 'null')", "'_'", "COALESCE(lesson_reports.klassReferenceId, 'null')", "'_'", 'lesson_reports.lessonNumber')} AS id,
           lesson_reports.userId AS userId,
           lesson_reports.reportDate AS reportDate,
           lesson_reports.teacherReferenceId AS teacherReferenceId,
           lesson_reports.lessonReferenceId AS lessonReferenceId,
           lesson_reports.klassReferenceId AS klassReferenceId,
           MIN(lesson_reports.createdAt) AS reportHour,
           COUNT(DISTINCT CASE WHEN lesson_reports.absCount > 0 THEN lesson_reports.studentReferenceId END) AS missingGirlsCount
    FROM (
      SELECT reports.*,
             SUM(reports.isNewLesson) OVER (
               PARTITION BY reports.userId, reports.teacherReferenceId, reports.reportDate, reports.lessonReferenceId, reports.klassReferenceId
               ORDER BY reports.createdAt, reports.id
             ) AS lessonNumber
      FROM (
        SELECT att_reports.id AS id,
               att_reports.user_id AS userId,
               att_reports.report_date AS reportDate,
               att_reports.teacherReferenceId AS teacherReferenceId,
               att_reports.lessonReferenceId AS lessonReferenceId,
               att_reports.klassReferenceId AS klassReferenceId,
               att_reports.studentReferenceId AS studentReferenceId,
               att_reports.abs_count AS absCount,
               att_reports.created_at AS createdAt,
               CASE WHEN att_reports.created_at <= ${getAddMinutesExpression(PREVIOUS_REPORT_TIME, NEW_LESSON_GAP_MINUTES)} THEN 0 ELSE 1 END AS isNewLesson
        FROM att_reports
        WHERE att_reports.teacherReferenceId IS NOT NULL
      ) reports
    ) lesson_reports
    GROUP BY lesson_reports.userId, lesson_reports.teacherReferenceId, lesson_reports.reportDate, lesson_reports.lessonReferenceId, lesson_reports.klassReferenceId, lesson_reports.lessonNumber
  `,
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

  @Column({ nullable: true })
  klassReferenceId: number;

  @Column()
  reportHour: Date;

  @Column()
  missingGirlsCount: number;
}
