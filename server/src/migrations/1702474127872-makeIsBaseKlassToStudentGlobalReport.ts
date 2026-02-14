import { MigrationInterface, QueryRunner } from "typeorm";

export class makeIsBaseKlassToStudentGlobalReport1702474127872 implements MigrationInterface {
    name = 'makeIsBaseKlassToStudentGlobalReport1702474127872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW", "student_global_report", dbName]);
            await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT \`atag\`.\`year\` AS \`year\`,
                \`atag\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                CONCAT(
                    COALESCE(studentReferenceId, "null"),
                    "_",
                    COALESCE(\`atag\`.\`teacherReferenceId\`, "null"),
                    "_",
                    COALESCE(klassReferenceId, "null"),
                    "_",
                    COALESCE(lessonReferenceId, "null"),
                    "_",
                    COALESCE(\`atag\`.\`user_id\`, "null"),
                    "_",
                    COALESCE(\`atag\`.\`year\`, "null")
                ) AS \`id\`,
                \`atag\`.\`user_id\` AS \`user_id\`,
                studentReferenceId,
                klassReferenceId,
                lessonReferenceId,
                CASE
                    WHEN \`klass_types\`.\`klassTypeEnum\` = "כיתת אם" THEN 1
                    ELSE 0
                END AS \`isBaseKlass\`,
                SUM(how_many_lessons) AS \`lessons_count\`,
                SUM(abs_count) AS \`abs_count\`,
                AVG(grade) AS \`grade_avg\`
            FROM \`att_report_and_grade\` \`atag\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`atag\`.\`klassReferenceId\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
            GROUP BY studentReferenceId,
                \`atag\`.\`teacherReferenceId\`,
                klassReferenceId,
                lessonReferenceId,
                \`atag\`.\`user_id\`,
                \`atag\`.\`year\`
        `);
        await queryRunner.query(`
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName, "VIEW", "student_global_report", "SELECT `atag`.`year` AS `year`, `atag`.`teacherReferenceId` AS `teacherReferenceId`, CONCAT(COALESCE(studentReferenceId, \"null\"), \"_\", COALESCE(`atag`.`teacherReferenceId`, \"null\"), \"_\", COALESCE(klassReferenceId, \"null\"), \"_\", COALESCE(lessonReferenceId, \"null\"), \"_\", COALESCE(`atag`.`user_id`, \"null\"), \"_\", COALESCE(`atag`.`year`, \"null\")) AS `id`, `atag`.`user_id` AS `user_id`, studentReferenceId, klassReferenceId, lessonReferenceId, CASE WHEN `klass_types`.`klassTypeEnum` = \"כיתת אם\" THEN 1 ELSE 0 END AS `isBaseKlass`, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `atag`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` GROUP BY studentReferenceId, `atag`.`teacherReferenceId`, klassReferenceId, lessonReferenceId, `atag`.`user_id`, `atag`.`year`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW", "student_global_report", dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
    }

}
