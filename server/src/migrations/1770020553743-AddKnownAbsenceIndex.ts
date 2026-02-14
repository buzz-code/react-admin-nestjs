import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKnownAbsenceIndex1770020553743 implements MigrationInterface {
    name = 'AddKnownAbsenceIndex1770020553743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE INDEX \`known_absences_lookup_idx\` ON \`known_absences\` (
                \`user_id\`,
                \`year\`,
                \`isApproved\`,
                \`studentReferenceId\`
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DROP INDEX \`known_absences_lookup_idx\` ON \`known_absences\`
        `);
    }

}
