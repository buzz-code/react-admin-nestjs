import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUploadedFiles1771793693336 implements MigrationInterface {
    name = 'AddUploadedFiles1771793693336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`uploaded_files\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`fileDataSrc\` mediumtext NOT NULL,
                \`fileDataTitle\` text NOT NULL,
                INDEX \`uploaded_files_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`uploaded_files_user_id_idx\` ON \`uploaded_files\`
        `);
        await queryRunner.query(`
            DROP TABLE \`uploaded_files\`
        `);
    }

}
