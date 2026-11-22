import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonExcludedStudents1795400000000 implements MigrationInterface {
  name = 'AddLessonExcludedStudents1795400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`lessons\`
                ADD \`excluded_students\` varchar(5000) NULL,
                ADD \`excludedStudentReferenceIds\` text NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`lessons\`
                DROP COLUMN \`excludedStudentReferenceIds\`,
                DROP COLUMN \`excluded_students\`
        `);
  }
}
