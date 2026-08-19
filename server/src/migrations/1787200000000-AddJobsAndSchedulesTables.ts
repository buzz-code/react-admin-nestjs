import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the `jobs` (async task queue) and `schedules` (recurring job
 * definitions) tables backing the shared job/scheduler infra
 * (@shared/utils/jobs). Idempotent so it's safe to run alongside other
 * apps that already created these tables against the same infra version.
 */
export class AddJobsAndSchedulesTables1787200000000 implements MigrationInterface {
    name = 'AddJobsAndSchedulesTables1787200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`jobs\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`type\` varchar(100) NOT NULL,
                \`status\` varchar(20) NOT NULL DEFAULT 'pending',
                \`payload\` longtext NULL,
                \`result\` longtext NULL,
                \`progress\` int NOT NULL DEFAULT '0',
                \`attempts\` int NOT NULL DEFAULT '0',
                \`max_attempts\` int NOT NULL DEFAULT '3',
                \`available_at\` datetime NULL,
                \`locked_at\` datetime NULL,
                \`locked_by\` varchar(100) NULL,
                \`dedupe_key\` varchar(191) NULL,
                \`error\` text NULL,
                \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`completed_at\` datetime NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`job_user_id_idx\` (\`user_id\`),
                INDEX \`job_type_idx\` (\`type\`),
                INDEX \`job_status_idx\` (\`status\`),
                INDEX \`job_available_at_idx\` (\`available_at\`),
                INDEX \`job_dedupe_key_idx\` (\`dedupe_key\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`schedules\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`job_type\` varchar(100) NOT NULL,
                \`payload\` longtext NULL,
                \`cron_expression\` varchar(120) NOT NULL,
                \`time_zone\` varchar(60) NOT NULL DEFAULT 'Asia/Jerusalem',
                \`active\` tinyint(1) NOT NULL DEFAULT '1',
                \`next_run_at\` datetime NULL,
                \`last_run_at\` datetime NULL,
                \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                INDEX \`schedule_user_id_idx\` (\`user_id\`),
                INDEX \`schedule_next_run_at_idx\` (\`next_run_at\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`schedules\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`jobs\``);
    }

}
