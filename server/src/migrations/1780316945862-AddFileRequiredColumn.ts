import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileRequiredColumn1780316945862 implements MigrationInterface {
    name = 'AddFileRequiredColumn1780316945862'

    public async up(queryRunner: QueryRunner): Promise<void> {
     
        await queryRunner.query(`
            ALTER TABLE \`absenceTypes\`
            ADD \`is_file_required\` tinyint NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`absenceTypes\` DROP COLUMN \`is_file_required\`
        `);
       
       
    }

}
