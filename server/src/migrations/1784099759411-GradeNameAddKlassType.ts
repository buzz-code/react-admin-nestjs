import { MigrationInterface, QueryRunner } from "typeorm";

export class GradeNameAddKlassType1784099759411 implements MigrationInterface {
    name = 'GradeNameAddKlassType1784099759411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`grade_names\` ADD \`klass_type_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`grade_names\` ADD \`klassTypeReferenceId\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`grade_names_klass_type_reference_id_idx\` ON \`grade_names\` (\`klassTypeReferenceId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`grade_names_klass_type_reference_id_idx\` ON \`grade_names\``);
        await queryRunner.query(`ALTER TABLE \`grade_names\` DROP COLUMN \`klassTypeReferenceId\``);
        await queryRunner.query(`ALTER TABLE \`grade_names\` DROP COLUMN \`klass_type_id\``);
    }

}
