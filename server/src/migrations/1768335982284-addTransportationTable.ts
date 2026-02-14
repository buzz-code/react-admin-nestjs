import { MigrationInterface, QueryRunner } from "typeorm";

export class addTransportationTable1768335982284 implements MigrationInterface {
    name = 'addTransportationTable1768335982284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            CREATE TABLE \`transportations\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`key\` int NOT NULL,
                \`departure_time\` varchar(255) NULL,
                \`description\` varchar(1000) NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_786464b82be79319c981bfd00a\` (\`user_id\`, \`key\`, \`year\`),
                INDEX \`transportations_users_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbName = queryRunner.connection.options.database;
        await queryRunner.query(`
            DROP INDEX \`transportations_users_idx\` ON \`transportations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_786464b82be79319c981bfd00a\` ON \`transportations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`transportations\`
        `);
    }

}
