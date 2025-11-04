import { MigrationInterface, QueryRunner, In } from "typeorm";
import { ReportGroup } from "../db/entities/ReportGroup.entity";
import { ReportGroupSession } from "../db/entities/ReportGroupSession.entity";
import { ImportFile } from "@shared/entities/ImportFile.entity";
import { AttReport } from "../db/entities/AttReport.entity";
import { Grade } from "../db/entities/Grade.entity";

export class regenerateReportGroupSessions1762283756079 implements MigrationInterface {

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
        const reportGroupRepo = queryRunner.manager.getRepository(ReportGroup);
        const reportGroupSessionRepo = queryRunner.manager.getRepository(ReportGroupSession);
        const importFileRepo = queryRunner.manager.getRepository(ImportFile);
        const attReportRepo = queryRunner.manager.getRepository(AttReport);
        const gradeRepo = queryRunner.manager.getRepository(Grade);

        // Step 1: Find and delete report groups without any sessions
        console.log('Step 1: Finding report groups without sessions...');
        const allReportGroups = await reportGroupRepo.find();
        console.log(`Found ${allReportGroups.length} total report groups`);

        let deletedCount = 0;
        for (const reportGroup of allReportGroups) {
            const sessionsCount = await reportGroupSessionRepo.count({
                where: { reportGroupId: reportGroup.id }
            });

            if (sessionsCount === 0) {
                console.log(`Deleting report group ${reportGroup.id} (no sessions)`);
                
                // Clear reportGroupSessionId from related reports
                await queryRunner.query(
                    `UPDATE att_reports SET reportGroupSessionId = NULL WHERE reportGroupSessionId IN (SELECT id FROM report_group_sessions WHERE reportGroupId = ?)`,
                    [reportGroup.id]
                );
                await queryRunner.query(
                    `UPDATE grades SET reportGroupSessionId = NULL WHERE reportGroupSessionId IN (SELECT id FROM report_group_sessions WHERE reportGroupId = ?)`,
                    [reportGroup.id]
                );
                
                // Remove reportGroupId from import file metadata
                const importFiles = await importFileRepo
                    .createQueryBuilder('importFile')
                    .where('importFile.metadata IS NOT NULL')
                    .getMany();
                
                for (const importFile of importFiles) {
                    const metadata = importFile.metadata as any;
                    if (metadata?.reportGroupId === reportGroup.id) {
                        delete metadata.reportGroupId;
                        await importFileRepo.save(importFile);
                    }
                }
                
                await reportGroupRepo.delete(reportGroup.id);
                deletedCount++;
            }
        }
        console.log(`Deleted ${deletedCount} report groups without sessions`);

        // Step 2: Recreate report groups and sessions from import files with metadata
        console.log('Step 2: Recreating report groups from import files...');
        
        const importFiles = await importFileRepo
            .createQueryBuilder('importFile')
            .where('importFile.metadata IS NOT NULL')
            .andWhere('importFile.metadata != :empty', { empty: '{}' })
            .getMany();

        console.log(`Found ${importFiles.length} import files with metadata`);

        let recreatedCount = 0;
        for (const importFile of importFiles) {
            try {
                const metadata = importFile.metadata as any;
                
                // Skip if no signature data or date details
                if (!metadata.signatureData && !metadata.dateDetails) {
                    continue;
                }

                // Skip if already has a valid reportGroupId
                if (metadata.reportGroupId) {
                    const existingGroup = await reportGroupRepo.findOne({
                        where: { id: metadata.reportGroupId }
                    });
                    if (existingGroup) {
                        console.log(`Import file ${importFile.id} already has valid reportGroupId ${metadata.reportGroupId}, skipping`);
                        continue;
                    }
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
                    session.userId = importFile.userId;
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
                metadata.reportGroupId = savedReportGroup.id;
                importFile.metadata = metadata;
                await importFileRepo.save(importFile);

                console.log(`Successfully recreated ImportFile ${importFile.id} with ${uniqueDates.length} sessions`);
                recreatedCount++;

            } catch (error) {
                console.error(`Error processing ImportFile ${importFile.id}:`, error);
                // Continue with next import file instead of failing entire migration
            }
        }

        console.log(`Migration completed: deleted ${deletedCount} empty groups, recreated ${recreatedCount} groups with sessions`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is meant to clean up and regenerate data
        // Rolling back would be complex and potentially lose data
        // In practice, you would need to restore from backup if needed
        console.log('Down migration not implemented - restore from backup if needed');
    }

}
