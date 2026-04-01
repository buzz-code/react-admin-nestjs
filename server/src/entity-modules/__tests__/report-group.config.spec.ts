import { ReportGroup } from 'src/db/entities/ReportGroup.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../report-group.config';

createEntityConfigTests('ReportGroupConfig', config, {
  entity: ReportGroup,
  expectedJoins: {
    teacher: { eager: false },
    lesson: { eager: false },
    klass: { eager: false },
    sessions: { eager: false },
  },
  expectedExportJoins: {
    teacher: { eager: true },
    lesson: { eager: true },
    klass: { eager: true },
    sessions: { eager: true },
  },
  expectedExportHeaders: {
    count: 8,
    first: { value: 'name', label: 'שם' },
  },
});
