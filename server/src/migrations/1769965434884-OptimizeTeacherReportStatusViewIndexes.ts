import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeTeacherReportStatusViewIndexes1769965434884 implements MigrationInterface {
    name = 'OptimizeTeacherReportStatusViewIndexes1769965434884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
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
            CREATE INDEX \`lessons_user_year_teacher_idx\` ON \`lessons\` (\`user_id\`, \`year\`, \`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`lessons_teacher_year_idx\` ON \`lessons\` (\`teacherReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_teacher_lesson_date_idx\` ON \`att_reports\` (
                \`teacherReferenceId\`,
                \`lessonReferenceId\`,
                \`report_date\`
            )
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_lesson_report_status\` AS
            SELECT \`lessons\`.\`id\` AS \`lessonId\`,
                \`lessons\`.\`user_id\` AS \`userId\`,
                \`lessons\`.\`year\` AS \`year\`,
                \`lessons\`.\`name\` AS \`lessonName\`,
                \`lessons\`.\`teacherReferenceId\` AS \`teacherId\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                CASE
                    WHEN COUNT(\`att_reports\`.\`id\`) > 0 THEN 1
                    ELSE 0
                END AS \`isReported\`
            FROM \`lessons\` \`lessons\`
                INNER JOIN \`teachers\` \`teachers\` ON \`teachers\`.\`id\` = \`lessons\`.\`teacherReferenceId\`
                AND \`teachers\`.\`user_id\` = \`lessons\`.\`user_id\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`lessons\`.\`user_id\`
                AND \`report_months\`.\`year\` = \`lessons\`.\`year\`
                LEFT JOIN \`att_reports\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`lessons\`.\`teacherReferenceId\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`report_date\` BETWEEN \`report_months\`.\`startDate\` AND \`report_months\`.\`endDate\`
            WHERE \`report_months\`.\`id\` IS NOT NULL
                AND (
                    \`lessons\`.\`start_date\` IS NULL
                    OR \`lessons\`.\`start_date\` <= \`report_months\`.\`endDate\`
                )
                AND (
                    \`lessons\`.\`end_date\` IS NULL
                    OR \`lessons\`.\`end_date\` >= \`report_months\`.\`startDate\`
                )
            GROUP BY \`lessons\`.\`teacherReferenceId\`,
                \`lessons\`.\`user_id\`,
                \`lessons\`.\`id\`,
                \`report_months\`.\`id\`
            ORDER BY \`report_months\`.\`id\` ASC
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
        `, [dbName,"VIEW","teacher_lesson_report_status","SELECT `lessons`.`id` AS `lessonId`, `lessons`.`user_id` AS `userId`, `lessons`.`year` AS `year`, `lessons`.`name` AS `lessonName`, `lessons`.`teacherReferenceId` AS `teacherId`, `report_months`.`id` AS `reportMonthId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `lessons` `lessons` INNER JOIN `teachers` `teachers` ON `teachers`.`id` = `lessons`.`teacherReferenceId` AND `teachers`.`user_id` = `lessons`.`user_id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `lessons`.`user_id` AND `report_months`.`year` = `lessons`.`year`  LEFT JOIN `att_reports` `att_reports` ON `att_reports`.`teacherReferenceId` = `lessons`.`teacherReferenceId` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`report_date` BETWEEN `report_months`.`startDate` AND `report_months`.`endDate` WHERE `report_months`.`id` IS NOT NULL AND (`lessons`.`start_date` IS NULL OR `lessons`.`start_date` <= `report_months`.`endDate`) AND (`lessons`.`end_date` IS NULL OR `lessons`.`end_date` >= `report_months`.`startDate`) GROUP BY `lessons`.`teacherReferenceId`, `lessons`.`user_id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
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
        `, ["VIEW","teacher_lesson_report_status",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_teacher_lesson_date_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`lessons_teacher_year_idx\` ON \`lessons\`
        `);
        await queryRunner.query(`
            DROP INDEX \`lessons_user_year_teacher_idx\` ON \`lessons\`
        `);
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
        `, [dbName,"VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_lesson_report_status\` AS
            SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                \`lessons\`.\`id\` AS \`lessonId\`,
                \`lessons\`.\`year\` AS \`year\`,
                \`lessons\`.\`name\` AS \`lessonName\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                \`teachers\`.\`user_id\` AS \`userId\`,
                CASE
                    WHEN COUNT(\`att_reports\`.\`id\`) > 0 THEN 1
                    ELSE 0
                END AS \`isReported\`
            FROM \`teachers\` \`teachers\`
                INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                AND \`report_months\`.\`year\` = \`lessons\`.\`year\`
                LEFT JOIN \`att_reports\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
            WHERE COALESCE(
                    \`lessons\`.\`start_date\`,
                    \`report_months\`.\`endDate\`
                ) <= \`report_months\`.\`endDate\`
                AND COALESCE(
                    \`lessons\`.\`end_date\`,
                    \`report_months\`.\`startDate\`
                ) >= \`report_months\`.\`startDate\`
            GROUP BY \`teachers\`.\`id\`,
                \`lessons\`.\`id\`,
                \`report_months\`.\`id\`
            ORDER BY \`report_months\`.\`id\` ASC
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
        `, [dbName,"VIEW","teacher_lesson_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `lessons`.`year` AS `year`, `lessons`.`name` AS `lessonName`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id` AND `report_months`.`year` = `lessons`.`year`  LEFT JOIN `att_reports` `att_reports` ON `att_reports`.`teacherReferenceId` = `teachers`.`id` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate` WHERE COALESCE(`lessons`.`start_date`, `report_months`.`endDate`) <= `report_months`.`endDate` AND COALESCE(`lessons`.`end_date`, `report_months`.`startDate`) >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
    }

}
