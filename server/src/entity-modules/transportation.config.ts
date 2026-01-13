import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Transportation } from 'src/db/entities/Transportation.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Transportation,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'key', label: 'שילוט' },
          { value: 'year', label: 'שנה' },
          { value: 'departureTime', label: 'שעת יציאה' },
          { value: 'description', label: 'תיאור נסיעה' },
        ];
      },
    },
  };
}

export default getConfig();
