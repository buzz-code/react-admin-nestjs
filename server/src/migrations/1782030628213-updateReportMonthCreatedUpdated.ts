import { MigrationInterface, QueryRunner } from "typeorm";

export class updateReportMonthCreatedUpdated1782030628213 implements MigrationInterface {
    name = 'updateReportMonthCreatedUpdated1782030628213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`report_month\` 
            MODIFY COLUMN \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);

        await queryRunner.query(`
            ALTER TABLE \`report_month\` 
            MODIFY COLUMN \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`report_month\`
            MODIFY COLUMN \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_month\`
            MODIFY COLUMN \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
    }

}
