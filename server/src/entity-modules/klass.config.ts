import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { CommonReportData } from "@shared/utils/report/types";
import { IHeader } from "@shared/utils/exporter/types";
import { Klass } from "src/db/entities/Klass.entity";
import klassAttendanceReportGenerator from "src/reports/klassAttendanceReport";

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

    private getKlassAttendanceReportParams(req: CrudRequest<any, any>) {
        const userId = getUserIdFromUser(req.auth);
        const startDate = getAsDate(req.parsed.extra.startDate);
        const endDate = getAsDate(req.parsed.extra.endDate);
        const lessonReferenceIds = getAsString(req.parsed.extra.lessonReferenceIds)
            ?.split(',')
            .map(Number)
            .filter(Boolean)
            .filter((val) => !isNaN(val));

        return req.parsed.extra.ids
            .toString()
            .split(',')
            .map(id => ({
                userId,
                klassId: Number(id),
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

function ifNotUndefined<T>(value: T | undefined): T | undefined {
    return value !== 'undefined' ? value : undefined;
}

function getAsDate(dateStr: string | undefined): Date | undefined {
    return ifNotUndefined(dateStr) ? new Date(dateStr) : undefined;
}

function getAsString(value: string | undefined): string | undefined {
    return ifNotUndefined(value) ? String(value) : undefined;
}
