import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCollationError1770367398282 implements MigrationInterface {
    name = 'FixCollationError1770367398282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","grade_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`DROP VIEW \`grade_effect_by_user\``);
        await queryRunner.query(`DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","abs_count_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`DROP VIEW \`abs_count_effect_by_user\``);
        await queryRunner.query(`CREATE INDEX \`teachers_user_id_tz_idx\` ON \`teachers\` (\`user_id\`, \`tz\`)`);
        await queryRunner.query(`CREATE VIEW \`abs_count_effect_by_user\` AS SELECT \`users\`.\`id\` AS \`userId\`, CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`, numbers.number AS \`number\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`count\` <= numbers.number 
            /* Force utf8mb4_bin collation to avoid "Illegal mix of collations" error during DB dump */
            THEN CONCAT(
              LPAD(\`att_grade_effect\`.\`count\`, 10, '0') COLLATE utf8mb4_bin, 
              '|' COLLATE utf8mb4_bin, 
              CAST(\`att_grade_effect\`.\`effect\` AS CHAR) COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin, 
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["meir_att_copy_ra","VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`count` <= numbers.number \n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`count`, 10, '0') COLLATE utf8mb4_bin, \n              '|' COLLATE utf8mb4_bin, \n              CAST(`att_grade_effect`.`effect` AS CHAR) COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin, \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
        await queryRunner.query(`CREATE VIEW \`grade_effect_by_user\` AS SELECT \`users\`.\`id\` AS \`userId\`, CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`, numbers.number AS \`number\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`percents\` <= numbers.number 
            /* Force utf8mb4_bin collation to avoid "Illegal mix of collations" error during DB dump */
            THEN CONCAT(
              LPAD(\`att_grade_effect\`.\`percents\`, 10, '0') COLLATE utf8mb4_bin, 
              '|' COLLATE utf8mb4_bin, 
              CAST(\`att_grade_effect\`.\`effect\` AS CHAR) COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin, 
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["meir_att_copy_ra","VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`percents` <= numbers.number \n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`percents`, 10, '0') COLLATE utf8mb4_bin, \n              '|' COLLATE utf8mb4_bin, \n              CAST(`att_grade_effect`.`effect` AS CHAR) COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin, \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","grade_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`DROP VIEW \`grade_effect_by_user\``);
        await queryRunner.query(`DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","abs_count_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`DROP VIEW \`abs_count_effect_by_user\``);
        await queryRunner.query(`DROP INDEX \`teachers_user_id_tz_idx\` ON \`teachers\``);
        await queryRunner.query(`CREATE VIEW \`abs_count_effect_by_user\` AS SELECT \`users\`.\`id\` AS \`userId\`, CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`, numbers.number AS \`number\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`count\` <= numbers.number 
            THEN CONCAT(LPAD(\`att_grade_effect\`.\`count\`, 10, '0'), '|', \`att_grade_effect\`.\`effect\`)
            ELSE NULL END
          ), 
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["meir_att_copy_ra","VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`count` <= numbers.number \n            THEN CONCAT(LPAD(`att_grade_effect`.`count`, 10, '0'), '|', `att_grade_effect`.`effect`)\n            ELSE NULL END\n          ), \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
        await queryRunner.query(`CREATE VIEW \`grade_effect_by_user\` AS SELECT \`users\`.\`id\` AS \`userId\`, CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`, numbers.number AS \`number\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`percents\` <= numbers.number 
            THEN CONCAT(LPAD(\`att_grade_effect\`.\`percents\`, 10, '0'), '|', \`att_grade_effect\`.\`effect\`)
            ELSE NULL END
          ), 
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["meir_att_copy_ra","VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`percents` <= numbers.number \n            THEN CONCAT(LPAD(`att_grade_effect`.`percents`, 10, '0'), '|', `att_grade_effect`.`effect`)\n            ELSE NULL END\n          ), \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

}
