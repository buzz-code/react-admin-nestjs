import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherReportedTodayView1784182661568 implements MigrationInterface {
    name = 'AddTeacherReportedTodayView1784182661568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW \`teacher_reported_today\` AS SELECT \`att_report\`.\`user_id\` AS \`userId\`, \`att_report\`.\`report_date\` AS \`reportDate\`, \`teacher\`.\`id\` AS \`teacherReferenceId\`, \`teacher\`.\`name\` AS \`teacherName\`, CONCAT(\`att_report\`.\`user_id\`, '_', \`att_report\`.\`teacherReferenceId\`, '_', \`att_report\`.\`report_date\`) AS \`id\` FROM \`att_reports\` \`att_report\` INNER JOIN \`teachers\` \`teacher\` ON \`teacher\`.\`id\` = \`att_report\`.\`teacherReferenceId\` AND \`teacher\`.\`user_id\` = \`att_report\`.\`user_id\` GROUP BY \`att_report\`.\`user_id\`, \`teacher\`.\`id\`, \`att_report\`.\`report_date\``);
        await queryRunner.query(`INSERT INTO \`mysql_database\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["mysql_database","VIEW","teacher_reported_today","SELECT `att_report`.`user_id` AS `userId`, `att_report`.`report_date` AS `reportDate`, `teacher`.`id` AS `teacherReferenceId`, `teacher`.`name` AS `teacherName`, CONCAT(`att_report`.`user_id`, '_', `att_report`.`teacherReferenceId`, '_', `att_report`.`report_date`) AS `id` FROM `att_reports` `att_report` INNER JOIN `teachers` `teacher` ON `teacher`.`id` = `att_report`.`teacherReferenceId` AND `teacher`.`user_id` = `att_report`.`user_id` GROUP BY `att_report`.`user_id`, `teacher`.`id`, `att_report`.`report_date`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`mysql_database\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_reported_today","mysql_database"]);
        await queryRunner.query(`DROP VIEW \`teacher_reported_today\``);
    }

}
