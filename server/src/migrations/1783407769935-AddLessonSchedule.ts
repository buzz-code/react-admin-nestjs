import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessonSchedule1783407769935 implements MigrationInterface {
    name = 'AddLessonSchedule1783407769935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE TABLE \`lesson_schedules\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`organizational_year\` varchar(10) NULL,
                \`start_time\` time NULL,
                \`schedule_date\` date NOT NULL,
                \`klass_id\` int NULL,
                \`klassReferenceId\` int NULL,
                \`lesson_id\` int NULL,
                \`lessonReferenceId\` int NULL,
                \`group_number\` int NULL,
                \`teacher_id\` varchar(10) NULL,
                \`teacherReferenceId\` int NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`lesson_schedules_users_idx\` (\`user_id\`),
                INDEX \`lesson_schedules_teacher_date_idx\` (\`user_id\`, \`teacherReferenceId\`, \`schedule_date\`),
                INDEX \`lesson_schedules_date_idx\` (\`user_id\`, \`schedule_date\`),
                INDEX \`lesson_schedules_klass_reference_id_idx\` (\`klassReferenceId\`),
                INDEX \`lesson_schedules_lesson_reference_id_idx\` (\`lessonReferenceId\`),
                INDEX \`lesson_schedules_teacher_reference_id_idx\` (\`teacherReferenceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DROP TABLE \`lesson_schedules\`
        `);
    }

}
