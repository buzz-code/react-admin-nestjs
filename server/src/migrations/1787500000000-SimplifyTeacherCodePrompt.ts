import { MigrationInterface, QueryRunner } from "typeorm"

export class SimplifyTeacherCodePrompt1787500000000 implements MigrationInterface {
    private oldValue = 'כיתה {klassName}, הקישי קוד מורה. לבחירת כיתה אחרת הקישי כוכבית וסולמית';
    private newValue = 'הקישי קוד מורה';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'UPDATE `texts` SET `value` = ?, `description` = ? WHERE `user_id` = 0 AND `name` = ?',
            [this.newValue, this.newValue, 'SEMINAR.TEACHER_CODE_PROMPT'],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'UPDATE `texts` SET `value` = ?, `description` = ? WHERE `user_id` = 0 AND `name` = ?',
            [this.oldValue, this.oldValue, 'SEMINAR.TEACHER_CODE_PROMPT'],
        );
    }
}
