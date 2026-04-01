import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../report-group-session.config';

createEntityConfigTests('ReportGroupSessionConfig', config, {
  entity: ReportGroupSession,
  expectedJoins: {
    reportGroup: { eager: false },
    attReports: { eager: false },
    grades: { eager: false },
  },
});
