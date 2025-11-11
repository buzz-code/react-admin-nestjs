import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { CommonReportData } from "@shared/utils/report/types";
import { ReportGroupSession } from "../db/entities/ReportGroupSession.entity";
import reportGroupSessionsSummary from "src/reports/reportGroupSessionsSummary";

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
