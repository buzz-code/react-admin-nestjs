import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeLessonKlassJoin1763931783912 implements MigrationInterface {
    name = 'OptimizeLessonKlassJoin1763931783912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","lesson_klass_name",dbName]);
        await queryRunner.query(`
            DROP VIEW \`lesson_klass_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\`
            ADD \`klass_reference_ids_json\` json AS (
                    CAST(
                        CONCAT('[', COALESCE(klassReferenceIds, ''), ']') AS JSON
                    )
                ) STORED NULL
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
            VALUES (DEFAULT, ?, ?, ?, ?, ?)
        `, [dbName,"lessons","GENERATED_COLUMN","klass_reference_ids_json","CAST(CONCAT('[', COALESCE(klassReferenceIds, ''), ']') AS JSON)"]);
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
            INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, [dbName,"VIEW","lesson_klass_name","SELECT `lessons`.`id` AS `id`, `lessons`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `name` FROM `lessons` `lessons` LEFT JOIN `klasses` `klasses` ON JSON_CONTAINS(`lessons`.`klass_reference_ids_json`, CAST(`klasses`.`id` AS JSON)) GROUP BY `lessons`.`id`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","lesson_klass_name",dbName]);
        await queryRunner.query(`
            DROP VIEW \`lesson_klass_name\`
        `);
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
                AND \`table\` = ?
        `, ["GENERATED_COLUMN","klass_reference_ids_json",dbName,"lessons"]);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`klass_reference_ids_json\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`lesson_klass_name\` AS
            SELECT \`lessons\`.\`id\` AS \`id\`,
                \`lessons\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`name\`
            FROM \`lessons\` \`lessons\`
                LEFT JOIN \`klasses\` \`klasses\` ON (
                    \`klasses\`.\`id\` = \`lessons\`.\`klassReferenceIds\`
                    AND LOCATE(',', \`lessons\`.\`klassReferenceIds\`) = 0
                )
                OR FIND_IN_SET(\`klasses\`.\`id\`, \`lessons\`.\`klassReferenceIds\`)
            GROUP BY \`lessons\`.\`id\`
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
        `, [dbName,"VIEW","lesson_klass_name","SELECT `lessons`.`id` AS `id`, `lessons`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `name` FROM `lessons` `lessons` LEFT JOIN `klasses` `klasses` ON (`klasses`.`id` = `lessons`.`klassReferenceIds` AND LOCATE(',', `lessons`.`klassReferenceIds`) = 0) OR FIND_IN_SET(`klasses`.`id`, `lessons`.`klassReferenceIds`) GROUP BY `lessons`.`id`"]);
    }

}
