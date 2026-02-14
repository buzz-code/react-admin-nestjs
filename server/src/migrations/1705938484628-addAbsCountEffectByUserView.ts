import { MigrationInterface, QueryRunner } from "typeorm";

export class addAbsCountEffectByUserView1705938484628 implements MigrationInterface {
    name = 'addAbsCountEffectByUserView1705938484628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
          CREATE VIEW \`abs_count_effect_by_user\` AS
            SELECT \`users\`.\`id\` AS \`userId\`,
                CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                numbers.number AS \`number\`,
                MIN(\`att_grade_effect\`.\`effect\`) AS \`effect\`
            FROM \`numbers\` \`numbers\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                AND \`att_grade_effect\`.\`count\` <= numbers.number
            GROUP BY \`users\`.\`id\`,
                numbers.number
            ORDER BY \`users\`.\`id\` ASC,
                numbers.number ASC
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
        `, [dbName,"VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MIN(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`count` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","abs_count_effect_by_user",dbName]);
        await queryRunner.query(`
            DROP VIEW \`abs_count_effect_by_user\`
        `);
    }

}
