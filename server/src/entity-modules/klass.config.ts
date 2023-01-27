import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/exporter/types";
import { Klass } from "src/entities/Klass.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Klass,
        exporter: {
            async processReqForExport(req: CrudRequest): Promise<void> {
                req.options.query.join = {
                    KlassType: { eager: true },
                    teacher: { eager: true },
                };
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'key', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'klassType.name', label: 'סוג כיתה' },
                    { value: 'teacher.name', label: 'מורה' },
                ];
            }
        }
    }
}

export default getConfig();