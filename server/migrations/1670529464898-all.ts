import { MigrationInterface, QueryRunner } from "typeorm";

export class all1670529464898 implements MigrationInterface {
    name = 'all1670529464898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`yemot_call\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`apiCallId\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NOT NULL,
                \`history\` text NOT NULL,
                \`currentStep\` varchar(255) NOT NULL,
                \`data\` text NULL,
                \`isOpen\` tinyint NOT NULL,
                \`hasError\` tinyint NOT NULL DEFAULT 0,
                \`errorMessage\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`effective_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`permissions\` varchar(5000) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`additionalData\` varchar(5000) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\`
            ADD CONSTRAINT \`FK_2f2c39a9491ac1a6e2d7827bb53\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\` DROP FOREIGN KEY \`FK_2f2c39a9491ac1a6e2d7827bb53\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`additionalData\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`permissions\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`effective_id\`
        `);
        await queryRunner.query(`
            DROP TABLE \`yemot_call\`
        `);
    }

}
