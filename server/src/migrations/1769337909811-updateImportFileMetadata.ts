import { MigrationInterface, QueryRunner } from "typeorm"

export class updateImportFileMetadata1769337909811 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` MODIFY COLUMN \`metadata\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` MODIFY COLUMN \`metadata\` json NULL
        `);
    }

}
