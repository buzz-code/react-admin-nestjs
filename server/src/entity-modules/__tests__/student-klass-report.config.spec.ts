import { StudentKlassReport } from 'src/db/view-entities/StudentKlassReport.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../student-klass-report.config';

createEntityConfigTests('StudentKlassReportConfig', config, {
  entity: StudentKlassReport,
  expectedJoins: {
    student: { eager: false },
  },
  expectedExportJoins: {
    student: { eager: true },
  },
  expectedExportHeaders: {
    count: 10,
    first: { value: 'student.tz', label: 'תז' },
  },
});
