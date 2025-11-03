import { MigrationInterface, QueryRunner, In } from "typeorm";
import { ReportGroup } from "../db/entities/ReportGroup.entity";
import { ReportGroupSession } from "../db/entities/ReportGroupSession.entity";
import { ImportFile } from "@shared/entities/ImportFile.entity";
import { AttReport } from "../db/entities/AttReport.entity";
import { Grade } from "../db/entities/Grade.entity";

export class MigrateExistingReportsToGroups1762116200000 implements MigrationInterface {

    private toDateString(date: Date | string): string {
        if (typeof date === 'string') {
            // If it's already a string, just extract the date part
            return date.split('T')[0];
        }
        return date.toISOString().split('T')[0];
    }

    private toTimeString(time: string | null): string | null {
        if (!time) return null;
        
        // If it's already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(time)) {
            return time;
        }
        
        // If it's an ISO datetime string, extract time part
        if (time.includes('T')) {
            const timePart = time.split('T')[1];
            return timePart.substring(0, 5); // Get HH:MM
        }
        
        return time;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all import files with metadata that contains signatureData or dateDetails
        const importFileRepo = queryRunner.manager.getRepository(ImportFile);
        const reportGroupRepo = queryRunner.manager.getRepository(ReportGroup);
        const reportGroupSessionRepo = queryRunner.manager.getRepository(ReportGroupSession);
        const attReportRepo = queryRunner.manager.getRepository(AttReport);
        const gradeRepo = queryRunner.manager.getRepository(Grade);

        // Find import files with signature metadata
        const importFiles = await importFileRepo
            .createQueryBuilder('importFile')
            .where('importFile.metadata IS NOT NULL')
            .andWhere('importFile.metadata != :empty', { empty: '{}' })
            .getMany();

        console.log(`Found ${importFiles.length} import files with metadata`);

        for (const importFile of importFiles) {
            try {
                const metadata = importFile.metadata as any;
                
                // Skip if no signature data or date details
                if (!metadata.signatureData && !metadata.dateDetails) {
                    continue;
                }

                // Skip if already migrated (has reportGroupId)
                if (metadata.reportGroupId) {
                    console.log(`Import file ${importFile.id} already has reportGroupId, skipping`);
                    continue;
                }

                // Get first report to extract common data
                const firstReport = await attReportRepo.findOne({
                    where: { id: In(importFile.entityIds) },
                    order: { reportDate: 'ASC' }
                }) || await gradeRepo.findOne({
                    where: { id: In(importFile.entityIds) },
                    order: { reportDate: 'ASC' }
                });

                if (!firstReport) {
                    console.log(`No reports found for import file ${importFile.id}, skipping`);
                    continue;
                }

                // Create ReportGroup
                const reportGroup = new ReportGroup();
                reportGroup.userId = importFile.userId;
                reportGroup.name = importFile.fileName || `דיווח - ${this.toDateString(firstReport.reportDate)}`;
                reportGroup.topic = importFile.fileName || '';
                reportGroup.signatureData = metadata.signatureData || null;
                reportGroup.teacherReferenceId = firstReport.teacherReferenceId;
                reportGroup.lessonReferenceId = firstReport.lessonReferenceId;
                reportGroup.klassReferenceId = firstReport.klassReferenceId;
                reportGroup.year = firstReport.year || null;

                const savedReportGroup = await reportGroupRepo.save(reportGroup);
                console.log(`Created ReportGroup ${savedReportGroup.id} for ImportFile ${importFile.id}`);

                // Get all unique report dates from this import file
                const attReports = await attReportRepo.find({
                    where: { id: In(importFile.entityIds) },
                    order: { reportDate: 'ASC' }
                });
                
                const gradeReports = await gradeRepo.find({
                    where: { id: In(importFile.entityIds) },
                    order: { reportDate: 'ASC' }
                });

                // Collect unique dates
                const dateSet = new Set<string>();
                attReports.forEach(r => dateSet.add(this.toDateString(r.reportDate)));
                gradeReports.forEach(r => dateSet.add(this.toDateString(r.reportDate)));
                
                const uniqueDates = Array.from(dateSet).sort();

                // Create ReportGroupSession for each date
                const sessionMap = new Map<string, number>();

                for (const reportDate of uniqueDates) {
                    const session = new ReportGroupSession();
                    session.reportGroupId = savedReportGroup.id;
                    session.sessionDate = new Date(reportDate);
                    
                    // Extract date-specific details from metadata
                    const dateDetails = metadata.dateDetails?.[reportDate];
                    if (dateDetails) {
                        session.startTime = this.toTimeString(dateDetails.lessonStartTime);
                        session.endTime = this.toTimeString(dateDetails.lessonEndTime);
                        session.topic = dateDetails.lessonTopic || null;
                    }

                    const savedSession = await reportGroupSessionRepo.save(session);
                    sessionMap.set(reportDate, savedSession.id);
                    console.log(`Created ReportGroupSession ${savedSession.id} for date ${reportDate}`);
                }

                // Update AttReports with reportGroupSessionId
                for (const attReport of attReports) {
                    const reportDateStr = this.toDateString(attReport.reportDate);
                    const sessionId = sessionMap.get(reportDateStr);
                    if (sessionId) {
                        attReport.reportGroupSessionId = sessionId;
                        await attReportRepo.save(attReport);
                    }
                }

                // Update Grades with reportGroupSessionId
                for (const gradeReport of gradeReports) {
                    const reportDateStr = this.toDateString(gradeReport.reportDate);
                    const sessionId = sessionMap.get(reportDateStr);
                    if (sessionId) {
                        gradeReport.reportGroupSessionId = sessionId;
                        await gradeRepo.save(gradeReport);
                    }
                }

                // Update ImportFile with reportGroupId
                importFile.metadata.reportGroupId = savedReportGroup.id;
                await importFileRepo.save(importFile);

                console.log(`Successfully migrated ImportFile ${importFile.id} with ${uniqueDates.length} sessions`);

            } catch (error) {
                console.error(`Error migrating ImportFile ${importFile.id}:`, error);
                // Continue with next import file instead of failing entire migration
            }
        }

        console.log('Migration completed successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // In down migration, we would:
        // 1. Remove reportGroupSessionId from att_reports and grades
        // 2. Remove reportGroupId from import_file
        // 3. Delete all report_group_sessions
        // 4. Delete all report_groups
        
        await queryRunner.query(`UPDATE att_reports SET reportGroupSessionId = NULL WHERE reportGroupSessionId IS NOT NULL`);
        await queryRunner.query(`UPDATE grades SET reportGroupSessionId = NULL WHERE reportGroupSessionId IS NOT NULL`);
        await queryRunner.query(`UPDATE import_file SET reportGroupId = NULL WHERE reportGroupId IS NOT NULL`);
        await queryRunner.query(`DELETE FROM report_group_sessions`);
        await queryRunner.query(`DELETE FROM report_groups`);
    }

}
