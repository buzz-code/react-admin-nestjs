import { MigrationInterface, QueryRunner } from "typeorm";

export class optimizeLessonKlassNameView1763834256494 implements MigrationInterface {
    name = 'optimizeLessonKlassNameView1763834256494'

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
            CREATE VIEW \`lesson_klass_name\` AS
            SELECT \`lessons\`.\`id\` AS \`id\`,
                \`lessons\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`name\`
            FROM \`lessons\` \`lessons\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`lessons\`.\`klassReferenceIds\`
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
        `, [dbName,"VIEW","lesson_klass_name","SELECT `lessons`.`id` AS `id`, `lessons`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `name` FROM `lessons` `lessons` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `lessons`.`klassReferenceIds` OR FIND_IN_SET(`klasses`.`id`, `lessons`.`klassReferenceIds`) GROUP BY `lessons`.`id`"]);
    }

}
