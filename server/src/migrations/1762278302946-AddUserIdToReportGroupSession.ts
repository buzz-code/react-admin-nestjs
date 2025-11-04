import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToReportGroupSession1762278302946 implements MigrationInterface {
    name = 'AddUserIdToReportGroupSession1762278302946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('report_group_sessions');
        const hasUserIdColumn = table?.findColumnByName('userId');
        if (!hasUserIdColumn) {
            // Add userId column as nullable first
            await queryRunner.query(`
                ALTER TABLE \`report_group_sessions\`
                ADD \`userId\` int NULL
            `);
        }

        // Populate userId from report_groups table
        await queryRunner.query(`
            UPDATE \`report_group_sessions\` rgs
            INNER JOIN \`report_groups\` rg ON rgs.reportGroupId = rg.id
            SET rgs.userId = rg.user_id
        `);

        // Make userId NOT NULL now that it's populated
        await queryRunner.query(`
            ALTER TABLE \`report_group_sessions\`
            MODIFY \`userId\` int NOT NULL
        `);

        // Add index
        const hasIndex = table.indices.find(index => index.name === 'report_group_sessions_user_id_idx');
        if (!hasIndex) {
            await queryRunner.query(`
                CREATE INDEX \`report_group_sessions_user_id_idx\` ON \`report_group_sessions\` (\`userId\`)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('report_group_sessions');
        const hasUserIdColumn = table?.findColumnByName('userId');
        if (!hasUserIdColumn) {
            return;
        }

        const hasIndex = table.indices.find(index => index.name === 'report_group_sessions_user_id_idx');
        if (hasIndex) {
            await queryRunner.query(`
            DROP INDEX \`report_group_sessions_user_id_idx\` ON \`report_group_sessions\`
        `);
        }
        await queryRunner.query(`
            ALTER TABLE \`report_group_sessions\` DROP COLUMN \`userId\`
        `);
    }

}
