import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateYemotTextsSeminarAttendance1783286613243 implements MigrationInterface {
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
            { name: 'TEACHER.PHONE_NOT_RECOGNIZED', text: 'מספר הטלפון שלך אינו מוכר במערכת, אנא פני למזכירות.' },
            { name: 'SEMINAR.KLASS_PROMPT', text: 'הקישי מספר כיתה' },
            { name: 'SEMINAR.INVALID_KLASS', text: 'מספר כיתה לא תקין, נסי שוב' },
            { name: 'SEMINAR.ALREADY_REPORTED', text: 'כבר דיווחת נוכחות לכיתה זו היום, לא ניתן לדווח פעמיים.' },
            { name: 'SEMINAR.ABSENT_STUDENT_PROMPT', text: 'הקישי מספר תלמידה שנעדרה מהסמינר, ולסיום הקישי 0' },
            { name: 'SEMINAR.INVALID_STUDENT_NUM', text: 'מספר תלמידה לא תקין, נסי שוב' },
            { name: 'SEMINAR.NO_STUDENTS_IN_KLASS', text: 'לא נמצאו תלמידות המשויכות לכיתה זו, אנא פני למזכירות.' },
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
