import { MigrationInterface, QueryRunner } from "typeorm"

export class RefreshKnownAbsenceWithReportMonthView1771104356596 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE VIEW \`known_absence_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                known_absences.*
            FROM \`known_absences\` \`known_absences\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`known_absences\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`known_absences\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`known_absences\`.\`report_date\` >= \`report_months\`.\`startDate\`
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE VIEW \`known_absence_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                known_absences.*
            FROM \`known_absences\` \`known_absences\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`known_absences\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`known_absences\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`known_absences\`.\`report_date\` >= \`report_months\`.\`startDate\`
        `)
    }

}
