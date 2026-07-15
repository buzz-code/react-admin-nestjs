import { MigrationInterface, QueryRunner } from "typeorm";

export class AttGradeEffectAddEffectPercent1784100406196 implements MigrationInterface {
    name = 'AttGradeEffectAddEffectPercent1784100406196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`att_grade_effect\` ADD \`effectPercent\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`att_grade_effect\` CHANGE \`effect\` \`effect\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`att_grade_effect\` CHANGE \`effect\` \`effect\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`att_grade_effect\` DROP COLUMN \`effectPercent\``);
    }

}
