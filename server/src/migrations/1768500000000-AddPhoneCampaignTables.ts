import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddPhoneCampaignTables1768500000000 implements MigrationInterface {
    name = 'AddPhoneCampaignTables1768500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create phone_templates table
        await queryRunner.createTable(
            new Table({
                name: "phone_templates",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "messageType",
                        type: "enum",
                        enum: ["text", "audio"],
                        default: "'text'",
                        isNullable: false,
                    },
                    {
                        name: "messageText",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "audioFileUrl",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "callerId",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: "yemotTemplateId",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create phone_campaigns table
        await queryRunner.createTable(
            new Table({
                name: "phone_campaigns",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "phoneTemplateId",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "yemotCampaignId",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "running", "completed", "failed", "cancelled"],
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: "phoneNumbers",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "totalPhones",
                        type: "int",
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "successfulCalls",
                        type: "int",
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "failedCalls",
                        type: "int",
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "errorMessage",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "completedAt",
                        type: "datetime",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            "phone_templates",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "phone_campaigns",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "phone_campaigns",
            new TableForeignKey({
                columnNames: ["phoneTemplateId"],
                referencedColumnNames: ["id"],
                referencedTableName: "phone_templates",
                onDelete: "CASCADE",
            })
        );

        // Create indexes for performance
        await queryRunner.query(`
            CREATE INDEX IDX_phone_templates_userId ON phone_templates(userId);
        `);
        
        await queryRunner.query(`
            CREATE INDEX IDX_phone_templates_isActive ON phone_templates(isActive);
        `);
        
        await queryRunner.query(`
            CREATE INDEX IDX_phone_campaigns_userId ON phone_campaigns(userId);
        `);
        
        await queryRunner.query(`
            CREATE INDEX IDX_phone_campaigns_phoneTemplateId ON phone_campaigns(phoneTemplateId);
        `);
        
        await queryRunner.query(`
            CREATE INDEX IDX_phone_campaigns_status ON phone_campaigns(status);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IDX_phone_campaigns_status ON phone_campaigns`);
        await queryRunner.query(`DROP INDEX IDX_phone_campaigns_phoneTemplateId ON phone_campaigns`);
        await queryRunner.query(`DROP INDEX IDX_phone_campaigns_userId ON phone_campaigns`);
        await queryRunner.query(`DROP INDEX IDX_phone_templates_isActive ON phone_templates`);
        await queryRunner.query(`DROP INDEX IDX_phone_templates_userId ON phone_templates`);

        // Drop foreign keys
        const phoneCampaignsTable = await queryRunner.getTable("phone_campaigns");
        const phoneTemplatesTable = await queryRunner.getTable("phone_templates");
        
        if (phoneCampaignsTable) {
            const phoneTemplateForeignKey = phoneCampaignsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf("phoneTemplateId") !== -1
            );
            if (phoneTemplateForeignKey) {
                await queryRunner.dropForeignKey("phone_campaigns", phoneTemplateForeignKey);
            }

            const userForeignKey = phoneCampaignsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf("userId") !== -1
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey("phone_campaigns", userForeignKey);
            }
        }

        if (phoneTemplatesTable) {
            const userForeignKey = phoneTemplatesTable.foreignKeys.find(
                fk => fk.columnNames.indexOf("userId") !== -1
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey("phone_templates", userForeignKey);
            }
        }

        // Drop tables
        await queryRunner.dropTable("phone_campaigns");
        await queryRunner.dropTable("phone_templates");
    }
}
