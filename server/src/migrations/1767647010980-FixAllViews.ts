import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAllViews1767647010980 implements MigrationInterface {
    name = 'FixAllViews1767647010980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure numbers table exists as it is required for grade_effect views
        if (!(await queryRunner.hasTable('numbers'))) {
            await queryRunner.query(`
                CREATE TABLE numbers (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    number VARCHAR(255) NOT NULL,
                    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
                );
            `);
            for (let i = 1; i <= 100; i++) {
                await queryRunner.query(`
                    INSERT INTO numbers (number) VALUES ('${i}');
                `);
            }
            await queryRunner.query(`
                INSERT INTO numbers (number) VALUES ('0');
            `);
        }

        // Ensure att_grade_effect table has correct schema (some envs have legacy schema)
        if (await queryRunner.hasTable('att_grade_effect')) {
             if (!(await queryRunner.hasColumn('att_grade_effect', 'count'))) {
                 await queryRunner.query('DROP TABLE `att_grade_effect`');
             }
        }
        if (!(await queryRunner.hasTable('att_grade_effect'))) {
            await queryRunner.query(`
                CREATE TABLE \`att_grade_effect\` (
                  \`id\` int NOT NULL AUTO_INCREMENT,
                  \`user_id\` int NOT NULL,
                  \`percents\` int DEFAULT NULL,
                  \`count\` int DEFAULT NULL,
                  \`effect\` int NOT NULL,
                  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (\`id\`),
                  KEY \`att_grade_effect_user_id_idx\` (\`user_id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            await queryRunner.query(`
                INSERT INTO \`att_grade_effect\` (\`user_id\`, \`percents\`, \`count\`, \`effect\`) VALUES
                (1, 90, 2, 5),
                (1, 80, 3, 0),
                (1, 70, 4, -5);
            `);
        }

        // 1. student_percent_report
        // Check if 'abs_percents' column exists. If not, it's likely the old version.
        if (!(await queryRunner.hasColumn('student_percent_report', 'abs_percents'))) {
            await queryRunner.query(`
                CREATE OR REPLACE VIEW \`student_percent_report\` AS
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
                    grade_avg / 100 AS \`grade_avg\`
                FROM \`student_global_report\` \`sgr\`
            `);
        }

        // Helper View 1: att_report_with_report_month
        // Ensure this exists and has reportMonthReferenceId before it is used
        if (!(await queryRunner.hasColumn('att_report_with_report_month', 'reportMonthReferenceId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`att_report_with_report_month\` AS
                SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                    att_reports.*
                FROM \`att_reports\` \`att_reports\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`att_reports\`.\`user_id\` = \`report_months\`.\`userId\`
                    AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                    AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
            `);
        }

        // Helper View 2: grade_with_report_month
        // Ensure this exists and has reportMonthReferenceId before it is used
        if (!(await queryRunner.hasColumn('grade_with_report_month', 'reportMonthReferenceId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`grade_with_report_month\` AS
                SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                    grades.*
                FROM \`grades\` \`grades\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`grades\`.\`user_id\` = \`report_months\`.\`userId\`
                    AND \`grades\`.\`report_date\` <= \`report_months\`.\`endDate\`
                    AND \`grades\`.\`report_date\` >= \`report_months\`.\`startDate\`
            `);
        }

        // 2. teacher_lesson_report_status
        // Check if 'userId' column exists (camelCase). The old one usually uses 'user_id' or has different case behavior.
        // Data.sql definition uses `l.user_id`, outputting `user_id`. Latest uses `teachers.user_id AS userId`.
        if (!(await queryRunner.hasColumn('teacher_lesson_report_status', 'userId'))) {
            await queryRunner.query(`
                CREATE OR REPLACE VIEW \`teacher_lesson_report_status\` AS
                SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                    \`lessons\`.\`id\` AS \`lessonId\`,
                    \`lessons\`.\`year\` AS \`year\`,
                    \`lessons\`.\`name\` AS \`lessonName\`,
                    \`report_months\`.\`id\` AS \`reportMonthId\`,
                    \`teachers\`.\`user_id\` AS \`userId\`,
                    CASE
                        WHEN COUNT(\`att_reports\`.\`id\`) > 0 THEN 1
                        ELSE 0
                    END AS \`isReported\`
                FROM \`teachers\` \`teachers\`
                    INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                    AND \`report_months\`.\`year\` = \`lessons\`.\`year\`
                    LEFT JOIN \`att_report_with_report_month\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                    AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                    AND \`att_reports\`.\`reportMonthReferenceId\` = \`report_months\`.\`id\`
                WHERE COALESCE(
                        \`lessons\`.\`start_date\`,
                        \`report_months\`.\`endDate\`
                    ) <= \`report_months\`.\`endDate\`
                    AND COALESCE(
                        \`lessons\`.\`end_date\`,
                        \`report_months\`.\`startDate\`
                    ) >= \`report_months\`.\`startDate\`
                GROUP BY \`teachers\`.\`id\`,
                    \`lessons\`.\`id\`,
                    \`report_months\`.\`id\`
                ORDER BY \`report_months\`.\`id\` ASC
            `);
        }

        // 3. teacher_salary_report
        // Check if 'klassReferenceId' column exists. Old version does not have it.
        if (!(await queryRunner.hasColumn('teacher_salary_report', 'klassReferenceId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`teacher_salary_report\` AS
                SELECT DISTINCT \`att_reports\`.\`year\` AS \`year\`,
                    \`att_reports\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                    \`att_reports\`.\`klassReferenceId\` AS \`klassReferenceId\`,
                    \`att_reports\`.\`lessonReferenceId\` AS \`lessonReferenceId\`,
                    \`att_reports\`.\`reportMonthReferenceId\` AS \`reportMonthReferenceId\`,
                    CONCAT(
                        COALESCE(\`att_reports\`.\`user_id\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`teacherReferenceId\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`lessonReferenceId\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`klassReferenceId\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`how_many_lessons\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`year\`, "null"),
                        "_",
                        COALESCE(\`att_reports\`.\`reportMonthReferenceId\`, "null")
                    ) AS \`id\`,
                    \`att_reports\`.\`user_id\` AS \`userId\`,
                    \`att_reports\`.\`how_many_lessons\` AS \`how_many_lessons\`
                FROM \`att_report_with_report_month\` \`att_reports\`
            `);
        }

        // 4. abs_count_effect_by_user
        // Check if 'number' column exists. Old version uses simple select from att_grade_effect.
        if (!(await queryRunner.hasColumn('abs_count_effect_by_user', 'number'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`abs_count_effect_by_user\` AS
                SELECT \`users\`.\`id\` AS \`userId\`,
                    CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                    numbers.number AS \`number\`,
                    CAST(
                        COALESCE(
                            SUBSTRING_INDEX(
                                MAX(
                                    CASE
                                        WHEN \`att_grade_effect\`.\`count\` <= numbers.number THEN CONCAT(
                                            LPAD(\`att_grade_effect\`.\`count\`, 10, '0'),
                                            '|',
                                            \`att_grade_effect\`.\`effect\`
                                        )
                                        ELSE NULL
                                    END
                                ),
                                '|',
                                -1
                            ),
                            '0'
                        ) AS SIGNED
                    ) + 0 AS \`effect\`
                FROM \`numbers\` \`numbers\`
                    LEFT JOIN \`users\` \`users\` ON 1 = 1
                    LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                GROUP BY \`users\`.\`id\`,
                    numbers.number
                ORDER BY \`users\`.\`id\` ASC,
                    numbers.number ASC
            `);
        }

        // 7. grade_effect_by_user
        // Check if 'number' column exists.
        if (!(await queryRunner.hasColumn('grade_effect_by_user', 'number'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`grade_effect_by_user\` AS
                SELECT \`users\`.\`id\` AS \`userId\`,
                    CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                    numbers.number AS \`number\`,
                    CAST(
                        COALESCE(
                            SUBSTRING_INDEX(
                                MAX(
                                    CASE
                                        WHEN \`att_grade_effect\`.\`percents\` <= numbers.number THEN CONCAT(
                                            LPAD(\`att_grade_effect\`.\`percents\`, 10, '0'),
                                            '|',
                                            \`att_grade_effect\`.\`effect\`
                                        )
                                        ELSE NULL
                                    END
                                ),
                                '|',
                                -1
                            ),
                            '0'
                        ) AS SIGNED
                    ) + 0 AS \`effect\`
                FROM \`numbers\` \`numbers\`
                    LEFT JOIN \`users\` \`users\` ON 1 = 1
                    LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                GROUP BY \`users\`.\`id\`,
                    numbers.number
                ORDER BY \`users\`.\`id\` ASC,
                    numbers.number ASC
            `);
        }

        // 5. teacher_lesson_grade_report_status
        // Check if 'userId' column exists (camelCase).
        if (!(await queryRunner.hasColumn('teacher_lesson_grade_report_status', 'userId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`teacher_lesson_grade_report_status\` AS
                SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                    \`lessons\`.\`id\` AS \`lessonId\`,
                    \`lessons\`.\`year\` AS \`year\`,
                    \`lessons\`.\`name\` AS \`lessonName\`,
                    \`report_months\`.\`id\` AS \`reportMonthId\`,
                    \`teachers\`.\`user_id\` AS \`userId\`,
                    CASE
                        WHEN COUNT(\`grades\`.\`id\`) > 0 THEN 1
                        ELSE 0
                    END AS \`isReported\`
                FROM \`teachers\` \`teachers\`
                    INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                    LEFT JOIN \`grade_with_report_month\` \`grades\` ON \`grades\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                    AND \`grades\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                    AND \`grades\`.\`reportMonthReferenceId\` = \`report_months\`.\`id\`
                WHERE COALESCE(
                        \`lessons\`.\`start_date\`,
                        \`report_months\`.\`endDate\`
                    ) <= \`report_months\`.\`endDate\`
                    AND COALESCE(
                        \`lessons\`.\`end_date\`,
                        \`report_months\`.\`startDate\`
                    ) >= \`report_months\`.\`startDate\`
                GROUP BY \`teachers\`.\`id\`,
                    \`lessons\`.\`id\`,
                    \`report_months\`.\`id\`
                ORDER BY \`report_months\`.\`id\` ASC
            `);
        }

        // 6. known_absence_with_report_month
        // Check for 'reportMonthReferenceId' column.
        if (!(await queryRunner.hasColumn('known_absence_with_report_month', 'reportMonthReferenceId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`known_absence_with_report_month\` AS
                SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                    known_absences.*
                FROM \`known_absences\` \`known_absences\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`known_absences\`.\`user_id\` = \`report_months\`.\`userId\`
                    AND \`known_absences\`.\`report_date\` <= \`report_months\`.\`endDate\`
                    AND \`known_absences\`.\`report_date\` >= \`report_months\`.\`startDate\`
            `);
        }

        // 8. student_klasses_report
        // Check if view exists.
        if (await queryRunner.hasTable('student_klass_report')) {
            try {
                await queryRunner.query('DROP VIEW `student_klass_report`');
            } catch (e) {
                console.warn('Could not drop legacy view student_klass_report, skipping:', e);
            }
        }
        if (!(await queryRunner.hasTable('student_klasses_report'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`student_klasses_report\` AS
                SELECT \`student_klasses\`.\`year\` AS \`year\`,
                    \`students\`.\`id\` AS \`id\`,
                    \`students\`.\`id\` AS \`student_reference_id\`,
                    \`students\`.\`tz\` AS \`student_tz\`,
                    \`students\`.\`name\` AS \`student_name\`,
                    \`student_klasses\`.\`user_id\` AS \`user_id\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                            \`student_klasses\`.\`klassReferenceId\`,
                            null
                        ) SEPARATOR ','
                    ) AS \`klassReferenceId_1\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                            \`student_klasses\`.\`klassReferenceId\`,
                            null
                        ) SEPARATOR ','
                    ) AS \`klassReferenceId_2\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                            \`student_klasses\`.\`klassReferenceId\`,
                            null
                        ) SEPARATOR ','
                    ) AS \`klassReferenceId_3\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                            \`student_klasses\`.\`klassReferenceId\`,
                            null
                        ) SEPARATOR ','
                    ) AS \`klassReferenceId_null\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                            \`klasses\`.\`name\`,
                            null
                        ) SEPARATOR ', '
                    ) AS \`klass_name_1\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                            \`klasses\`.\`name\`,
                            null
                        ) SEPARATOR ', '
                    ) AS \`klass_name_2\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                            \`klasses\`.\`name\`,
                            null
                        ) SEPARATOR ', '
                    ) AS \`klass_name_3\`,
                    GROUP_CONCAT(
                        if(
                            \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                            \`klasses\`.\`name\`,
                            null
                        ) SEPARATOR ', '
                    ) AS \`klass_name_null\`
                FROM \`student_klasses\` \`student_klasses\`
                    LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                    LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
                    LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
                GROUP BY \`students\`.\`id\`,
                    \`student_klasses\`.\`user_id\`,
                    \`student_klasses\`.\`year\`
            `);
        }

        // 9. lesson_klass_name
        // Check for 'name' column. Data.sql has 'lesson_name'.
        if (!(await queryRunner.hasColumn('lesson_klass_name', 'name'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`lesson_klass_name\` AS
                SELECT lessons.id AS id,
                    lessons.user_id AS user_id,
                    GROUP_CONCAT(DISTINCT klasses.name SEPARATOR ', ') AS name
                FROM lessons
                    LEFT JOIN JSON_TABLE(
                        lessons.klass_reference_ids_json,
                        "$[*]" COLUMNS(klass_id INT PATH "$")
                    ) AS jt ON 1 = 1
                    LEFT JOIN klasses ON klasses.id = jt.klass_id
                GROUP BY lessons.id,
                    lessons.user_id
            `);
        }

        // 10. text_by_user
        // Check for 'filepath' column.
        if (!(await queryRunner.hasColumn('text_by_user', 'filepath'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`text_by_user\` AS
                SELECT \`t_base\`.\`name\` AS \`name\`,
                    \`t_base\`.\`description\` AS \`description\`,
                    \`users\`.\`id\` AS \`userId\`,
                    \`t_user\`.\`id\` AS \`overrideTextId\`,
                    CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                    COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`,
                    COALESCE(\`t_user\`.\`filepath\`, \`t_base\`.\`filepath\`) AS \`filepath\`
                FROM \`texts\` \`t_base\`
                    LEFT JOIN \`users\` \`users\` ON \`users\`.\`effective_id\` is null
                    LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                    AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
                WHERE \`t_base\`.\`user_id\` = 0
                ORDER BY \`users\`.\`id\` ASC,
                    \`t_base\`.\`id\` ASC
            `);
        }

        // 11. grade_with_report_month
        // Check for 'reportMonthReferenceId' column.
        if (!(await queryRunner.hasColumn('grade_with_report_month', 'reportMonthReferenceId'))) {
             await queryRunner.query(`
                CREATE OR REPLACE VIEW \`grade_with_report_month\` AS
                SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                    grades.*
                FROM \`grades\` \`grades\`
                    LEFT JOIN \`report_month\` \`report_months\` ON \`grades\`.\`user_id\` = \`report_months\`.\`userId\`
                    AND \`grades\`.\`report_date\` <= \`report_months\`.\`endDate\`
                    AND \`grades\`.\`report_date\` >= \`report_months\`.\`startDate\`
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
