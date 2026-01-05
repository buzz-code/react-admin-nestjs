import { MigrationInterface, QueryRunner } from "typeorm";

export class FixImportFileSchema1767646406606 implements MigrationInterface {
    name = 'FixImportFileSchema1767646406606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and add fileSource
        const hasFileSource = await queryRunner.hasColumn('import_file', 'fileSource');
        if (!hasFileSource) {
            await queryRunner.query(`ALTER TABLE \`import_file\` ADD \`fileSource\` varchar(255) NOT NULL`);
        }

        // Check and add entityIds
        const hasEntityIds = await queryRunner.hasColumn('import_file', 'entityIds');
        if (!hasEntityIds) {
             await queryRunner.query(`ALTER TABLE \`import_file\` ADD \`entityIds\` text NOT NULL`);
        }

        // Check and add fullSuccess
        const hasFullSuccess = await queryRunner.hasColumn('import_file', 'fullSuccess');
        if (!hasFullSuccess) {
             await queryRunner.query(`ALTER TABLE \`import_file\` ADD \`fullSuccess\` tinyint(1) DEFAULT NULL`);
        }

        // Check and add response
        const hasResponse = await queryRunner.hasColumn('import_file', 'response');
        if (!hasResponse) {
             await queryRunner.query(`ALTER TABLE \`import_file\` ADD \`response\` varchar(255) DEFAULT NULL`);
        }

        // Check and add metadata
        const hasMetadata = await queryRunner.hasColumn('import_file', 'metadata');
        if (!hasMetadata) {
             await queryRunner.query(`ALTER TABLE \`import_file\` ADD \`metadata\` json DEFAULT NULL`);
        }

        // Check and drop status
        const hasStatus = await queryRunner.hasColumn('import_file', 'status');
        if (hasStatus) {
             await queryRunner.query(`ALTER TABLE \`import_file\` DROP COLUMN \`status\``);
        }

        // Check and drop isReverted
        const hasIsReverted = await queryRunner.hasColumn('import_file', 'isReverted');
        if (hasIsReverted) {
             await queryRunner.query(`ALTER TABLE \`import_file\` DROP COLUMN \`isReverted\``);
        }

        // Check and drop updatedAt
        const hasUpdatedAt = await queryRunner.hasColumn('import_file', 'updatedAt');
        if (hasUpdatedAt) {
             await queryRunner.query(`ALTER TABLE \`import_file\` DROP COLUMN \`updatedAt\``);
        }

        // Check and rename filename to fileName
        // Note: hasColumn is case sensitive usually depending on DB collation, but here we check specifically.
        // If 'filename' exists and 'fileName' does not (or we just want to rename), we check.
        // However, in some MySQL setups on Windows/Mac, case might be ignored. 
        // But the error showed `Unknown column 'fileSource'`, and the `data.sql` had `filename`.
        // The entity has `fileName`.
        // Let's check if we can rename.
        const hasFilenameLower = await queryRunner.hasColumn('import_file', 'filename');
        const hasFileNameCamel = await queryRunner.hasColumn('import_file', 'fileName');
        
        // If we have 'filename' but not 'fileName' (or if they are considered different), rename.
        // If the DB is case-insensitive, hasFilenameLower might return true for 'fileName' too.
        // To be safe, we can try to change it if it's not exactly what we want, but 'CHANGE' requires knowing the old name.
        // If case insensitive, `CHANGE filename fileName` might just change the casing.
        if (hasFilenameLower) {
             // We just run it, if it's already fileName it might just update metadata or do nothing.
             await queryRunner.query(`ALTER TABLE \`import_file\` CHANGE \`filename\` \`fileName\` varchar(255) NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No-op for safety as this is a fix-up migration
    }
}
