import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToStudent1749152815025 implements MigrationInterface {
    name = 'AddIsActiveToStudent1749152815025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`is_active\` tinyint NOT NULL DEFAULT 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`is_active\`
        `);
    }

}
