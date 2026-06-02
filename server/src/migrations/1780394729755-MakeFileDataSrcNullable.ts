import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeFileDataSrcNullable1780394729755 implements MigrationInterface {
    name = 'MakeFileDataSrcNullable1780394729755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make fileDataSrc and fileDataTitle nullable on image and uploaded_files
        await queryRunner.query(`ALTER TABLE \`image\` MODIFY COLUMN \`fileDataSrc\` mediumtext NULL`);
        await queryRunner.query(`ALTER TABLE \`image\` MODIFY COLUMN \`fileDataTitle\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`uploaded_files\` MODIFY COLUMN \`fileDataSrc\` mediumtext NULL`);
        await queryRunner.query(`ALTER TABLE \`uploaded_files\` MODIFY COLUMN \`fileDataTitle\` text NULL`);
        // Add nullable fileData columns to known_absences
        await queryRunner.query(`ALTER TABLE \`known_absences\` ADD COLUMN IF NOT EXISTS \`fileDataSrc\` mediumtext NULL`);
        await queryRunner.query(`ALTER TABLE \`known_absences\` ADD COLUMN IF NOT EXISTS \`fileDataTitle\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`known_absences\` DROP COLUMN \`fileDataTitle\``);
        await queryRunner.query(`ALTER TABLE \`known_absences\` DROP COLUMN \`fileDataSrc\``);
        await queryRunner.query(`ALTER TABLE \`uploaded_files\` MODIFY COLUMN \`fileDataTitle\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`uploaded_files\` MODIFY COLUMN \`fileDataSrc\` mediumtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`image\` MODIFY COLUMN \`fileDataTitle\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`image\` MODIFY COLUMN \`fileDataSrc\` mediumtext NOT NULL`);
    }
}
