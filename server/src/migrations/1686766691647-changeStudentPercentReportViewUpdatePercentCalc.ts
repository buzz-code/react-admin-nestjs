import { MigrationInterface, QueryRunner } from "typeorm";

export class changeStudentPercentReportViewUpdatePercentCalc1686766691647 implements MigrationInterface {
    name = 'changeStudentPercentReportViewUpdatePercentCalc1686766691647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_percent_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_percent_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_percent_report\` AS
            SELECT id,
                user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                lessons_count,
                abs_count,
                COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) AS \`abs_percents\`,
                (
                    1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)
                ) AS \`att_percents\`,
                grade_avg
            FROM \`student_global_report\` \`sgr\`
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
        `, [dbName,"VIEW","student_percent_report","SELECT id, user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, lessons_count, abs_count, COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) AS `abs_percents`, (1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)) AS `att_percents`, grade_avg FROM `student_global_report` `sgr`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_percent_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_percent_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_percent_report\` AS
            SELECT id,
                user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                lessons_count,
                abs_count,
                COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) * 100 AS \`abs_percents\`,
                (
                    1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)
                ) * 100 AS \`att_percents\`,
                grade_avg
            FROM \`student_global_report\` \`sgr\`
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
        `, [dbName,"VIEW","student_percent_report","SELECT id, user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, lessons_count, abs_count, COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) * 100 AS `abs_percents`, (1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)) * 100 AS `att_percents`, grade_avg FROM `student_global_report` `sgr`"]);
    }

}
