import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherPhoneCallTodayView1784143009404 implements MigrationInterface {
    name = 'AddTeacherPhoneCallTodayView1784143009404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW \`teacher_phone_call_today\` AS SELECT \`yemot_call\`.\`id\` AS \`id\`, \`yemot_call\`.\`userId\` AS \`userId\`, \`yemot_call\`.\`phone\` AS \`phone\`, \`yemot_call\`.\`isOpen\` AS \`isOpen\`, \`yemot_call\`.\`hasError\` AS \`hasError\`, \`yemot_call\`.\`createdAt\` AS \`callTime\`, \`teacher\`.\`id\` AS \`teacherReferenceId\`, \`teacher\`.\`name\` AS \`teacherName\` FROM \`yemot_call\` \`yemot_call\` INNER JOIN \`teachers\` \`teacher\` ON (\`teacher\`.\`phone\` = \`yemot_call\`.\`phone\` OR \`teacher\`.\`phone2\` = \`yemot_call\`.\`phone\`) AND \`teacher\`.\`user_id\` = \`yemot_call\`.\`userId\` WHERE DATE(\`yemot_call\`.\`createdAt\`) = CURDATE()`);
        await queryRunner.query(`INSERT INTO \`mysql_database\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["mysql_database","VIEW","teacher_phone_call_today","SELECT `yemot_call`.`id` AS `id`, `yemot_call`.`userId` AS `userId`, `yemot_call`.`phone` AS `phone`, `yemot_call`.`isOpen` AS `isOpen`, `yemot_call`.`hasError` AS `hasError`, `yemot_call`.`createdAt` AS `callTime`, `teacher`.`id` AS `teacherReferenceId`, `teacher`.`name` AS `teacherName` FROM `yemot_call` `yemot_call` INNER JOIN `teachers` `teacher` ON (`teacher`.`phone` = `yemot_call`.`phone` OR `teacher`.`phone2` = `yemot_call`.`phone`) AND `teacher`.`user_id` = `yemot_call`.`userId` WHERE DATE(`yemot_call`.`createdAt`) = CURDATE()"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`mysql_database\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_phone_call_today","mysql_database"]);
        await queryRunner.query(`DROP VIEW \`teacher_phone_call_today\``);
    }

}
