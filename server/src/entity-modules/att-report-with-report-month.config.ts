import { CrudRequest, Override, CreateManyDto } from '@dataui/crud';
import { In, DeepPartial } from 'typeorm';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { validateBulk } from '@shared/base-entity/base-entity.util';
import { fixReferences } from '@shared/utils/entity/fixReference.util';
import { getHebrewDateFormatter } from '@shared/utils/formatting/formatter.util';
import { shouldShowTopic } from './att-report.config';
import { getBulkEditUpdate } from '@shared/utils/entity/bulkEdit.util';
import { getAsDate, getAsNumber, getAsBoolean, getAsString, getAsNumberArray } from '@shared/utils/queryParam.util';

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
        reportGroupSession: { eager: false },
      },
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
          reportGroupSession: { eager: shouldShowTopic(req) },
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
          { value: 'comments', label: 'הערות' },
        ];
        if (!shouldShowTopic(req)) {
          const topicIndex = headers.findIndex((h) => typeof h === 'object' && h.value === 'reportGroupSession.topic');
          if (topicIndex !== -1) {
            headers.splice(topicIndex, 1);
          }
        }
        return headers;
      },
    },
    service: AttReportWithReportMonthService,
  };
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
    return attReportService.createMany(
      req,
      dto as unknown as CreateManyDto<DeepPartial<AttReport>>,
    ) as unknown as Promise<T[]>;
  }

  @Override()
  async updateOne(req: CrudRequest<any>, dto: DeepPartial<T>): Promise<T> {
    const attReportService = this.getAttReportService();
    await attReportService.updateOne(req, dto);
    return this.getOne(req);
  }

  @Override()
  async deleteOne(req: CrudRequest<any>): Promise<void | T> {
    const attReportService = this.getAttReportService();
    return attReportService.deleteOne(req) as Promise<void | T>;
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      case 'bulkEdit':
        return this.bulkEdit(req.parsed.extra, await this.getOwnedIds(req));
      case 'bulkKnownAbsences':
        return this.bulkKnownAbsences(req.parsed.extra, await this.getOwnedIds(req));
      case 'fixStudentReferenceV2':
        return this.fixStudentReferenceV2(await this.getOwnedIds(req));
      case 'fixReferences':
        return this.fixReferences(await this.getOwnedIds(req));
    }
    return super.doAction(req, body);
  }

  // Keeps only the selected ids the caller may access (crudAuth filter), so a
  // caller-supplied id from another user's data is never touched.
  private async getOwnedIds(req: CrudRequest<any, any>): Promise<number[]> {
    const ids = getAsNumberArray(req.parsed.extra.ids);
    const entities = await this.getManyByIds(req, ids);
    return entities.map((entity: any) => entity.id);
  }

  private async bulkEdit(extra: Record<string, string>, ids: number[]): Promise<string> {
    if (ids.length === 0) return 'לא נבחרו רשומות';

    const update = getBulkEditUpdate(extra, {
      numbers: ['klassReferenceId', 'teacherReferenceId', 'lessonReferenceId', 'howManyLessons', 'absCount'],
      dates: ['reportDate'],
      strings: ['comments'],
    });
    if (Object.keys(update).length === 0) return 'לא נבחרו שדות לעדכון';

    const result = await this.dataSource.getRepository(AttReport).update({ id: In(ids) }, update);
    return `עודכנו ${result.affected} רשומות`;
  }

  private async bulkKnownAbsences(extra: Record<string, string>, ids: number[]): Promise<string> {
    if (ids.length === 0) return 'לא נבחרו רשומות';
    const reports = await this.dataSource.getRepository(AttReport).findBy({ id: In(ids) });

    const knownAbsences: Array<Partial<KnownAbsence>> = reports.map((report) => ({
      userId: report.userId,
      studentReferenceId: report.studentReferenceId,
      klassReferenceId: report.klassReferenceId,
      lessonReferenceId: report.lessonReferenceId,
      reportDate: getAsDate(extra.reportDate) ?? report.reportDate,
      absnceCount: getAsNumber(extra.absnceCount) ?? Math.round(report.absCount),
      absnceCode: getAsNumber(extra.absnceCode),
      senderName: getAsString(extra.senderName),
      reason: getAsString(extra.reason),
      comment: getAsString(extra.comment),
      isApproved: getAsBoolean(extra.isApproved),
      year: report.year,
    }));
    await validateBulk<AttReportWithReportMonth>(knownAbsences, KnownAbsence);
    await this.dataSource.getRepository(KnownAbsence).insert(knownAbsences);

    return `נוצרו ${reports.length} חיסורים מאושרים`;
  }

  private async fixStudentReferenceV2(ids: number[]): Promise<string> {
    if (ids.length === 0) return 'לא נבחרו רשומות';
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

  private async fixReferences(ids: number[]): Promise<string> {
    if (ids.length === 0) return 'לא נבחרו רשומות';
    const referenceFields = {
      studentTz: 'studentReferenceId',
      klassId: 'klassReferenceId',
      lessonId: 'lessonReferenceId',
    };
    return fixReferences(this.dataSource.getRepository(AttReport), ids, referenceFields);
  }
}

export default getConfig();
