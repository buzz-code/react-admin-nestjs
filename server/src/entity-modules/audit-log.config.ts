import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { AuditLog } from "@shared/entities/AuditLog.entity";
import { IHeader } from "@shared/utils/exporter/types";
import { getJsonFormatter } from "@shared/utils/formatting/formatter.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AuditLog,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'userId', label: 'משתמש' },
                    { value: 'entityId', label: 'מזהה שורה' },
                    { value: 'entityName', label: 'טבלה' },
                    { value: 'operation', label: 'פעולה' },
                    { value: getJsonFormatter('entityData'), label: 'המידע שהשתנה' },
                    { value: 'createdAt', label: 'תאריך יצירה' },
                ];
            }
        },
    }
}

export default getConfig();