import { MigrationInterface, QueryRunner } from "typeorm";

export class filterTeacherReportStatusByYear1727206071127 implements MigrationInterface {
    name = 'filterTeacherReportStatusByYear1727206071127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
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
                LEFT JOIN \`att_report_with_report_month\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`reportMonthReferenceId\` = \`report_months\`.\`id\`
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
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","teacher_lesson_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `lessons`.`year` AS `year`, `lessons`.`name` AS `lessonName`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id` AND `report_months`.`year` = `lessons`.`year`  LEFT JOIN `att_report_with_report_month` `att_reports` ON `att_reports`.`teacherReferenceId` = `teachers`.`id` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`reportMonthReferenceId` = `report_months`.`id` WHERE COALESCE(`lessons`.`start_date`, `report_months`.`endDate`) <= `report_months`.`endDate` AND COALESCE(`lessons`.`end_date`, `report_months`.`startDate`) >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
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
                LEFT JOIN \`att_report_with_report_month\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`reportMonthReferenceId\` = \`report_months\`.\`id\`
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
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","teacher_lesson_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `lessons`.`year` AS `year`, `lessons`.`name` AS `lessonName`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id`  LEFT JOIN `att_report_with_report_month` `att_reports` ON `att_reports`.`teacherReferenceId` = `teachers`.`id` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`reportMonthReferenceId` = `report_months`.`id` WHERE COALESCE(`lessons`.`start_date`, `report_months`.`endDate`) <= `report_months`.`endDate` AND COALESCE(`lessons`.`end_date`, `report_months`.`startDate`) >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
    }

}
