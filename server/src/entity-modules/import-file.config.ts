import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IContent, IHeader } from "@shared/utils/exporter/types";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { ImportFile } from "@shared/entities/ImportFile.entity";
import lessonSignaturePdfReport from "src/reports/lessonSignaturePdfReport";
import { getAsNumberArray } from "src/utils/queryParam.util";

const entityNameDictionary = {
  student: 'תלמידות',
  teacher: 'מורות',
  klass: 'כיתות',
  lesson: 'שיעורים',
  att_report: 'דיווחי נוכחות',
  grade: 'ציונים'
};

const successDictionary = {
  true: '✓ הצליח',
  false: '✗ נכשל'
};

class ImportFileService<T extends Entity | ImportFile> extends BaseEntityService<T> {
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
        importFileId: id,
      }));
  }
}

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: ImportFile,
    service: ImportFileService,
    exporter: {
      getExportHeaders(): IHeader<ImportFile | IContent>[] {
        return [
          { value: 'fileName', label: 'שם הקובץ' },
          { value: 'fileSource', label: 'מקור הקובץ' },
          { value: 'entityIds.length', label: 'מספר רשומות' },
          {
            value: (record: ImportFile) => entityNameDictionary[record.entityName] || record.entityName,
            label: 'סוג טבלה'
          },
          {
            value: (record: ImportFile) => successDictionary[record.fullSuccess?.toString()],
            label: 'הצלחה'
          },
          { value: 'response', label: 'תגובה' },
          {
            value: (record: ImportFile) => new Date(record.createdAt).toLocaleString('he-IL', {
              timeZone: 'Asia/Jerusalem',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            label: 'תאריך יצירה'
          },
        ];
      }
    }
  };
}

export default getConfig();
