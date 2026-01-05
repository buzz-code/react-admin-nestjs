import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDataDatesAndOverlaps1767647702833 implements MigrationInterface {
    name = 'FixDataDatesAndOverlaps1767647702833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if we are in an environment with the sample data that needs fixing
        // We look for a specific known sample row with the old value
        const sampleRow = await queryRunner.query(`
            SELECT id FROM \`report_month\` 
            WHERE id = 1 AND userId = 1 AND name = 'September 5786'
        `);

        if (sampleRow && sampleRow.length > 0) {
            // 1. Fix report_month dates and names
            await queryRunner.query(`
                UPDATE \`report_month\` 
                SET 
                    startDate = REPLACE(startDate, '5786-', '2025-'),
                    endDate = REPLACE(endDate, '5786-', '2025-'),
                    name = REPLACE(name, '5786', '2025')
                WHERE year = 5786 AND startDate LIKE '5786-%'
            `);

            // 2. Remove overlapping report months (Semester 1)
            await queryRunner.query(`
                DELETE FROM \`report_month\` 
                WHERE id IN (7, 8) AND name LIKE 'Semester 1%'
            `);

            // 3. Fix lessons dates
            await queryRunner.query(`
                UPDATE \`lessons\` 
                SET 
                    start_date = REPLACE(start_date, '5786-', '2025-'),
                    end_date = REPLACE(end_date, '5786-', '2025-')
                WHERE year = 5786 AND start_date LIKE '5786-%'
            `);

            // 4. Fix att_reports dates
            await queryRunner.query(`
                UPDATE \`att_reports\` 
                SET report_date = REPLACE(report_date, '5786-', '2025-')
                WHERE year = 5786 AND report_date LIKE '5786-%'
            `);

            // 5. Fix grades dates
            await queryRunner.query(`
                UPDATE \`grades\` 
                SET report_date = REPLACE(report_date, '5786-', '2025-')
                WHERE year = 5786 AND report_date LIKE '5786-%'
            `);

            // 6. Fix known_absences dates
            await queryRunner.query(`
                UPDATE \`known_absences\` 
                SET report_date = REPLACE(report_date, '5786-', '2025-')
                WHERE year = 5786 AND report_date LIKE '5786-%'
            `);

            // 7. Fix report_group_sessions dates
            // This table might not have a year column, so we check the date string directly
            await queryRunner.query(`
                UPDATE \`report_group_sessions\` 
                SET sessionDate = REPLACE(sessionDate, '5786-', '2025-')
                WHERE sessionDate LIKE '5786-%'
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No easy revert for data fixes, and usually not needed for sample data correction
    }
}
