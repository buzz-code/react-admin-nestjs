import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateYemotTextsWelcomeAndKlassConfirm1787002860064 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'SEMINAR.WELCOME', text: 'שלום המורה {teacherName}' },
            { name: 'SEMINAR.KLASS_CONFIRMED', text: 'כיתה {klassName}' },
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
                'SEMINAR.WELCOME',
                'SEMINAR.KLASS_CONFIRMED',
            ],
        );
    }
}
