import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeLessonKlassJsonTable1763933862682 implements MigrationInterface {
    name = 'OptimizeLessonKlassJsonTable1763933862682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW", "lesson_klass_name", "meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW IF EXISTS \`lesson_klass_name\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`lesson_klass_name\` AS
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
        await queryRunner.query(`
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra", "VIEW", "lesson_klass_name", "SELECT lessons.id AS id,\n           lessons.user_id AS user_id,\n           GROUP_CONCAT(DISTINCT klasses.name SEPARATOR ', ') AS name\n    FROM lessons\n    LEFT JOIN JSON_TABLE(\n      lessons.klass_reference_ids_json,\n      \"$[*]\" COLUMNS(klass_id INT PATH \"$\")\n    ) AS jt ON 1=1\n    LEFT JOIN klasses ON klasses.id = jt.klass_id\n    GROUP BY lessons.id, lessons.user_id"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW", "lesson_klass_name", "meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`lesson_klass_name\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`lesson_klass_name\` AS
            SELECT \`lessons\`.\`id\` AS \`id\`,
                \`lessons\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`name\`
            FROM \`lessons\` \`lessons\`
                LEFT JOIN \`klasses\` \`klasses\` ON JSON_CONTAINS(
                    \`lessons\`.\`klass_reference_ids_json\`,
                    CAST(\`klasses\`.\`id\` AS JSON)
                )
            GROUP BY \`lessons\`.\`id\`
        `);
        await queryRunner.query(`
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra", "VIEW", "lesson_klass_name", "SELECT `lessons`.`id` AS `id`, `lessons`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `name` FROM `lessons` `lessons` LEFT JOIN `klasses` `klasses` ON JSON_CONTAINS(`lessons`.`klass_reference_ids_json`, CAST(`klasses`.`id` AS JSON)) GROUP BY `lessons`.`id`"]);
    }

}
