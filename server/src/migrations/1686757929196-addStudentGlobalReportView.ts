import { MigrationInterface, QueryRunner } from "typeorm";

export class addStudentGlobalReportView1686757929196 implements MigrationInterface {
    name = 'addStudentGlobalReportView1686757929196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                SUM(how_many_lessons) AS \`lessons_count\`,
                SUM(abs_count) AS \`abs_count\`,
                AVG(grade) AS \`grade_avg\`
            FROM \`att_report_and_grade\` \`atag\`
            GROUP BY studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                user_id,
                year
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
        `, [dbName,"VIEW","student_global_report","SELECT user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` GROUP BY studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, user_id, year"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_global_report",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
    }

}
