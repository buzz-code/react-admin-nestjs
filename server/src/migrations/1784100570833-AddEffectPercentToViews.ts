import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEffectPercentToViews1784100570833 implements MigrationInterface {
    name = 'AddEffectPercentToViews1784100570833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","grade_effect_by_user",dbName,]);
        await queryRunner.query(`DROP VIEW \`grade_effect_by_user\``);
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","abs_count_effect_by_user",dbName,]);
        await queryRunner.query(`DROP VIEW \`abs_count_effect_by_user\``);
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
              COALESCE(CAST(\`att_grade_effect\`.\`effect\` AS CHAR), '') COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin,
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`count\` <= numbers.number
            /* Force utf8mb4_bin collation to avoid "Illegal mix of collations" error during DB dump */
            THEN CONCAT(
              LPAD(\`att_grade_effect\`.\`count\`, 10, '0') COLLATE utf8mb4_bin,
              '|' COLLATE utf8mb4_bin,
              COALESCE(CAST(\`att_grade_effect\`.\`effectPercent\` AS CHAR), '') COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin,
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effectPercent\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`count` <= numbers.number\n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`count`, 10, '0') COLLATE utf8mb4_bin,\n              '|' COLLATE utf8mb4_bin,\n              COALESCE(CAST(`att_grade_effect`.`effect` AS CHAR), '') COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin,\n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`count` <= numbers.number\n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`count`, 10, '0') COLLATE utf8mb4_bin,\n              '|' COLLATE utf8mb4_bin,\n              COALESCE(CAST(`att_grade_effect`.`effectPercent` AS CHAR), '') COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin,\n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effectPercent` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
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
              COALESCE(CAST(\`att_grade_effect\`.\`effect\` AS CHAR), '') COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin,
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effect\`, 
    CAST(
      COALESCE(
        SUBSTRING_INDEX(
          MAX(
            CASE WHEN \`att_grade_effect\`.\`percents\` <= numbers.number
            /* Force utf8mb4_bin collation to avoid "Illegal mix of collations" error during DB dump */
            THEN CONCAT(
              LPAD(\`att_grade_effect\`.\`percents\`, 10, '0') COLLATE utf8mb4_bin,
              '|' COLLATE utf8mb4_bin,
              COALESCE(CAST(\`att_grade_effect\`.\`effectPercent\` AS CHAR), '') COLLATE utf8mb4_bin
            )
            ELSE NULL END
          ) COLLATE utf8mb4_bin,
          '|', -1
        ),
        '0'
      ) AS SIGNED
    ) + 0
   AS \`effectPercent\` FROM \`numbers\` \`numbers\` LEFT JOIN \`users\` \`users\` ON 1 = 1  LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\` GROUP BY \`users\`.\`id\`, numbers.number ORDER BY \`users\`.\`id\` ASC, numbers.number ASC`);
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`percents` <= numbers.number\n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`percents`, 10, '0') COLLATE utf8mb4_bin,\n              '|' COLLATE utf8mb4_bin,\n              COALESCE(CAST(`att_grade_effect`.`effect` AS CHAR), '') COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin,\n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`percents` <= numbers.number\n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`percents`, 10, '0') COLLATE utf8mb4_bin,\n              '|' COLLATE utf8mb4_bin,\n              COALESCE(CAST(`att_grade_effect`.`effectPercent` AS CHAR), '') COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin,\n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effectPercent` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","grade_effect_by_user",dbName,]);
        await queryRunner.query(`DROP VIEW \`grade_effect_by_user\``);
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","abs_count_effect_by_user",dbName,]);
        await queryRunner.query(`DROP VIEW \`abs_count_effect_by_user\``);
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
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","abs_count_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`count` <= numbers.number \n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`count`, 10, '0') COLLATE utf8mb4_bin, \n              '|' COLLATE utf8mb4_bin, \n              CAST(`att_grade_effect`.`effect` AS CHAR) COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin, \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
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
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, \n    CAST(\n      COALESCE(\n        SUBSTRING_INDEX(\n          MAX(\n            CASE WHEN `att_grade_effect`.`percents` <= numbers.number \n            /* Force utf8mb4_bin collation to avoid \"Illegal mix of collations\" error during DB dump */\n            THEN CONCAT(\n              LPAD(`att_grade_effect`.`percents`, 10, '0') COLLATE utf8mb4_bin, \n              '|' COLLATE utf8mb4_bin, \n              CAST(`att_grade_effect`.`effect` AS CHAR) COLLATE utf8mb4_bin\n            )\n            ELSE NULL END\n          ) COLLATE utf8mb4_bin, \n          '|', -1\n        ),\n        '0'\n      ) AS SIGNED\n    ) + 0\n   AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

}
