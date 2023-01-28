import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/exporter/types";
import { Lesson } from "src/db/entities/Lesson.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Lesson,
        exporter: {
            async processReqForExport(req: CrudRequest): Promise<void> {
                req.options.query.join = {
                    teacher: { eager: true },
                };
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