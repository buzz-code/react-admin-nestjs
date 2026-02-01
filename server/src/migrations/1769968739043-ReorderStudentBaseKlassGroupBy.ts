import { MigrationInterface, QueryRunner } from "typeorm";

export class ReorderStudentBaseKlassGroupBy1769968739043 implements MigrationInterface {
    name = 'ReorderStudentBaseKlassGroupBy1769968739043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_base_klass","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_base_klass\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                \`student_klasses\`.\`studentReferenceId\` AS \`id\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`base_klass\`
            FROM \`student_klasses\` \`student_klasses\`
                INNER JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                INNER JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
            WHERE \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם'
            GROUP BY \`student_klasses\`.\`user_id\`,
                \`student_klasses\`.\`year\`,
                \`student_klasses\`.\`studentReferenceId\`
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, `student_klasses`.`studentReferenceId` AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` INNER JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  INNER JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` WHERE `klass_types`.`klassTypeEnum` = 'כיתת אם' GROUP BY `student_klasses`.`user_id`, `student_klasses`.`year`, `student_klasses`.`studentReferenceId`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_base_klass","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_base_klass\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                \`student_klasses\`.\`studentReferenceId\` AS \`id\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`base_klass\`
            FROM \`student_klasses\` \`student_klasses\`
                INNER JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                INNER JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
            WHERE \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם'
            GROUP BY \`student_klasses\`.\`studentReferenceId\`,
                \`student_klasses\`.\`user_id\`,
                \`student_klasses\`.\`year\`
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, `student_klasses`.`studentReferenceId` AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` INNER JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  INNER JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` WHERE `klass_types`.`klassTypeEnum` = 'כיתת אם' GROUP BY `student_klasses`.`studentReferenceId`, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
    }

}
