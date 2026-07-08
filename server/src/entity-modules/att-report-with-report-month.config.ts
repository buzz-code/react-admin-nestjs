import { CrudRequest, Override, CreateManyDto } from '@dataui/crud';
import { In, DeepPartial } from 'typeorm';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { validateBulk } from '@shared/base-entity/base-entity.util';
import { fixReferences } from '@shared/utils/entity/fixReference.util';
import { getHebrewDateFormatter } from '@shared/utils/formatting/formatter.util';
import { shouldShowTopic } from './att-report.config';
import {
  getAsArray,
  getAsDate,
  getAsNumber,
  getAsBoolean,
  getAsString,
  getAsNumberArray,
} from '@shared/utils/queryParam.util';

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
          // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
          // { value: 'sheetName', label: 'חודש דיווח' },
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
    const attReportService = new BaseEntityService(this.dataSource.getRepository(AttReport), this.mailSendService);
    return attReportService.deleteOne(req) as Promise<void | T>;
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      case 'bulkChangeKlass':
        return this.bulkChangeKlass(req.parsed.extra);
      case 'bulkChangeTeacher':
        return this.bulkChangeTeacher(req.parsed.extra);
      case 'bulkKnownAbsences':
        return this.bulkKnownAbsences(req.parsed.extra);
      case 'fixStudentReferenceV2':
        return this.fixStudentReferenceV2(req.parsed.extra);
      case 'fixReferences':
        return this.fixReferences(req.parsed.extra);
      case 'deleteOutsideKlass':
        return this.deleteOutsideKlass(req.parsed.extra);
    }
    return super.doAction(req, body);
  }

  private async bulkChangeKlass(extra: any): Promise<string> {
    const ids = getAsNumberArray(extra.ids);
    if (!ids || ids.length === 0) return 'לא נבחרו רשומות';
    const klassReferenceId = getAsNumber(extra.klassReferenceId);
    if (!klassReferenceId) return 'לא נבחרה כיתה';
    const result = await this.dataSource.getRepository(AttReport).update({ id: In(ids) }, { klassReferenceId });
    return `עודכנו ${result.affected} רשומות`;
  }

  private async bulkChangeTeacher(extra: any): Promise<string> {
    const ids = getAsNumberArray(extra.ids);
    if (!ids || ids.length === 0) return 'לא נבחרו רשומות';
    const teacherReferenceId = getAsNumber(extra.teacherReferenceId);
    if (!teacherReferenceId) return 'לא נבחר מורה';
    const result = await this.dataSource.getRepository(AttReport).update({ id: In(ids) }, { teacherReferenceId });
    return `עודכנו ${result.affected} רשומות`;
  }

  private async bulkKnownAbsences(extra: any): Promise<string> {
    const ids = getAsArray(extra.ids);
    if (!ids) return 'לא נבחרו רשומות';
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

  private async fixStudentReferenceV2(extra: any): Promise<string> {
    const ids = getAsArray(extra.ids);
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

  private async fixReferences(extra: any): Promise<string> {
    const ids = getAsNumberArray(extra.ids);
    if (!ids) return 'לא נבחרו רשומות';
    const referenceFields = {
      studentTz: 'studentReferenceId',
      klassId: 'klassReferenceId',
      lessonId: 'lessonReferenceId',
    };
    return fixReferences(this.dataSource.getRepository(AttReport), ids, referenceFields);
  }

  private async deleteOutsideKlass(extra: any): Promise<string> {
    const ids = getAsNumberArray(extra.ids);
    if (!ids || ids.length === 0) return 'לא נבחרו רשומות';
    const klassReferenceId = getAsNumber(extra.klassReferenceId);
    if (!klassReferenceId) return 'לא נבחרה כיתה';
    const reportDate = getAsDate(extra.reportDate);
    if (!reportDate) return 'לא נבחר תאריך';

    const reports = await this.dataSource.getRepository(AttReport).findBy({ id: In(ids), reportDate });
    if (reports.length === 0) return 'לא נמצאו רשומות מתאימות לתאריך שנבחר';

    const studentIds = reports.map((report) => report.studentReferenceId).filter(Boolean);
    const studentKlasses = await this.dataSource
      .getRepository(StudentKlass)
      .findBy({ studentReferenceId: In(studentIds), klassReferenceId });
    const studentYearsInKlass = new Set(studentKlasses.map((sk) => `${sk.studentReferenceId}_${sk.year}`));

    const idsToDelete = reports
      .filter((report) => !studentYearsInKlass.has(`${report.studentReferenceId}_${report.year}`))
      .map((report) => report.id);
    if (idsToDelete.length === 0) return 'כל התלמידות שנבחרו משויכות לכיתה, לא נמחקה אף רשומה';

    await this.dataSource.getRepository(AttReport).delete(idsToDelete);
    return `נמחקו ${idsToDelete.length} רשומות נוכחות עבור תלמידות שאינן משויכות לכיתה שנבחרה`;
  }
}

export default getConfig();
