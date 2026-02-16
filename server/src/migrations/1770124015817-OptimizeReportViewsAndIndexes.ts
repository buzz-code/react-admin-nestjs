import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeReportViewsAndIndexes1770124015817 implements MigrationInterface {
    name = 'OptimizeReportViewsAndIndexes1770124015817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_and_grade",dbName]);
        await queryRunner.query(`
            DROP VIEW \`att_report_and_grade\`
        `);
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_global_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_user_year_student_idx\` ON \`student_klasses\` (\`user_id\`, \`year\`, \`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_user_year_student_teacher_klass_lesson_idx\` ON \`grades\` (
                \`user_id\`,
                \`year\`,
                \`studentReferenceId\`,
                \`teacherReferenceId\`,
                \`klassReferenceId\`,
                \`lessonReferenceId\`
            )
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_user_year_idx\` ON \`grades\` (\`user_id\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_user_year_student_teacher_klass_lesson_idx\` ON \`att_reports\` (
                \`user_id\`,
                \`year\`,
                \`studentReferenceId\`,
                \`teacherReferenceId\`,
                \`klassReferenceId\`,
                \`lessonReferenceId\`
            )
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_and_grade\` AS
            SELECT CONCAT('a-', id) AS id,
                'att' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                abs_count,
                approved_abs_count,
                NULL AS 'grade',
                NULL AS 'estimation',
                comments,
                sheet_name
            FROM att_reports
            UNION ALL
            SELECT CONCAT('g-', id) AS id,
                'grade' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                NULL AS 'abs_count',
                NULL AS 'approved_abs_count',
                grade,
                estimation,
                comments,
                NULL AS 'sheet_name'
            FROM grades
        `);
        await queryRunner.query(`
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName,"VIEW","att_report_and_grade","SELECT\n      CONCAT('a-', id) AS id,\n      'att' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      abs_count,\n      approved_abs_count,\n      NULL AS 'grade',\n      NULL AS 'estimation',\n      comments,\n      sheet_name\n  FROM\n      att_reports\n  UNION ALL\n  SELECT\n      CONCAT('g-', id) AS id,\n      'grade' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      NULL AS 'abs_count',\n      NULL AS 'approved_abs_count',\n      grade,\n      estimation,\n      comments,\n      NULL AS 'sheet_name'\n  FROM\n      grades"]);
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT CONCAT(
                    COALESCE(sgr_inner.studentReferenceId, "null"),
                    "_",
                    COALESCE(sgr_inner.teacherReferenceId, "null"),
                    "_",
                    COALESCE(sgr_inner.klassReferenceId, "null"),
                    "_",
                    COALESCE(sgr_inner.lessonReferenceId, "null"),
                    "_",
                    COALESCE(sgr_inner.user_id, "null"),
                    "_",
                    COALESCE(sgr_inner.year, "null")
                ) AS \`id\`,
                sgr_inner.user_id AS \`user_id\`,
                sgr_inner.year AS \`year\`,
                sgr_inner.studentReferenceId AS \`studentReferenceId\`,
                sgr_inner.teacherReferenceId AS \`teacherReferenceId\`,
                sgr_inner.klassReferenceId AS \`klassReferenceId\`,
                sgr_inner.lessonReferenceId AS \`lessonReferenceId\`,
                CASE
                    WHEN \`klass_types\`.\`klassTypeEnum\` = "כיתת אם" THEN 1
                    ELSE 0
                END AS \`isBaseKlass\`,
                sgr_inner.lessons_count AS \`lessons_count\`,
                sgr_inner.abs_count AS \`abs_count\`,
                sgr_inner.grade_avg AS \`grade_avg\`
            FROM (
                    SELECT \`atag\`.\`year\` AS \`year\`,
                        \`atag\`.\`studentReferenceId\` AS \`studentReferenceId\`,
                        \`atag\`.\`klassReferenceId\` AS \`klassReferenceId\`,
                        \`atag\`.\`lessonReferenceId\` AS \`lessonReferenceId\`,
                        \`atag\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                        \`atag\`.\`user_id\` AS \`user_id\`,
                        SUM(\`atag\`.\`how_many_lessons\`) AS \`lessons_count\`,
                        SUM(\`atag\`.\`abs_count\`) AS \`abs_count\`,
                        AVG(\`atag\`.\`grade\`) AS \`grade_avg\`
                    FROM \`att_report_and_grade\` \`atag\`
                    GROUP BY \`atag\`.\`user_id\`,
                        \`atag\`.\`year\`,
                        \`atag\`.\`studentReferenceId\`,
                        \`atag\`.\`teacherReferenceId\`,
                        \`atag\`.\`klassReferenceId\`,
                        \`atag\`.\`lessonReferenceId\`
                ) \`sgr_inner\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = sgr_inner.klassReferenceId
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
        `);
        await queryRunner.query(`
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName,"VIEW","student_global_report","SELECT CONCAT(COALESCE(sgr_inner.studentReferenceId, \"null\"), \"_\", COALESCE(sgr_inner.teacherReferenceId, \"null\"), \"_\", COALESCE(sgr_inner.klassReferenceId, \"null\"), \"_\", COALESCE(sgr_inner.lessonReferenceId, \"null\"), \"_\", COALESCE(sgr_inner.user_id, \"null\"), \"_\", COALESCE(sgr_inner.year, \"null\")) AS `id`, sgr_inner.user_id AS `user_id`, sgr_inner.year AS `year`, sgr_inner.studentReferenceId AS `studentReferenceId`, sgr_inner.teacherReferenceId AS `teacherReferenceId`, sgr_inner.klassReferenceId AS `klassReferenceId`, sgr_inner.lessonReferenceId AS `lessonReferenceId`, CASE WHEN `klass_types`.`klassTypeEnum` = \"כיתת אם\" THEN 1 ELSE 0 END AS `isBaseKlass`, sgr_inner.lessons_count AS `lessons_count`, sgr_inner.abs_count AS `abs_count`, sgr_inner.grade_avg AS `grade_avg` FROM (SELECT `atag`.`year` AS `year`, `atag`.`studentReferenceId` AS `studentReferenceId`, `atag`.`klassReferenceId` AS `klassReferenceId`, `atag`.`lessonReferenceId` AS `lessonReferenceId`, `atag`.`teacherReferenceId` AS `teacherReferenceId`, `atag`.`user_id` AS `user_id`, SUM(`atag`.`how_many_lessons`) AS `lessons_count`, SUM(`atag`.`abs_count`) AS `abs_count`, AVG(`atag`.`grade`) AS `grade_avg` FROM `att_report_and_grade` `atag` GROUP BY `atag`.`user_id`, `atag`.`year`, `atag`.`studentReferenceId`, `atag`.`teacherReferenceId`, `atag`.`klassReferenceId`, `atag`.`lessonReferenceId`) `sgr_inner` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = sgr_inner.klassReferenceId  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_global_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_and_grade",dbName]);
        await queryRunner.query(`
            DROP VIEW \`att_report_and_grade\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_user_year_student_teacher_klass_lesson_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_user_year_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_user_year_student_teacher_klass_lesson_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`student_klasses_user_year_student_idx\` ON \`student_klasses\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT \`atag\`.\`year\` AS \`year\`,
                \`atag\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                CONCAT(
                    COALESCE(studentReferenceId, "null"),
                    "_",
                    COALESCE(\`atag\`.\`teacherReferenceId\`, "null"),
                    "_",
                    COALESCE(klassReferenceId, "null"),
                    "_",
                    COALESCE(lessonReferenceId, "null"),
                    "_",
                    COALESCE(\`atag\`.\`user_id\`, "null"),
                    "_",
                    COALESCE(\`atag\`.\`year\`, "null")
                ) AS \`id\`,
                \`atag\`.\`user_id\` AS \`user_id\`,
                studentReferenceId,
                klassReferenceId,
                lessonReferenceId,
                CASE
                    WHEN \`klass_types\`.\`klassTypeEnum\` = "כיתת אם" THEN 1
                    ELSE 0
                END AS \`isBaseKlass\`,
                SUM(how_many_lessons) AS \`lessons_count\`,
                SUM(abs_count) AS \`abs_count\`,
                AVG(grade) AS \`grade_avg\`
            FROM \`att_report_and_grade\` \`atag\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`atag\`.\`klassReferenceId\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
            GROUP BY studentReferenceId,
                \`atag\`.\`teacherReferenceId\`,
                klassReferenceId,
                lessonReferenceId,
                \`atag\`.\`user_id\`,
                \`atag\`.\`year\`
        `);
        await queryRunner.query(`
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName,"VIEW","student_global_report","SELECT `atag`.`year` AS `year`, `atag`.`teacherReferenceId` AS `teacherReferenceId`, CONCAT(COALESCE(studentReferenceId, \"null\"), \"_\", COALESCE(`atag`.`teacherReferenceId`, \"null\"), \"_\", COALESCE(klassReferenceId, \"null\"), \"_\", COALESCE(lessonReferenceId, \"null\"), \"_\", COALESCE(`atag`.`user_id`, \"null\"), \"_\", COALESCE(`atag`.`year`, \"null\")) AS `id`, `atag`.`user_id` AS `user_id`, studentReferenceId, klassReferenceId, lessonReferenceId, CASE WHEN `klass_types`.`klassTypeEnum` = \"כיתת אם\" THEN 1 ELSE 0 END AS `isBaseKlass`, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `atag`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` GROUP BY studentReferenceId, `atag`.`teacherReferenceId`, klassReferenceId, lessonReferenceId, `atag`.`user_id`, `atag`.`year`"]);
        await queryRunner.query(`
            CREATE VIEW \`att_report_and_grade\` AS
            SELECT CONCAT('a-', id) AS id,
                'att' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                abs_count,
                approved_abs_count,
                NULL AS 'grade',
                NULL AS 'estimation',
                comments,
                sheet_name
            FROM att_reports
            UNION
            SELECT CONCAT('g-', id) AS id,
                'grade' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                NULL AS 'abs_count',
                NULL AS 'approved_abs_count',
                grade,
                estimation,
                comments,
                NULL AS 'sheet_name'
            FROM grades
        `);
        await queryRunner.query(`
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName,"VIEW","att_report_and_grade","SELECT\n      CONCAT('a-', id) AS id,\n      'att' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      abs_count,\n      approved_abs_count,\n      NULL AS 'grade',\n      NULL AS 'estimation',\n      comments,\n      sheet_name\n  FROM\n      att_reports\n  UNION\n  SELECT\n      CONCAT('g-', id) AS id,\n      'grade' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      NULL AS 'abs_count',\n      NULL AS 'approved_abs_count',\n      grade,\n      estimation,\n      comments,\n      NULL AS 'sheet_name'\n  FROM\n      grades"]);
    }

}
