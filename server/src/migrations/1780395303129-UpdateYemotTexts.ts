import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateYemotTexts1780395303129 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`texts\` WHERE 1 = 1`);

        const texts = [
            { name: 'GENERAL.YES', text: 'הקישי 1 - כן' },
            { name: 'GENERAL.NO', text: 'הקישי 2 - לא' },
            { name: 'GENERAL.INVALID_INPUT', text: 'הקשה לא תקינה, נסי שוב' },
            { name: 'SYSTEM.CLOSED', text: 'המערכת סגורה. לא ניתן לדווח אחרי השעה תשע וחצי בבוקר. המשך יום טוב.' },
            { name: 'SYSTEM.REPORT_SUCCESS', text: 'דווח בהצלחה' },
            { name: 'SYSTEM.LATE_DEPARTURE', text: 'יצאת מאוחר מידי. המשך יום טוב.' },
            { name: 'STUDENT.TZ_PROMPT', text: 'הקישי מספר תעודת זהות' },
            { name: 'STUDENT.INVALID_TZ', text: 'מספר תעודת הזהות לא תקין, נסי שוב' },
            { name: 'STUDENT.ALREADY_REPORTED', text: 'כבר דיווחת היום, לא ניתן לדווח פעמיים.' },
            { name: 'STUDENT.NO_CLASS', text: 'התלמידה אינה משויכת לכיתה.' },
            { name: 'TRANSPORT.NUM_PROMPT', text: 'הקישי מספר הסעה' },
            { name: 'TRANSPORT.INVALID_NUM', text: 'מספר הסעה לא תקין, נסי שוב' },
            { name: 'TRANSPORT.DEPARTURE_CONFIRM', text: 'האם יצאת לדרך לפני השעה {departureTime}? {yes} {no}' },
        ];

        for (const text of texts) {
            await queryRunner.query(
                'INSERT INTO `texts` (`user_id`, `name`, `description`, `value`) VALUES (?, ?, ?, ?)',
                [0, text.name, text.text, text.text],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
