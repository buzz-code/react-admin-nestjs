import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentKlassIndex1770279227490 implements MigrationInterface {
    name = 'AddStudentKlassIndex1770279227490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_user_year_student_klass_covering_idx\` ON \`student_klasses\` (
                \`user_id\`,
                \`year\`,
                \`studentReferenceId\`,
                \`klassReferenceId\`
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DROP INDEX \`student_klasses_user_year_student_klass_covering_idx\` ON \`student_klasses\`
        `);
    }

}
