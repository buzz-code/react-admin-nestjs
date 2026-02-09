import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Event } from 'src/db/entities/Event.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Event,
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