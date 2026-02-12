import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: KnownAbsence,
        query: {
            join: {
                student: { eager: false },
                lesson: { eager: false },
                klass: { eager: false },
                absenceType: { eager: false },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
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
            }
        }
    }
}

export default getConfig();