import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateYemotTextsSeminarDuplicateLesson1789587905258 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'SEMINAR.DUPLICATE_LESSON_PROMPT', text: 'השיעור כבר תוקף. הקישי 1 להוספת שיעור נוסף, 2 למחיקת הקודם' },
            { name: 'SEMINAR.DUPLICATE_LESSON_DELETED', text: 'הדיווח הקודם נמחק' },
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
                'SEMINAR.DUPLICATE_LESSON_PROMPT',
                'SEMINAR.DUPLICATE_LESSON_DELETED',
            ],
        );
    }
}
