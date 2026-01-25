import { MigrationInterface, QueryRunner } from "typeorm"

export class updateImportFileMetadata1769337909811 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        // `);
        // await queryRunner.query(`
        //     ALTER TABLE \`import_file\`
        //     ADD \`metadata\` text NULL
        // `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\` MODIFY COLUMN \`metadata\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        // `);
        // await queryRunner.query(`
        //     ALTER TABLE \`import_file\`
        //     ADD \`metadata\` json NULL
        // `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\` MODIFY COLUMN \`metadata\` json NULL
        `);
    }

}
