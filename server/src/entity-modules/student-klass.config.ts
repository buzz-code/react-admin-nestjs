import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentKlass,
        query: {
            join: {
                student: {},
                klass: {},
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
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                ];
            }
        },
    }
}

export default getConfig();