import { MigrationInterface, QueryRunner } from "typeorm";

export class cosmeticViewChanges1770235932144 implements MigrationInterface {
    name = 'cosmeticViewChanges1770235932144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_grade_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_grade_report_status\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_grade_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    COALESCE(\`tlrs\`.\`userId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`teacherId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`year\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ','
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ','
                ) AS \`notReportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ', '
                ) AS \`reportedLessonNames\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ', '
                ) AS \`notReportedLessonNames\`
            FROM \`teacher_lesson_grade_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`,
                \`tlrs\`.\`year\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, [dbName,"VIEW","teacher_grade_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName` SEPARATOR ',') AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName` SEPARATOR ',') AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR ', ') AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR ', ') AS `notReportedLessonNames` FROM `teacher_lesson_grade_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    COALESCE(\`tlrs\`.\`userId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`teacherId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`year\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ','
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ','
                ) AS \`notReportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ', '
                ) AS \`reportedLessonNames\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ', '
                ) AS \`notReportedLessonNames\`
            FROM \`teacher_lesson_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`year\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, [dbName,"VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName` SEPARATOR ',') AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName` SEPARATOR ',') AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR ', ') AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR ', ') AS `notReportedLessonNames` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`year`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_grade_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_grade_report_status\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_grade_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    COALESCE(\`tlrs\`.\`userId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`teacherId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`year\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`notReportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`reportedLessonNames\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`notReportedLessonNames\`
            FROM \`teacher_lesson_grade_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`,
                \`tlrs\`.\`year\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, [dbName,"VIEW","teacher_grade_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_grade_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    COALESCE(\`tlrs\`.\`userId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`teacherId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`year\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`notReportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`reportedLessonNames\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`notReportedLessonNames\`
            FROM \`teacher_lesson_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`year\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, [dbName,"VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`year`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

}
