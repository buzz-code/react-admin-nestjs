import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateYemotTextsTeacherCode1787300000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'SEMINAR.TEACHER_CODE_PROMPT', text: 'כיתה {klassName}, הקישי קוד מורה. לבחירת כיתה אחרת הקישי כוכבית וסולמית' },
            { name: 'SEMINAR.INVALID_TEACHER_CODE', text: 'קוד מורה לא מזוהה, נסי שוב' },
        ];

        for (const text of texts) {
            await queryRunner.query(
                'INSERT INTO `texts` (`user_id`, `name`, `description`, `value`) VALUES (?, ?, ?, ?)',
                [0, text.name, text.text, text.text],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'DELETE FROM `texts` WHERE `user_id` = 0 AND `name` IN (?, ?)',
            [
                'SEMINAR.TEACHER_CODE_PROMPT',
                'SEMINAR.INVALID_TEACHER_CODE',
            ],
        );
    }
}
