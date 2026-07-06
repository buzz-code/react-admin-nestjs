import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentNumberToStudents1783286226248 implements MigrationInterface {
    name = 'AddStudentNumberToStudents1783286226248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`student_number\` varchar(20) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD UNIQUE INDEX \`students_user_student_number_year_unique\` (\`user_id\`, \`student_number\`, \`year\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP INDEX \`students_user_student_number_year_unique\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`student_number\`
        `);
    }

}
