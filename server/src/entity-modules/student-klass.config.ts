import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/exporter/types";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentKlass,
        exporter: {
            async processReqForExport(req: CrudRequest): Promise<void> {
                req.options.query.join = {
                    student: { eager: true },
                    klass: { eager: true },
                };
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                ];
            }
        },
    }
}

export default getConfig();