import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttReportUserReportDateIndex1791317504779 implements MigrationInterface {
    name = 'AddAttReportUserReportDateIndex1791317504779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`att_user_report_date_idx\` ON \`att_reports\` (\`user_id\`, \`report_date\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`att_user_report_date_idx\` ON \`att_reports\``);
    }

}
