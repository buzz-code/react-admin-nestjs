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
            },
            getImportFields(entityColumns) {
                entityColumns.splice(1, 0, '');
                return entityColumns;
            },
        }
    }
}

export default getConfig();