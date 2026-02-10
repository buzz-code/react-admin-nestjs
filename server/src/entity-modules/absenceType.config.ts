import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { AbsenceType } from 'src/db/entities/AbsenceType.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: AbsenceType,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'name', label: 'סוג חיסור' },
          { value: 'year', label: 'שנה' },
          { value: 'quota', label: 'מכסה שנתית' },
          { value: 'requiredLabels', label: 'שדות חובה לדיווח' },
        ];
      },
    },
  };
}

export default getConfig();