import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKlassGrade1792100000000 implements MigrationInterface {
    name = 'AddKlassGrade1792100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD \`grade\` varchar(50) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP COLUMN \`grade\`
        `);
    }

}
