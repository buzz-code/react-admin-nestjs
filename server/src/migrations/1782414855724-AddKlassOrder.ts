import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKlassOrder1782414855724 implements MigrationInterface {
    name = 'AddKlassOrder1782414855724';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD \`order\` int NULL DEFAULT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP COLUMN \`order\`
        `);
    }
}