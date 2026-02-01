import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeAttReportWithReportMonthView1769967565080 implements MigrationInterface {
    name = 'OptimizeAttReportWithReportMonthView1769967565080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_with_report_month","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`att_report_with_report_month\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`import_file_user_id_idx\` ON \`import_file\` (\`userId\`)
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                ar.*
            FROM \`att_reports\` \`ar\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`ar\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`ar\`.\`year\` = \`report_months\`.\`year\`
                AND \`ar\`.\`report_date\` BETWEEN \`report_months\`.\`startDate\` AND \`report_months\`.\`endDate\`
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
        `, ["meir_att_copy_ra","VIEW","att_report_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, ar.* FROM `att_reports` `ar` LEFT JOIN `report_month` `report_months` ON `ar`.`user_id` = `report_months`.`userId` AND `ar`.`year` = `report_months`.`year` AND `ar`.`report_date` BETWEEN `report_months`.`startDate` AND `report_months`.`endDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_with_report_month","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`att_report_with_report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`import_file_user_id_idx\` ON \`import_file\`
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
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","att_report_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, ar.* FROM `att_reports` `ar` LEFT JOIN `report_month` `report_months` ON `ar`.`user_id` = `report_months`.`userId` AND `ar`.`report_date` <= `report_months`.`endDate` AND `ar`.`report_date` >= `report_months`.`startDate`"]);
    }

}
