import { MigrationInterface, QueryRunner } from "typeorm";

export class addAttendanceCleanupRulesTable1787200000000 implements MigrationInterface {
    name = 'addAttendanceCleanupRulesTable1787200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`attendance_cleanup_rules\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(255) NULL,
                \`lesson_id\` int NOT NULL,
                \`lessonReferenceId\` int NULL,
                \`klass_id\` int NOT NULL,
                \`klassReferenceId\` int NULL,
                \`day_of_week\` int NOT NULL,
                \`weeks_back\` int NOT NULL DEFAULT '2',
                \`active\` tinyint NOT NULL DEFAULT '1',
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`attendance_cleanup_rules_users_idx\` (\`user_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`attendance_cleanup_rules\``);
    }

}
