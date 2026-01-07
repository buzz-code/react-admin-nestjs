import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSchemaMisalignments1767647800000 implements MigrationInterface {
    name = 'FixSchemaMisalignments1767647800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix PaymentTrack
        const paymentTrackTable = await queryRunner.getTable('payment_track');
        if (paymentTrackTable && paymentTrackTable.findColumnByName('price')) {
            console.log('Fixing payment_track schema...');
            await queryRunner.query(`DROP TABLE \`payment_track\``);
            await queryRunner.query(`
                CREATE TABLE \`payment_track\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` longtext NOT NULL,
                \`monthlyPrice\` int NOT NULL,
                \`annualPrice\` int NOT NULL,
                \`studentNumberLimit\` int NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            console.log('Restoring default payment_track data...');
            await queryRunner.query(`
                INSERT INTO \`payment_track\` (\`id\`, \`name\`, \`description\`, \`monthlyPrice\`, \`annualPrice\`, \`studentNumberLimit\`) VALUES
                (1, 'Basic Plan', 'Basic features', 100, 1000, 50),
                (2, 'Standard Plan', 'Standard features', 200, 2000, 150),
                (3, 'Premium Plan', 'All features', 300, 3000, 500)
            `);
        }

        // Fix Page
        const pageTable = await queryRunner.getTable('page');
        if (pageTable && pageTable.findColumnByName('title')) {
           console.log('Fixing page schema...');
            await queryRunner.query(`DROP TABLE \`page\``);
            await queryRunner.query(`
                CREATE TABLE \`page\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`description\` varchar(255) NOT NULL,
                \`value\` longtext NOT NULL,
                \`order\` int DEFAULT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
        }

        // Fix RecievedMail
        const receivedMailTable = await queryRunner.getTable('recieved_mail');
        if (receivedMailTable && !receivedMailTable.findColumnByName('mailData')) {
           console.log('Fixing recieved_mail schema...');
           await queryRunner.query(`DROP TABLE \`recieved_mail\``);
           await queryRunner.query(`
                CREATE TABLE \`recieved_mail\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`mailData\` text NOT NULL,
                \`from\` varchar(255) NOT NULL,
                \`to\` varchar(255) NOT NULL,
                \`subject\` text DEFAULT NULL,
                \`body\` text DEFAULT NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`importFileIds\` text NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
           `);
        }

        // Fix YemotCall
        const yemotCallTable = await queryRunner.getTable('yemot_call');
        // Check for old column ApiCallId
        if (yemotCallTable && yemotCallTable.findColumnByName('ApiCallId')) {
           console.log('Fixing yemot_call schema...');
           await queryRunner.query(`DROP TABLE \`yemot_call\``);
           await queryRunner.query(`
                CREATE TABLE \`yemot_call\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`apiCallId\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NOT NULL,
                \`history\` mediumtext NOT NULL,
                \`currentStep\` varchar(255) NOT NULL,
                \`data\` text DEFAULT NULL,
                \`isOpen\` tinyint NOT NULL,
                \`hasError\` tinyint NOT NULL DEFAULT 0,
                \`errorMessage\` varchar(255) DEFAULT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                KEY \`yemot_call_api_call_id_idx\` (\`apiCallId\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
           `);
        }

        // Fix Image
        const imageTable = await queryRunner.getTable('image');
        if (imageTable && imageTable.findColumnByName('mimetype')) {
           console.log('Fixing image schema...');
           await queryRunner.query(`DROP TABLE \`image\``);
           await queryRunner.query(`
                CREATE TABLE \`image\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`fileDataSrc\` mediumtext NOT NULL,
                \`fileDataTitle\` text NOT NULL,
                \`imageTarget\` varchar(255) NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`IDX_image_userId_imageTarget\` (\`userId\`, \`imageTarget\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
           `);
        }

        // Fix MailAddress
        const mailAddressTable = await queryRunner.getTable('mail_address');
        if (mailAddressTable && mailAddressTable.findColumnByName('address')) {
           console.log('Fixing mail_address schema...');
           await queryRunner.query(`DROP TABLE \`mail_address\``);
           await queryRunner.query(`
                CREATE TABLE \`mail_address\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`alias\` varchar(255) NOT NULL,
                \`entity\` varchar(255) NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`IDX_mail_address_userId_entity\` (\`userId\`, \`entity\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
           `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration for this fix - it's a one-way repair of checking schema state
    }
}
