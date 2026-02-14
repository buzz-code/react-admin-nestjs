import { MigrationInterface, QueryRunner } from "typeorm";

export class addAttReportAndGradeView1686757018415 implements MigrationInterface {
    name = 'addAttReportAndGradeView1686757018415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE VIEW \`att_report_and_grade\` AS
            SELECT CONCAT('a-', id) AS id,
                'att' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                abs_count,
                approved_abs_count,
                NULL AS 'grade',
                comments,
                sheet_name
            FROM att_reports
            UNION
            SELECT CONCAT('g-', id) AS id,
                'grade' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                NULL AS 'abs_count',
                NULL AS 'approved_abs_count',
                grade,
                comments,
                NULL AS 'sheet_name'
            FROM grades
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
        `, [dbName,"VIEW","att_report_and_grade","SELECT\n      CONCAT('a-', id) AS id,\n      'att' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      abs_count,\n      approved_abs_count,\n      NULL AS 'grade',\n      comments,\n      sheet_name\n  FROM\n      att_reports\n  UNION\n  SELECT\n      CONCAT('g-', id) AS id,\n      'grade' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      NULL AS 'abs_count',\n      NULL AS 'approved_abs_count',\n      grade,\n      comments,\n      NULL AS 'sheet_name'\n  FROM\n      grades"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_and_grade",dbName]);
        await queryRunner.query(`
            DROP VIEW \`att_report_and_grade\`
        `);
    }

}
