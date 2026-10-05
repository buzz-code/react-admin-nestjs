import { MigrationInterface, QueryRunner } from "typeorm"

export class AddYemotTextsSeminarLessonPrompt1791148265311 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'SEMINAR.LESSON_PROMPT', text: 'הקישי מספר השיעור הנלמד' },
            { name: 'SEMINAR.INVALID_LESSON', text: 'מספר שיעור לא תקין, נסי שוב' },
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
                'SEMINAR.LESSON_PROMPT',
                'SEMINAR.INVALID_LESSON',
            ],
        );
    }
}
