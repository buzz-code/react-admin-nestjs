import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertTeacherEmailToArray1788633251783 implements MigrationInterface {
    name = 'ConvertTeacherEmailToArray1788633251783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\` MODIFY COLUMN \`email\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\` MODIFY COLUMN \`email\` varchar(500) NULL
        `);
    }

}
