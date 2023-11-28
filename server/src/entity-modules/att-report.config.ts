import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReport } from "src/db/entities/AttReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AttReport,
        query: {
            join: {
                studentBaseKlass: { eager: true },
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true }
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
                    { value: 'reportDate', label: 'תאריך דיווח' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
                    // { value: 'sheetName', label: 'חודש דיווח' },
                    { value: 'comments', label: 'הערות' },
                ];
            },
            getImportDefinition(importFields) {
                return {
                    importFields: [
                        'klassId',
                        'studentTz',
                        '',
                        'howManyLessons',
                        'absCount',
                        'comments',
                    ],
                    specialFields: [
                        { cell: { c: 2, r: 0 }, value: 'teacherId' },
                        { cell: { c: 2, r: 1 }, value: 'lessonId' },
                        { cell: { c: 4, r: 0 }, value: 'reportDate' },
                    ],
                    hardCodedFields: [
                        { field: 'reportDate', value: new Date() },
                    ]
                };
            }
        }
    }
}

export default getConfig();
