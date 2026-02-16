import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadataToImportFile1759248397724 implements MigrationInterface {
    name = 'AddMetadataToImportFile1759248397724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`metadata\` json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        `);
    }

}
