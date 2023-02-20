import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Lesson } from "src/db/entities/Lesson.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Lesson,
        query: {
            join: {
                teacher: {},
            },
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    teacher: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'key', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'klasses', label: 'כיתות' },
                    { value: 'teacher.name', label: 'מורה' },
                    { value: 'startDate', label: 'תאריך התחלה' },
                    { value: 'endDate', label: 'תאריך סיום' },
                ];
            }
        },
    }
}

export default getConfig();