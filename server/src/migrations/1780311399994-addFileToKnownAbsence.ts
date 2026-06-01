import { MigrationInterface, QueryRunner } from "typeorm";

export class addFileToKnownAbsence1780311399994 implements MigrationInterface {
    name = 'addFileToKnownAbsence1780311399994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`fileDataSrc\` mediumtext NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`fileDataTitle\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`fileDataTitle\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`fileDataSrc\`
        `);
       
    }

}
