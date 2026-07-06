import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateYemotTextsSeminarAttendance1783286613243 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
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
        await queryRunner.query(
            'DELETE FROM `texts` WHERE `user_id` = 0 AND `name` IN (?, ?, ?, ?, ?, ?, ?)',
            [
                'TEACHER.PHONE_NOT_RECOGNIZED',
                'SEMINAR.KLASS_PROMPT',
                'SEMINAR.INVALID_KLASS',
                'SEMINAR.ALREADY_REPORTED',
                'SEMINAR.ABSENT_STUDENT_PROMPT',
                'SEMINAR.INVALID_STUDENT_NUM',
                'SEMINAR.NO_STUDENTS_IN_KLASS',
            ],
        );
    }
}
