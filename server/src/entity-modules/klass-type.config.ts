import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/exporter/types";
import { KlassType } from "src/entities/KlassType.entity";

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