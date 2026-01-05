import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAttReportView1767647010979 implements MigrationInterface {
    name = 'FixAttReportView1767647010979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn('att_report_with_report_month', 'reportMonthReferenceId');
        if (!hasColumn) {
            await queryRunner.query(`
                CREATE OR REPLACE VIEW \`att_report_with_report_month\` AS
                SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                    ar.*
                FROM \`att_reports\` \`ar\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`ar\`.\`user_id\` = \`report_months\`.\`userId\`
                    AND \`ar\`.\`report_date\` <= \`report_months\`.\`endDate\`
                    AND \`ar\`.\`report_date\` >= \`report_months\`.\`startDate\`
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to previous state if needed, but usually we just want the fix.
        // This is a best-effort revert to what might have been there or just drop.
        // For now, we can leave it or restore the old broken view if strictness is required.
    }
}
