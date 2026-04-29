import { AbsenceType } from 'src/db/entities/AbsenceType.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../absenceType.config';

createEntityConfigTests('AbsenceTypeConfig', config, {
  entity: AbsenceType,
  expectedExportHeaders: {
    count: 4,
    first: { value: 'name', label: 'סוג חיסור' },
  },
});
