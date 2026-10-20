import { CrudRequest } from '@dataui/crud';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { generateCommonFileResponse } from '@shared/utils/report/report.util';
import { getAsNumber, getAsNumberArray } from '@shared/utils/queryParam.util';
import { User } from '@shared/entities/User.entity';
import { IHeader } from '@shared/utils/exporter/types';
import { getHebrewDateFormatter } from '@shared/utils/formatting/formatter.util';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { hasPermission, isAdmin } from '@shared/utils/permissionsUtil';
import { roundObjectProperty } from '@shared/utils/reportData.util';
import attendanceSheetTemplate, { AttendanceSheetTemplateParams } from 'src/reports/attendanceSheetTemplate';
import { importAttendanceWorkbook, parseAttendanceWorkbook } from 'src/utils/attendanceSheet.util';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: AttReport,
    query: {
      join: {
        studentBaseKlass: { eager: true },
        student: { eager: false },
        teacher: { eager: false },
        lesson: { eager: false },
        klass: { eager: false },
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
          reportGroupSession: { eager: shouldShowTopic(req) },
        };
        return innerFunc(req);
      },
      getExportHeaders(entityColumns?: string[], req?: CrudRequest): IHeader[] {
        const headers: IHeader[] = [
          { value: 'teacher.name', label: 'שם המורה' },
          { value: 'student.name', label: 'שם התלמידה' },
          { value: 'student.tz', label: 'תז התלמידה' },
          { value: 'studentBaseKlass.klassName', label: 'כיתת בסיס' },
          { value: 'klass.name', label: 'כיתה' },
          { value: 'lesson.name', label: 'שיעור' },
          { value: 'reportGroupSession.topic', label: 'נושא השיעור' },
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
      getImportDefinition(importFields) {
        return {
          importFields: ['klassId', 'studentReferenceId', '', 'lateCount', 'absCount', 'comments'],
          specialFields: [
            { cell: { c: 2, r: 0 }, value: 'teacherId' },
            { cell: { c: 2, r: 1 }, value: 'lessonId' },
            { cell: { c: 4, r: 0 }, value: 'reportDate' },
            { cell: { c: 4, r: 1 }, value: 'howManyLessons' },
          ],
          hardCodedFields: [{ field: 'reportDate', value: new Date() }],
          beforeSave: calcAttLateCount,
        };
      },
    },
    service: AttReportService,
  };
}

class AttReportService<T extends Entity | AttReport> extends BaseEntityService<T> {
  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      case 'attendanceSheetTemplate': {
        const params: AttendanceSheetTemplateParams = {
          userId: getAttendanceSheetUserId(req),
          klassId: getAsNumber(req.parsed.extra.klassId),
          lessonIds: getAsNumberArray(req.parsed.extra.lessonIds) ?? [],
        };
        return generateCommonFileResponse(attendanceSheetTemplate, params, this.dataSource);
      }
      case 'attendanceSheetImport': {
        const userId = getAttendanceSheetUserId(req);
        const workbook = new ExcelJS.Workbook();
        try {
          await workbook.xlsx.load(Buffer.from(body?.fileData ?? '', 'base64'));
        } catch {
          throw new BadRequestException('הקובץ אינו קובץ xlsx תקין');
        }
        return importAttendanceWorkbook(this.dataSource, userId, parseAttendanceWorkbook(workbook));
      }
    }
    return super.doAction(req, body);
  }
}

// Every lookup and saved report is scoped to this user, so an admin must impersonate one first
const getAttendanceSheetUserId = (req: CrudRequest) => {
  if (!isAdmin(req.auth) && !hasPermission(req.auth, 'attendanceSheetImport')) {
    throw new ForbiddenException('אין הרשאה לקליטת קובץ נוכחות');
  }
  const userId = getUserIdFromUser(req.auth);
  if (!userId) {
    throw new BadRequestException('יש להתחבר כמשתמש כדי לקלוט קובץ נוכחות');
  }
  return userId;
};

export default getConfig();

export const shouldShowTopic = (req: CrudRequest | undefined): boolean => {
  if (!req) return false;
  return isAdmin(req.auth) || hasPermission(req.auth, 'lessonSignature');
};

export const calcAttLateCount = (report: AttReport & { lateCount: number }, user: User) => {
  report.absCount = isNaN(report.absCount) ? 0 : Number(report.absCount);
  report.lateCount = isNaN(report.lateCount) ? 0 : Number(report.lateCount);
  const lateValue = user.additionalData?.lateValue ?? 0.3;
  report.absCount += report.lateCount * lateValue;
  roundObjectProperty(report, 'absCount');
  delete report.lateCount;
};
