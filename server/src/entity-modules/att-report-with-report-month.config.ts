import { CrudRequest, Override, CreateManyDto } from "@dataui/crud";
import { In, DeepPartial } from "typeorm";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportWithReportMonth } from "src/db/view-entities/AttReportWithReportMonth.entity";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { AttReport } from "src/db/entities/AttReport.entity";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { validateBulk } from "@shared/base-entity/base-entity.util";
import { fixReferences } from "@shared/utils/entity/fixReference.util";
import { getHebrewDateFormatter } from "@shared/utils/formatting/formatter.util";
import { shouldShowTopic } from "./att-report.config";
import { getAsArray, getAsDate, getAsNumber, getAsBoolean, getAsString, getAsNumberArray } from "@shared/utils/queryParam.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AttReportWithReportMonth,
        query: {
            join: {
                studentBaseKlass: { eager: true },
                student: { eager: false },
                teacher: { eager: false },
                lesson: { eager: false },
                klass: { eager: false },
                'klass.klassType': { eager: false },
                reportMonth: { eager: false },
                reportGroupSession: { eager: false }
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    studentBaseKlass: { eager: true },
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true },
                    reportMonth: { eager: true },
                    reportGroupSession: { eager: shouldShowTopic(req) }
                };
                return innerFunc(req);
            },
            getExportHeaders(entityColumns?: string[], req?: CrudRequest): IHeader[] {
                const headers: IHeader[] = [
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'reportGroupSession.topic', label: 'נושא השיעור' },
                    { value: 'reportMonth.name', label: 'חודש דיווח' },
                    { value: 'reportDate', label: 'תאריך דיווח' },
                    { value: getHebrewDateFormatter('reportDate'), label: 'תאריך עברי' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
                    // { value: 'sheetName', label: 'חודש דיווח' },
                    { value: 'comments', label: 'הערות' },
                ];
                if (!shouldShowTopic(req)) {
                    const topicIndex = headers.findIndex(h => typeof h === 'object' && h.value === 'reportGroupSession.topic');
                    if (topicIndex !== -1) {
                        headers.splice(topicIndex, 1);
                    }
                }
                return headers;
            }
        },
        service: AttReportWithReportMonthService,
    }
}


class AttReportWithReportMonthService<T extends Entity | AttReportWithReportMonth> extends BaseEntityService<T> {
    private getAttReportService(): BaseEntityService<AttReport> {
        const attReportService = new BaseEntityService(this.dataSource.getRepository(AttReport), this.mailSendService);
        attReportService.dataSource = this.dataSource;
        return attReportService;
    }

    @Override()
    async createOne(req: CrudRequest<any>, dto: DeepPartial<T>): Promise<T> {
        const attReportService = this.getAttReportService();
        await attReportService.createOne(req, dto);
        return this.getOne(req);
    }

    @Override()
    async createMany(req: CrudRequest<any>, dto: CreateManyDto<DeepPartial<T>>): Promise<T[]> {
        const attReportService = this.getAttReportService();
        return attReportService.createMany(req, dto as unknown as CreateManyDto<DeepPartial<AttReport>>) as unknown as Promise<T[]>;
    }

    @Override()
    async updateOne(req: CrudRequest<any>, dto: DeepPartial<T>): Promise<T> {
        const attReportService = this.getAttReportService();
        await attReportService.updateOne(req, dto);
        return this.getOne(req);
    }

    @Override()
    async deleteOne(req: CrudRequest<any>): Promise<void | T> {
        const attReportService = new BaseEntityService(this.dataSource.getRepository(AttReport), this.mailSendService);
        return attReportService.deleteOne(req) as Promise<void | T>;
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'bulkKnownAbsences': {
                const ids = getAsArray(req.parsed.extra.ids);
                if (!ids) return 'לא נבחרו רשומות';
                const reports = await this.dataSource.getRepository(AttReport).findBy({ id: In(ids) });

                const knownAbsences: Array<Partial<KnownAbsence>> = reports.map(report => ({
                    userId: report.userId,
                    studentReferenceId: report.studentReferenceId,
                    klassReferenceId: report.klassReferenceId,
                    lessonReferenceId: report.lessonReferenceId,
                    reportDate: getAsDate(req.parsed.extra.reportDate) ?? report.reportDate,
                    absnceCount: getAsNumber(req.parsed.extra.absnceCount) ?? Math.round(report.absCount),
                    absnceCode: getAsNumber(req.parsed.extra.absnceCode),
                    senderName: getAsString(req.parsed.extra.senderName),
                    reason: getAsString(req.parsed.extra.reason),
                    comment: getAsString(req.parsed.extra.comment),
                    isApproved: getAsBoolean(req.parsed.extra.isApproved),
                    year: report.year,
                }))
                await validateBulk<T>(knownAbsences, KnownAbsence);
                await this.dataSource.getRepository(KnownAbsence).insert(knownAbsences);

                return `נוצרו ${reports.length} חיסורים מאושרים`;
            }
            case 'fixStudentReferenceV2': {
                const ids = getAsArray(req.parsed.extra.ids);
                if (!ids) return 'לא נבחרו רשומות';
                const reports = await this.dataSource.getRepository(AttReport).findBy({ id: In(ids) });

                const reportsToSave = [];
                for (const report of reports) {
                    if (report.studentReferenceId && !report.studentTz) {
                        report.studentTz = String(report.studentReferenceId)?.padStart(9, '0');
                        report.studentReferenceId = null;
                        await report.fillFields();
                        reportsToSave.push(report);
                    }
                }
                if (reportsToSave.length > 0) {
                    await this.dataSource.getRepository(AttReport).save(reportsToSave);
                }
                return `עודכנו ${reportsToSave.length} רשומות`;
            }
            case 'fixReferences': {
                const ids = getAsNumberArray(req.parsed.extra.ids);
                if (!ids) return 'לא נבחרו רשומות';
                const referenceFields = {
                    studentTz: 'studentReferenceId',
                    klassId: 'klassReferenceId',
                    lessonId: 'lessonReferenceId',
                };
                return fixReferences(this.dataSource.getRepository(AttReport), ids, referenceFields);
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();
