import { MigrationInterface, QueryRunner } from "typeorm";

export class migrationschangeGradeToBeDecimal1707244388438 implements MigrationInterface {
    name = 'migrationschangeGradeToBeDecimal1707244388438'

    //            ALTER TABLE \`att_reports\` CHANGE \`abs_count\` \`abs_count\` float NOT NULL DEFAULT '0'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`grade\` \`grade\` float NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`grade\` \`grade\` int NOT NULL DEFAULT '0'
        `);
    }

}
