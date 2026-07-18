import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherReportedTodayView1784189504154 implements MigrationInterface {
    name = 'AddTeacherReportedTodayView1784189504154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_reported_today",dbName]);
        await queryRunner.query(`CREATE OR REPLACE VIEW \`teacher_reported_today\` AS SELECT \`att_report\`.\`user_id\` AS \`userId\`, \`att_report\`.\`teacherReferenceId\` AS \`teacherReferenceId\`, \`att_report\`.\`lessonReferenceId\` AS \`lessonReferenceId\`, \`att_report\`.\`report_date\` AS \`reportDate\`, CONCAT(\`att_report\`.\`user_id\`, '_', \`att_report\`.\`teacherReferenceId\`, '_', \`att_report\`.\`report_date\`, '_', COALESCE(\`att_report\`.\`lessonReferenceId\`, 'null')) AS \`id\`, MIN(MIN(\`att_report\`.\`created_at\`)) OVER (PARTITION BY \`att_report\`.\`user_id\`, \`att_report\`.\`teacherReferenceId\`, \`att_report\`.\`report_date\`) AS \`reportHour\` FROM \`att_reports\` \`att_report\` WHERE \`att_report\`.\`teacherReferenceId\` IS NOT NULL GROUP BY \`att_report\`.\`user_id\`, \`att_report\`.\`teacherReferenceId\`, \`att_report\`.\`report_date\`, \`att_report\`.\`lessonReferenceId\``);
        await queryRunner.query(`INSERT INTO \`${dbName}\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, [dbName,"VIEW","teacher_reported_today","SELECT `att_report`.`user_id` AS `userId`, `att_report`.`teacherReferenceId` AS `teacherReferenceId`, `att_report`.`lessonReferenceId` AS `lessonReferenceId`, `att_report`.`report_date` AS `reportDate`, CONCAT(`att_report`.`user_id`, '_', `att_report`.`teacherReferenceId`, '_', `att_report`.`report_date`, '_', COALESCE(`att_report`.`lessonReferenceId`, 'null')) AS `id`, MIN(MIN(`att_report`.`created_at`)) OVER (PARTITION BY `att_report`.`user_id`, `att_report`.`teacherReferenceId`, `att_report`.`report_date`) AS `reportHour` FROM `att_reports` `att_report` WHERE `att_report`.`teacherReferenceId` IS NOT NULL GROUP BY `att_report`.`user_id`, `att_report`.`teacherReferenceId`, `att_report`.`report_date`, `att_report`.`lessonReferenceId`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`DELETE FROM \`${dbName}\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","teacher_reported_today",dbName]);
        await queryRunner.query(`DROP VIEW IF EXISTS \`teacher_reported_today\``);
    }

}
