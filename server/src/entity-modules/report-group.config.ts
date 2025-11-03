import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { ReportGroup } from "../db/entities/ReportGroup.entity";
import lessonSignaturePdfReport from "src/reports/lessonSignaturePdfReport";

class ReportGroupService<T extends Entity | ReportGroup> extends BaseEntityService<T> {
    reportsDict = {
        lessonSignaturePdf: new BulkToPdfReportGenerator(lessonSignaturePdfReport),
    };

    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = this.getLessonSignaturePdfParams(req);
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    private getLessonSignaturePdfParams(req: CrudRequest<any, any>) {
        const userId = getUserIdFromUser(req.auth);
        return req.parsed.extra.ids
            .toString()
            .split(',')
            .map(id => ({
                userId,
                reportGroupId: parseInt(id),
            }));
    }
}

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: ReportGroup,
        service: ReportGroupService,
        query: {
            join: {
                teacher: { eager: false },
                lesson: { eager: false },
                klass: { eager: false },
                sessions: { eager: false },
            }
        }
    }
}

export default getConfig();
