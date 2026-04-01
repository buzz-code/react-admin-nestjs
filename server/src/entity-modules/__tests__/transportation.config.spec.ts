import { Transportation } from 'src/db/entities/Transportation.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../transportation.config';

createEntityConfigTests('TransportationConfig', config, {
  entity: Transportation,
  expectedExportHeaders: {
    count: 4,
    first: { value: 'key', label: 'שילוט' },
  },
});
