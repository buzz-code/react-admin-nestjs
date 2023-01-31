import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Student } from "src/db/entities/Student.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Student,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'tz', label: 'תז' },
                    { value: 'name', label: 'שם' },
                ];
            }
        },
    }
}

export default getConfig();