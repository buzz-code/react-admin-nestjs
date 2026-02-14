import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeStudentByYearView1769964093858 implements MigrationInterface {
    name = 'OptimizeStudentByYearView1769964093858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_by_year",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_by_year\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`tz\`,
                \`students\`.\`name\` AS \`name\`,
                \`students\`.\`is_active\` AS \`isActive\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`klassReferenceId\`) AS \`klassReferenceIds\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`klassTypeReferenceId\`) AS \`klassTypeReferenceIds\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
            GROUP BY \`students\`.\`id\`,
                \`student_klasses\`.\`user_id\`,
                \`student_klasses\`.\`year\`
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
        `, [dbName,"VIEW","student_by_year","SELECT `student_klasses`.`year` AS `year`, `students`.`id` AS `id`, `students`.`tz` AS `tz`, `students`.`name` AS `name`, `students`.`is_active` AS `isActive`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `student_klasses`.`klassReferenceId`) AS `klassReferenceIds`, GROUP_CONCAT(DISTINCT `klasses`.`klassTypeReferenceId`) AS `klassTypeReferenceIds` FROM `student_klasses` `student_klasses` LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId`  LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` GROUP BY `students`.`id`, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DELETE FROM \`${dbName}\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_by_year",dbName]);
        await queryRunner.query(`
            DROP VIEW \`student_by_year\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`tz\`,
                \`students\`.\`name\` AS \`name\`,
                \`students\`.\`is_active\` AS \`isActive\`,
                \`students\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`year\`) AS \`year\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`klassReferenceId\`) AS \`klassReferenceIds\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`klassTypeReferenceId\`) AS \`klassTypeReferenceIds\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
            GROUP BY \`students\`.\`id\`
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
        `, [dbName,"VIEW","student_by_year","SELECT `students`.`id` AS `id`, `students`.`tz` AS `tz`, `students`.`name` AS `name`, `students`.`is_active` AS `isActive`, `students`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `student_klasses`.`year`) AS `year`, GROUP_CONCAT(DISTINCT `student_klasses`.`klassReferenceId`) AS `klassReferenceIds`, GROUP_CONCAT(DISTINCT `klasses`.`klassTypeReferenceId`) AS `klassTypeReferenceIds` FROM `student_klasses` `student_klasses` LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId`  LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` GROUP BY `students`.`id`"]);
    }

}
