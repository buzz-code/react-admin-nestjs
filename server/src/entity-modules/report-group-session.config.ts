import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { CommonReportData } from "@shared/utils/report/types";
import { ReportGroupSession } from "../db/entities/ReportGroupSession.entity";
import reportGroupSessionsSummary from "src/reports/reportGroupSessionsSummary";
import { In } from "typeorm";

class ReportGroupSessionService<T extends Entity | ReportGroupSession> extends BaseEntityService<T> {
    reportsDict = {
        sessionsSummary: reportGroupSessionsSummary,
    };

    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = this.getSessionsSummaryParams(req);
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    private getSessionsSummaryParams(req: CrudRequest<any, any>) {
        const userId = getUserIdFromUser(req.auth);
        const sessionIds = req.parsed.extra.ids
            .toString()
            .split(',')
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));
        
        return {
            userId,
            sessionIds,
        };
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'adjustTime': {
                const ids = req.parsed.extra.ids.toString().split(',').map(Number).filter(id => !isNaN(id));
                const hoursAdjustment = parseInt(req.parsed.extra.hoursAdjustment) || 0;
                
                if (hoursAdjustment === 0) {
                    return 'לא בוצע שינוי - יש להזין מספר שעות';
                }

                const sessions = await this.dataSource.getRepository(ReportGroupSession).find({
                    where: { id: In(ids) }
                });

                let updatedCount = 0;
                for (const session of sessions) {
                    const updates: Partial<ReportGroupSession> = {};
                    
                    if (session.startTime) {
                        updates.startTime = this.adjustTimeString(session.startTime, hoursAdjustment);
                    }
                    if (session.endTime) {
                        updates.endTime = this.adjustTimeString(session.endTime, hoursAdjustment);
                    }

                    if (Object.keys(updates).length > 0) {
                        await this.dataSource.getRepository(ReportGroupSession).update(
                            { id: session.id },
                            updates
                        );
                        updatedCount++;
                    }
                }

                return `עודכנו ${updatedCount} מפגשים`;
            }
        }
        return super.doAction(req, body);
    }

    /**
     * Adjusts a time string (HH:mm:ss or HH:mm) by a number of hours
     * Handles wrapping around midnight (00:00 - 23:59)
     */
    private adjustTimeString(timeStr: string, hoursAdjustment: number): string {
        const parts = timeStr.split(':');
        let hours = parseInt(parts[0]) || 0;
        const minutes = parts[1] || '00';
        const seconds = parts[2] || '00';

        hours = (hours + hoursAdjustment) % 24;
        if (hours < 0) hours += 24;

        return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    }
}

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: ReportGroupSession,
        service: ReportGroupSessionService,
        query: {
            join: {
                reportGroup: { eager: false },
                attReports: { eager: false },
                grades: { eager: false },
            }
        }
    }
}

export default getConfig();
