import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportGroups1762113630653 implements MigrationInterface {
    name = 'AddReportGroups1762113630653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE TABLE \`report_groups\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`topic\` varchar(255) NULL,
                \`signatureData\` longtext NULL,
                \`teacherReferenceId\` int NULL,
                \`lessonReferenceId\` int NULL,
                \`klassReferenceId\` int NULL,
                \`year\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`report_groups_teacher_reference_id_idx\` (\`teacherReferenceId\`),
                INDEX \`report_groups_lesson_reference_id_idx\` (\`lessonReferenceId\`),
                INDEX \`report_groups_klass_reference_id_idx\` (\`klassReferenceId\`),
                INDEX \`report_groups_user_id_year_idx\` (\`user_id\`, \`year\`),
                INDEX \`report_groups_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`report_group_sessions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`reportGroupId\` int NOT NULL,
                \`sessionDate\` date NOT NULL,
                \`startTime\` time NULL,
                \`endTime\` time NULL,
                \`topic\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`report_group_sessions_session_date_idx\` (\`sessionDate\`),
                INDEX \`report_group_sessions_report_group_id_idx\` (\`reportGroupId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`reportGroupId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\`
            ADD \`reportGroupSessionId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\`
            ADD \`reportGroupSessionId\` int NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_report_group_session_id_idx\` ON \`grades\` (\`reportGroupSessionId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_report_group_session_id_idx\` ON \`att_reports\` (\`reportGroupSessionId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\`
            ADD CONSTRAINT \`FK_579303ddfd4db8a8ef18c204a7d\` FOREIGN KEY (\`teacherReferenceId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\`
            ADD CONSTRAINT \`FK_bab150da3f43312d8f5c79c969f\` FOREIGN KEY (\`lessonReferenceId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\`
            ADD CONSTRAINT \`FK_772594ba35c0745b0c5a84650a4\` FOREIGN KEY (\`klassReferenceId\`) REFERENCES \`klasses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\`
            ADD CONSTRAINT \`FK_5c91c58f91111e08ec84f6eab68\` FOREIGN KEY (\`reportGroupSessionId\`) REFERENCES \`report_group_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_group_sessions\`
            ADD CONSTRAINT \`FK_54fa521a3b90bf74266907b95f1\` FOREIGN KEY (\`reportGroupId\`) REFERENCES \`report_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\`
            ADD CONSTRAINT \`FK_88c1147de5df0c80cce823ebdb8\` FOREIGN KEY (\`reportGroupSessionId\`) REFERENCES \`report_group_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` DROP FOREIGN KEY \`FK_88c1147de5df0c80cce823ebdb8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_group_sessions\` DROP FOREIGN KEY \`FK_54fa521a3b90bf74266907b95f1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` DROP FOREIGN KEY \`FK_5c91c58f91111e08ec84f6eab68\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\` DROP FOREIGN KEY \`FK_772594ba35c0745b0c5a84650a4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\` DROP FOREIGN KEY \`FK_bab150da3f43312d8f5c79c969f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_groups\` DROP FOREIGN KEY \`FK_579303ddfd4db8a8ef18c204a7d\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_report_group_session_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_report_group_session_id_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` DROP COLUMN \`reportGroupSessionId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` DROP COLUMN \`reportGroupSessionId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`reportGroupId\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_group_sessions_report_group_id_idx\` ON \`report_group_sessions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_group_sessions_session_date_idx\` ON \`report_group_sessions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`report_group_sessions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_groups_user_id_idx\` ON \`report_groups\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_groups_user_id_year_idx\` ON \`report_groups\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_groups_klass_reference_id_idx\` ON \`report_groups\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_groups_lesson_reference_id_idx\` ON \`report_groups\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_groups_teacher_reference_id_idx\` ON \`report_groups\`
        `);
        await queryRunner.query(`
            DROP TABLE \`report_groups\`
        `);
    }

}
