import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { CommonReportData } from "@shared/utils/report/types";
import { IHeader } from "@shared/utils/exporter/types";
import { Klass } from "src/db/entities/Klass.entity";
import klassAttendanceReportGenerator from "src/reports/klassAttendanceReport";
import { getAsDate, getAsNumberArray } from "@shared/utils/queryParam.util";
import { fixReferences } from "@shared/utils/entity/fixReference.util";

class KlassService<T extends Entity | Klass> extends BaseEntityService<T> {
    reportsDict = {
        klassAttendanceReport: klassAttendanceReportGenerator,
    };

    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = this.getKlassAttendanceReportParams(req);
            return { generator, params };
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'fixReferences': {
                const ids = getAsNumberArray(req.parsed.extra.ids);
                if (!ids) return 'לא נבחרו רשומות';
                const referenceFields = {
                    klassTypeId: 'klassTypeReferenceId',
                    teacherId: 'teacherReferenceId',
                };
                return fixReferences(this.dataSource.getRepository(Klass), ids, referenceFields);
            }
        }
        return super.doAction(req, body);
    }

    private getKlassAttendanceReportParams(req: CrudRequest<any, any>) {
        const userId = getUserIdFromUser(req.auth);
        const startDate = getAsDate(req.parsed.extra.startDate);
        const endDate = getAsDate(req.parsed.extra.endDate);
        const lessonReferenceIds = getAsNumberArray(req.parsed.extra.lessonReferenceIds);

        return getAsNumberArray(req.parsed.extra.ids)
            ?.map(id => ({
                userId,
                klassId: id,
                startDate,
                endDate,
                lessonReferenceIds
            }));
    }
}

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Klass,
        service: KlassService,
        query: {
            join: {
                teacher: { eager: false },
                klassType: { eager: false },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    klassType: { eager: true },
                    teacher: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'key', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'klassType.name', label: 'סוג כיתה' },
                    { value: 'teacher.name', label: 'מורה' },
                    { value: 'displayName', label: 'שם לתעודה' },
                ];
            }
        }
    }
}

export default getConfig();

