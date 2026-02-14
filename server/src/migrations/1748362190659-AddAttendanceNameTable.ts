import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttendanceNameTable1748362190659 implements MigrationInterface {
    name = 'AddAttendanceNameTable1748362190659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE TABLE \`attendance_names\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`key\` int NOT NULL,
                \`name\` varchar(500) NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`attendance_names_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DROP INDEX \`attendance_names_user_id_idx\` ON \`attendance_names\`
        `);
        await queryRunner.query(`
            DROP TABLE \`attendance_names\`
        `);
    }

}
