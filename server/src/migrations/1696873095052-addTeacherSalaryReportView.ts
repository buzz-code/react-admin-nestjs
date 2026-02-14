import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherSalaryReportView1696873095052 implements MigrationInterface {
    name = 'addTeacherSalaryReportView1696873095052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE VIEW \`teacher_salary_report\` AS
            SELECT DISTINCT \`att_reports\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                \`att_reports\`.\`klassReferenceId\` AS \`klassReferenceId\`,
                \`att_reports\`.\`lessonReferenceId\` AS \`lessonReferenceId\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                CONCAT(
                    \`att_reports\`.\`user_id\`,
                    "_",
                    \`att_reports\`.\`teacherReferenceId\`,
                    "_",
                    \`att_reports\`.\`lessonReferenceId\`,
                    "_",
                    \`att_reports\`.\`klassReferenceId\`,
                    "_",
                    \`att_reports\`.\`how_many_lessons\`,
                    "_",
                    \`report_months\`.\`id\`
                ) AS \`id\`,
                \`att_reports\`.\`user_id\` AS \`userId\`,
                \`att_reports\`.\`how_many_lessons\` AS \`how_many_lessons\`
            FROM \`att_reports\` \`att_reports\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`att_reports\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
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
        `, [dbName,"VIEW","teacher_salary_report","SELECT DISTINCT `att_reports`.`teacherReferenceId` AS `teacherReferenceId`, `att_reports`.`klassReferenceId` AS `klassReferenceId`, `att_reports`.`lessonReferenceId` AS `lessonReferenceId`, `report_months`.`id` AS `reportMonthId`, CONCAT(`att_reports`.`user_id`, \"_\", `att_reports`.`teacherReferenceId`, \"_\", `att_reports`.`lessonReferenceId`, \"_\", `att_reports`.`klassReferenceId`, \"_\", `att_reports`.`how_many_lessons`, \"_\", `report_months`.`id`) AS `id`, `att_reports`.`user_id` AS `userId`, `att_reports`.`how_many_lessons` AS `how_many_lessons` FROM `att_reports` `att_reports` LEFT JOIN `report_month` `report_months` ON `att_reports`.`user_id` = `report_months`.`userId` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_salary_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`teacher_salary_report\`
        `);
    }

}
