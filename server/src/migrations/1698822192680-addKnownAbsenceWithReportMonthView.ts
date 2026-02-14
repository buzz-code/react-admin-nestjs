import { MigrationInterface, QueryRunner } from "typeorm";

export class addKnownAbsenceWithReportMonthView1698822192680 implements MigrationInterface {
    name = 'addKnownAbsenceWithReportMonthView1698822192680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE VIEW \`known_absence_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                known_absences.*
            FROM \`known_absences\` \`known_absences\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`known_absences\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`known_absences\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`known_absences\`.\`report_date\` >= \`report_months\`.\`startDate\`
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
        `, [dbName,"VIEW","known_absence_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, known_absences.* FROM `known_absences` `known_absences` LEFT JOIN `report_month` `report_months` ON `known_absences`.`user_id` = `report_months`.`userId` AND `known_absences`.`report_date` <= `report_months`.`endDate` AND `known_absences`.`report_date` >= `report_months`.`startDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","known_absence_with_report_month",dbName]);
        await queryRunner.query(`
            DROP VIEW \`known_absence_with_report_month\`
        `);
    }

}
