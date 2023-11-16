import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportWithReportMonth } from "src/db/view-entities/AttReportWithReportMonth.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AttReportWithReportMonth,
        query: {
            join: {
                studentBaseKlass: { eager: true },
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
                reportMonth: {},
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
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'reportMonth.name', label: 'חודש דיווח' },
                    { value: 'reportDate', label: 'תאריך דיווח' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
                    // { value: 'sheetName', label: 'חודש דיווח' },
                    { value: 'comments', label: 'הערות' },
                ];
            }
        }
    }
}

export default getConfig();
