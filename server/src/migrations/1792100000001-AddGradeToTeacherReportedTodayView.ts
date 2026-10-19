import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGradeToTeacherReportedTodayView1792100000001 implements MigrationInterface {
    name = 'AddGradeToTeacherReportedTodayView1792100000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_reported_today",dbName]);
        await queryRunner.query(`DROP VIEW \`teacher_reported_today\``);
        await queryRunner.query(`CREATE VIEW \`teacher_reported_today\` AS 
    SELECT CONCAT(lesson_reports.userId, '_', lesson_reports.teacherReferenceId, '_', lesson_reports.reportDate, '_', COALESCE(lesson_reports.lessonReferenceId, 'null'), '_', COALESCE(lesson_reports.klassReferenceId, 'null'), '_', lesson_reports.lessonNumber) AS id,
           lesson_reports.userId AS userId,
           lesson_reports.reportDate AS reportDate,
           lesson_reports.teacherReferenceId AS teacherReferenceId,
           lesson_reports.lessonReferenceId AS lessonReferenceId,
           lesson_reports.klassReferenceId AS klassReferenceId,
           klasses.grade AS grade,
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
               CASE WHEN att_reports.created_at <= LAG(att_reports.created_at) OVER (
                      PARTITION BY att_reports.user_id, att_reports.teacherReferenceId, att_reports.report_date, att_reports.lessonReferenceId, att_reports.klassReferenceId
                      ORDER BY att_reports.created_at, att_reports.id
                    ) + INTERVAL 15 MINUTE THEN 0 ELSE 1 END AS isNewLesson
        FROM att_reports
        WHERE att_reports.teacherReferenceId IS NOT NULL
      ) reports
    ) lesson_reports
    LEFT JOIN klasses ON klasses.id = lesson_reports.klassReferenceId
    GROUP BY lesson_reports.userId, lesson_reports.teacherReferenceId, lesson_reports.reportDate, lesson_reports.lessonReferenceId, lesson_reports.klassReferenceId, lesson_reports.lessonNumber, klasses.grade
  `);
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","teacher_reported_today","SELECT CONCAT(lesson_reports.userId, '_', lesson_reports.teacherReferenceId, '_', lesson_reports.reportDate, '_', COALESCE(lesson_reports.lessonReferenceId, 'null'), '_', COALESCE(lesson_reports.klassReferenceId, 'null'), '_', lesson_reports.lessonNumber) AS id,\n           lesson_reports.userId AS userId,\n           lesson_reports.reportDate AS reportDate,\n           lesson_reports.teacherReferenceId AS teacherReferenceId,\n           lesson_reports.lessonReferenceId AS lessonReferenceId,\n           lesson_reports.klassReferenceId AS klassReferenceId,\n           klasses.grade AS grade,\n           MIN(lesson_reports.createdAt) AS reportHour,\n           COUNT(DISTINCT CASE WHEN lesson_reports.absCount > 0 THEN lesson_reports.studentReferenceId END) AS missingGirlsCount\n    FROM (\n      SELECT reports.*,\n             SUM(reports.isNewLesson) OVER (\n               PARTITION BY reports.userId, reports.teacherReferenceId, reports.reportDate, reports.lessonReferenceId, reports.klassReferenceId\n               ORDER BY reports.createdAt, reports.id\n             ) AS lessonNumber\n      FROM (\n        SELECT att_reports.id AS id,\n               att_reports.user_id AS userId,\n               att_reports.report_date AS reportDate,\n               att_reports.teacherReferenceId AS teacherReferenceId,\n               att_reports.lessonReferenceId AS lessonReferenceId,\n               att_reports.klassReferenceId AS klassReferenceId,\n               att_reports.studentReferenceId AS studentReferenceId,\n               att_reports.abs_count AS absCount,\n               att_reports.created_at AS createdAt,\n               CASE WHEN att_reports.created_at <= LAG(att_reports.created_at) OVER (\n                      PARTITION BY att_reports.user_id, att_reports.teacherReferenceId, att_reports.report_date, att_reports.lessonReferenceId, att_reports.klassReferenceId\n                      ORDER BY att_reports.created_at, att_reports.id\n                    ) + INTERVAL 15 MINUTE THEN 0 ELSE 1 END AS isNewLesson\n        FROM att_reports\n        WHERE att_reports.teacherReferenceId IS NOT NULL\n      ) reports\n    ) lesson_reports\n    LEFT JOIN klasses ON klasses.id = lesson_reports.klassReferenceId\n    GROUP BY lesson_reports.userId, lesson_reports.teacherReferenceId, lesson_reports.reportDate, lesson_reports.lessonReferenceId, lesson_reports.klassReferenceId, lesson_reports.lessonNumber, klasses.grade"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_reported_today",dbName]);
        await queryRunner.query(`DROP VIEW \`teacher_reported_today\``);
        await queryRunner.query(`CREATE VIEW \`teacher_reported_today\` AS 
    SELECT CONCAT(lesson_reports.userId, '_', lesson_reports.teacherReferenceId, '_', lesson_reports.reportDate, '_', COALESCE(lesson_reports.lessonReferenceId, 'null'), '_', COALESCE(lesson_reports.klassReferenceId, 'null'), '_', lesson_reports.lessonNumber) AS id,
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
               CASE WHEN att_reports.created_at <= LAG(att_reports.created_at) OVER (
                      PARTITION BY att_reports.user_id, att_reports.teacherReferenceId, att_reports.report_date, att_reports.lessonReferenceId, att_reports.klassReferenceId
                      ORDER BY att_reports.created_at, att_reports.id
                    ) + INTERVAL 15 MINUTE THEN 0 ELSE 1 END AS isNewLesson
        FROM att_reports
        WHERE att_reports.teacherReferenceId IS NOT NULL
      ) reports
    ) lesson_reports
    GROUP BY lesson_reports.userId, lesson_reports.teacherReferenceId, lesson_reports.reportDate, lesson_reports.lessonReferenceId, lesson_reports.klassReferenceId, lesson_reports.lessonNumber
  `);
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","teacher_reported_today","SELECT CONCAT(lesson_reports.userId, '_', lesson_reports.teacherReferenceId, '_', lesson_reports.reportDate, '_', COALESCE(lesson_reports.lessonReferenceId, 'null'), '_', COALESCE(lesson_reports.klassReferenceId, 'null'), '_', lesson_reports.lessonNumber) AS id,\n           lesson_reports.userId AS userId,\n           lesson_reports.reportDate AS reportDate,\n           lesson_reports.teacherReferenceId AS teacherReferenceId,\n           lesson_reports.lessonReferenceId AS lessonReferenceId,\n           lesson_reports.klassReferenceId AS klassReferenceId,\n           MIN(lesson_reports.createdAt) AS reportHour,\n           COUNT(DISTINCT CASE WHEN lesson_reports.absCount > 0 THEN lesson_reports.studentReferenceId END) AS missingGirlsCount\n    FROM (\n      SELECT reports.*,\n             SUM(reports.isNewLesson) OVER (\n               PARTITION BY reports.userId, reports.teacherReferenceId, reports.reportDate, reports.lessonReferenceId, reports.klassReferenceId\n               ORDER BY reports.createdAt, reports.id\n             ) AS lessonNumber\n      FROM (\n        SELECT att_reports.id AS id,\n               att_reports.user_id AS userId,\n               att_reports.report_date AS reportDate,\n               att_reports.teacherReferenceId AS teacherReferenceId,\n               att_reports.lessonReferenceId AS lessonReferenceId,\n               att_reports.klassReferenceId AS klassReferenceId,\n               att_reports.studentReferenceId AS studentReferenceId,\n               att_reports.abs_count AS absCount,\n               att_reports.created_at AS createdAt,\n               CASE WHEN att_reports.created_at <= LAG(att_reports.created_at) OVER (\n                      PARTITION BY att_reports.user_id, att_reports.teacherReferenceId, att_reports.report_date, att_reports.lessonReferenceId, att_reports.klassReferenceId\n                      ORDER BY att_reports.created_at, att_reports.id\n                    ) + INTERVAL 15 MINUTE THEN 0 ELSE 1 END AS isNewLesson\n        FROM att_reports\n        WHERE att_reports.teacherReferenceId IS NOT NULL\n      ) reports\n    ) lesson_reports\n    GROUP BY lesson_reports.userId, lesson_reports.teacherReferenceId, lesson_reports.reportDate, lesson_reports.lessonReferenceId, lesson_reports.klassReferenceId, lesson_reports.lessonNumber"]);
    }

}
