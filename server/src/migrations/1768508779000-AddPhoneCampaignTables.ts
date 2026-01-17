import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneCampaignTables1768508779000 implements MigrationInterface {
    name = 'AddPhoneCampaignTables1768508779000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`phone_templates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` varchar(500) NULL, \`messageType\` enum ('text', 'audio') NOT NULL DEFAULT 'text', \`messageText\` text NULL, \`audioFileUrl\` varchar(500) NULL, \`callerId\` varchar(20) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`yemotTemplateId\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_phone_templates_userId\` (\`userId\`), INDEX \`IDX_phone_templates_isActive\` (\`isActive\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`phone_campaigns\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`phoneTemplateId\` int NOT NULL, \`yemotCampaignId\` varchar(100) NULL, \`status\` enum ('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending', \`phoneNumbers\` json NULL, \`totalPhones\` int NOT NULL DEFAULT '0', \`successfulCalls\` int NOT NULL DEFAULT '0', \`failedCalls\` int NOT NULL DEFAULT '0', \`errorMessage\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`completedAt\` datetime NULL, INDEX \`IDX_phone_campaigns_userId\` (\`userId\`), INDEX \`IDX_phone_campaigns_phoneTemplateId\` (\`phoneTemplateId\`), INDEX \`IDX_phone_campaigns_status\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`phone_templates\` ADD CONSTRAINT \`FK_phone_templates_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`phone_campaigns\` ADD CONSTRAINT \`FK_phone_campaigns_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`phone_campaigns\` ADD CONSTRAINT \`FK_phone_campaigns_phoneTemplateId\` FOREIGN KEY (\`phoneTemplateId\`) REFERENCES \`phone_templates\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`phone_campaigns\` DROP FOREIGN KEY \`FK_phone_campaigns_phoneTemplateId\``);
        await queryRunner.query(`ALTER TABLE \`phone_campaigns\` DROP FOREIGN KEY \`FK_phone_campaigns_userId\``);
        await queryRunner.query(`ALTER TABLE \`phone_templates\` DROP FOREIGN KEY \`FK_phone_templates_userId\``);
        await queryRunner.query(`DROP INDEX \`IDX_phone_campaigns_status\` ON \`phone_campaigns\``);
        await queryRunner.query(`DROP INDEX \`IDX_phone_campaigns_phoneTemplateId\` ON \`phone_campaigns\``);
        await queryRunner.query(`DROP INDEX \`IDX_phone_campaigns_userId\` ON \`phone_campaigns\``);
        await queryRunner.query(`DROP TABLE \`phone_campaigns\``);
        await queryRunner.query(`DROP INDEX \`IDX_phone_templates_isActive\` ON \`phone_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_phone_templates_userId\` ON \`phone_templates\``);
        await queryRunner.query(`DROP TABLE \`phone_templates\``);
    }

}
