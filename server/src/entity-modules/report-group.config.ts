import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { ReportGroup } from "../db/entities/ReportGroup.entity";
import lessonSignaturePdfReport from "src/reports/lessonSignaturePdfReport";
import { IHeader } from "@shared/utils/exporter/types";
import { getHebrewDateFormatter } from "@shared/utils/formatting/formatter.util";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { getAsNumberArray, getAsString } from "src/utils/queryParam.util";

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
        return getAsNumberArray(req.parsed.extra.ids)
            ?.map(id => ({
                userId,
                reportGroupId: id,
            }));
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'updateSignatureData': {
                const ids = getAsNumberArray(req.parsed.extra.ids);
                if (!ids) return 'לא נבחרו רשומות';
                const signatureData = getAsString(req.parsed.extra.signatureData);
                await this.updateSignatureData(ids, signatureData);
                return `עודכנו חתימות ל-${ids.length} קבוצות דוחות`;
            }
        }
        return super.doAction(req, body);
    }

    private async updateSignatureData(ids: number[], signatureData: string | undefined) {
        if (!signatureData) {
            throw new BadRequestException('לא סופקה חתימה לעדכון');
        }
        const repo = this.repo as Repository<ReportGroup>;
        for (const id of ids) {
            await repo.update({ id }, { signatureData });
        }
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
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    teacher: { eager: true },
                    lesson: { eager: true },
                    klass: { eager: true },
                    sessions: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { label: 'שם', value: 'name' },
                    { label: 'נושא', value: 'topic' },
                    { label: 'מורה', value: 'teacher.name' },
                    { label: 'שיעור', value: 'lesson.name' },
                    { label: 'כיתה', value: 'klass.name' },
                    { label: 'שנה', value: 'year' },
                    { label: 'מספר שיעורים', value: 'sessions.length' },
                    { label: 'נוצר בתאריך', value: getHebrewDateFormatter('createdAt') },
                ];
            }
        },
    }
}

export default getConfig();
