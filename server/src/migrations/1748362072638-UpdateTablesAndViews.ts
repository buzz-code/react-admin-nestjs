import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTablesAndViews1748362072638 implements MigrationInterface {
    name = 'UpdateTablesAndViews1748362072638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","abs_count_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`abs_count_effect_by_user\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","grade_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`grade_effect_by_user\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP COLUMN \`description\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD \`description\` varchar(500) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`display_name\` \`display_name\` varchar(500) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`display_name\` \`display_name\` varchar(500) NULL
        `);
        await queryRunner.query(`
            CREATE VIEW \`text_by_user\` AS
            SELECT \`t_base\`.\`name\` AS \`name\`,
                \`t_base\`.\`description\` AS \`description\`,
                \`users\`.\`id\` AS \`userId\`,
                \`t_user\`.\`id\` AS \`overrideTextId\`,
                CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`
            FROM \`texts\` \`t_base\`
                LEFT JOIN \`users\` \`users\` ON \`users\`.\`effective_id\` is null
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON `users`.`effective_id` is null  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`abs_count_effect_by_user\` AS
            SELECT \`users\`.\`id\` AS \`userId\`,
                CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                numbers.number AS \`number\`,
                MIN(\`att_grade_effect\`.\`effect\`) AS \`effect\`
            FROM \`numbers\` \`numbers\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                AND \`att_grade_effect\`.\`percents\` <= numbers.number
            GROUP BY \`users\`.\`id\`,
                numbers.number
            ORDER BY \`users\`.\`id\` ASC,
                numbers.number ASC
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
        `, ["meir_att_copy_ra","VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MIN(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`percents` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`grade_effect_by_user\` AS
            SELECT \`users\`.\`id\` AS \`userId\`,
                CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                numbers.number AS \`number\`,
                MAX(\`att_grade_effect\`.\`effect\`) AS \`effect\`
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
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MAX(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`count` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","grade_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`grade_effect_by_user\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","abs_count_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`abs_count_effect_by_user\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`display_name\` \`display_name\` varchar(500) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`display_name\` \`display_name\` varchar(500) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP COLUMN \`description\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD \`description\` varchar(100) NOT NULL
        `);
        await queryRunner.query(`
            CREATE VIEW \`text_by_user\` AS
            SELECT \`t_base\`.\`name\` AS \`name\`,
                \`t_base\`.\`description\` AS \`description\`,
                \`users\`.\`id\` AS \`userId\`,
                \`t_user\`.\`id\` AS \`overrideTextId\`,
                CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`
            FROM \`texts\` \`t_base\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`grade_effect_by_user\` AS
            SELECT \`users\`.\`id\` AS \`userId\`,
                CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                numbers.number AS \`number\`,
                MAX(\`att_grade_effect\`.\`effect\`) AS \`effect\`
            FROM \`numbers\` \`numbers\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                AND \`att_grade_effect\`.\`percents\` <= numbers.number
            GROUP BY \`users\`.\`id\`,
                numbers.number
            ORDER BY \`users\`.\`id\` ASC,
                numbers.number ASC
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
        `, ["meir_att_copy_ra","VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MAX(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`percents` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
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
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MIN(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`count` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

}
