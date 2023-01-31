import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { KlassType } from "src/db/entities/KlassType.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: KlassType,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'key', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                ];
            }
        }
    }
}

export default getConfig();