import { MigrationInterface, QueryRunner } from "typeorm";

export class removeReportGroupFromImportFile1762188353979 implements MigrationInterface {
    name = 'removeReportGroupFromImportFile1762188353979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`reportGroupId\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`reportGroupId\` int NULL
        `);
    }

}
