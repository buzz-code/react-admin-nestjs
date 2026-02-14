import { MigrationInterface, QueryRunner } from "typeorm";

export class recreateAttReportWithReportMonth1762282737170 implements MigrationInterface {
    name = 'recreateAttReportWithReportMonth1762282737170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_with_report_month",dbName]);
        await queryRunner.query(`
            DROP VIEW \`att_report_with_report_month\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                ar.*
            FROM \`att_reports\` \`ar\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`ar\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`ar\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`ar\`.\`report_date\` >= \`report_months\`.\`startDate\`
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
        `, [dbName,"VIEW","att_report_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, ar.* FROM `att_reports` `ar` LEFT JOIN `report_month` `report_months` ON `ar`.`user_id` = `report_months`.`userId` AND `ar`.`report_date` <= `report_months`.`endDate` AND `ar`.`report_date` >= `report_months`.`startDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_with_report_month",dbName]);
        await queryRunner.query(`
            DROP VIEW \`att_report_with_report_month\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                att_reports.*
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
        `, [dbName,"VIEW","att_report_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, att_reports.* FROM `att_reports` `att_reports` LEFT JOIN `report_month` `report_months` ON `att_reports`.`user_id` = `report_months`.`userId` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate`"]);
    }

}
