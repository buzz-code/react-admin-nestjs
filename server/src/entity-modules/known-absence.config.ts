import { CrudRequest } from '@dataui/crud';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { validateBulk } from '@shared/base-entity/base-entity.util';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import {
  buildKnownAbsences,
  findAbsencesByStudentDates,
  StudentDatesRow,
} from 'src/utils/approveAbsencesByStudentDates.util';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: KnownAbsence,
    bulkEditFields: [
      'reportDate',
      'klassReferenceId',
      'lessonReferenceId',
      'absnceCount',
      'absnceCode',
      'reason',
      'senderName',
      'comment',
      'isApproved',
    ],
    query: {
      join: {
        student: { eager: false },
        lesson: { eager: false },
        klass: { eager: false },
        absenceType: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          student: { eager: true },
          lesson: { eager: true },
          klass: { eager: true },
          absenceType: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'student.name', label: 'תלמידה' },
          { value: 'klass.name', label: 'כיתה' },
          { value: 'lesson.name', label: 'שיעור' },
          { value: 'absenceType.name', label: 'סוג אירוע' },
          { value: 'reportDate', label: 'תאריך דיווח' },
          { value: 'absnceCount', label: 'מספר היעדרויות' },
          { value: 'absnceCode', label: 'קוד היעדרות' },
          { value: 'senderName', label: 'שם השולח' },
          { value: 'reason', label: 'סיבה' },
          { value: 'comment', label: 'הערה' },
          { value: 'isApproved', label: 'מאושר' },
        ];
      },
    },
    service: KnownAbsenceService,
  };
}

class KnownAbsenceService<T extends Entity | KnownAbsence> extends BaseEntityService<T> {
  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      // body.rows: [{ studentTz | studentReferenceId, klassId?, fromDate, toDate? }]
      case 'previewByStudentDates':
        return findAbsencesByStudentDates(this.dataSource, getUserIdFromUser(req.auth), getRows(body));
      case 'approveByStudentDates': {
        const matches = await findAbsencesByStudentDates(this.dataSource, getUserIdFromUser(req.auth), getRows(body));
        const knownAbsences = buildKnownAbsences(matches, body ?? {});
        if (knownAbsences.length === 0) return 'לא נמצאו חיסורים לאישור';
        await validateBulk<KnownAbsence>(knownAbsences, KnownAbsence);
        await this.dataSource.getRepository(KnownAbsence).insert(knownAbsences);
        return `נוצרו ${knownAbsences.length} חיסורים מאושרים`;
      }
    }
    return super.doAction(req, body);
  }
}

function getRows(body: any): StudentDatesRow[] {
  return Array.isArray(body?.rows) ? body.rows : [];
}

export default getConfig();
