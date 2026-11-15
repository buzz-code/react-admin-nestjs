import { MigrationInterface, QueryRunner } from "typeorm";

export class addAttendanceCleanupRuleLastRun1794780000000 implements MigrationInterface {
    name = 'addAttendanceCleanupRuleLastRun1794780000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`attendance_cleanup_rules\`
            ADD \`last_run_at\` datetime NULL,
            ADD \`last_run_summary\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`attendance_cleanup_rules\`
            DROP COLUMN \`last_run_summary\`,
            DROP COLUMN \`last_run_at\`
        `);
    }

}
