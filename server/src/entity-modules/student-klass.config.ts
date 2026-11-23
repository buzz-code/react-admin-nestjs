import { CrudRequest } from '@dataui/crud';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { BulkToPdfReportGenerator } from '@shared/utils/report/bulk-to-pdf.generator';
import { CommonReportData } from '@shared/utils/report/types';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { generateStudentReportCard } from 'src/reports/reportGenerator';
import studentReportCardReact from 'src/reports/studentReportCardReact';
import { fixReferences } from '@shared/utils/entity/fixReference.util';
import { getAsNumberArray } from '@shared/utils/queryParam.util';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: StudentKlass,
    query: {
      join: {
        student: { eager: false },
        klass: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          student: { eager: true },
          klass: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'student.tz', label: 'תז' },
          { value: 'student.name', label: 'שם התלמידה' },
          { value: 'klass.key', label: 'קוד כיתה' },
          { value: 'klass.name', label: 'כיתה' },
          { value: 'student.studentNumber', label: 'מספר תלמידה' },
        ];
      },
    },
    service: StudentKlassService,
  };
}

class StudentKlassService<T extends Entity | StudentKlass> extends BaseEntityService<T> {
  reportsDict = {
    studentReportCardReact: new BulkToPdfReportGenerator(studentReportCardReact),
  };
  async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
    if (req.parsed.extra.report in this.reportsDict) {
      const userId = getUserIdFromUser(req.auth);
      const generator = this.reportsDict[req.parsed.extra.report];
      const ids = getAsNumberArray(req.parsed.extra.ids);
      const studentKlasses = (await this.getManyByIds(req, ids)) as unknown as StudentKlass[];
      const studentIds = [...new Set(studentKlasses.map((item) => item.studentReferenceId))];
      if (!studentIds.length) return { generator, params: [] };
      const extraParams = { ...req.parsed.extra, ids: studentIds.join(',') };
      return generateStudentReportCard(userId, extraParams, generator);
    }
    return super.getReportData(req);
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      case 'fixReferences': {
        const ids = await this.getSelectedIds(req);
        if (!ids.length) return 'לא נבחרו רשומות';
        const referenceFields = {
          studentTz: 'studentReferenceId',
          klassId: 'klassReferenceId',
        };
        return fixReferences(this.dataSource.getRepository(StudentKlass), ids, referenceFields);
      }
    }
    return super.doAction(req, body);
  }
}

export default getConfig();
