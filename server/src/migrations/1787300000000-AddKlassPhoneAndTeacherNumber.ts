import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKlassPhoneAndTeacherNumber1787300000000 implements MigrationInterface {
    name = 'AddKlassPhoneAndTeacherNumber1787300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD \`phone\` varchar(20) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD INDEX \`klasses_user_id_phone_idx\` (\`user_id\`, \`phone\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`number\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD INDEX \`teachers_user_id_number_idx\` (\`user_id\`, \`number\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP INDEX \`teachers_user_id_number_idx\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`number\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP INDEX \`klasses_user_id_phone_idx\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP COLUMN \`phone\`
        `);
    }

}
