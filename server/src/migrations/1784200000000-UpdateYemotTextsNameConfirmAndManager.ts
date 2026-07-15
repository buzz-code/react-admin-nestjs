import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateYemotTextsNameConfirmAndManager1784200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'SEMINAR.CONFIRM_STUDENT_NAME', text: 'התלמידה {studentName}. {yes} {no}' },
            { name: 'SEMINAR.STUDENT_NAME_REJECTED', text: 'נסי שוב להקיש את מספר התלמידה' },
            { name: 'MANAGER.NO_SCHEDULE_TODAY', text: 'אין מורות עם מערכת שעות היום.' },
            { name: 'MANAGER.REPORT_STATUS_TODAY', text: 'מורות שדיווחו היום: {reportedList}.\nמורות שלא דיווחו: {notReportedList}.' },
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
            'DELETE FROM `texts` WHERE `user_id` = 0 AND `name` IN (?, ?, ?, ?)',
            [
                'SEMINAR.CONFIRM_STUDENT_NAME',
                'SEMINAR.STUDENT_NAME_REJECTED',
                'MANAGER.NO_SCHEDULE_TODAY',
                'MANAGER.REPORT_STATUS_TODAY',
            ],
        );
    }
}
