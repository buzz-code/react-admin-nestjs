import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAbsenceTypeSupport1770908593578 implements MigrationInterface {
    name = 'AddAbsenceTypeSupport1770908593578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE TABLE \`absenceTypes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`name\` varchar(100) NOT NULL,
                \`quota\` decimal(5, 1) NOT NULL,
                \`required_labels\` text NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_351f1bb198705b306e16462dcc\` (\`user_id\`, \`name\`, \`year\`),
                INDEX \`absenceTypes_users_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`absence_type_id\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`absence_type_id\`
        `);
        await queryRunner.query(`
            DROP INDEX \`absenceTypes_users_idx\` ON \`absenceTypes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_351f1bb198705b306e16462dcc\` ON \`absenceTypes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`absenceTypes\`
        `);
    }

}
