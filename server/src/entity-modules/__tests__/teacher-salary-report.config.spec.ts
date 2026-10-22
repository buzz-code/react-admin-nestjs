import { TeacherSalaryReport } from 'src/db/view-entities/TeacherSalaryReport.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../teacher-salary-report.config';

createEntityConfigTests('TeacherSalaryReportConfig', config, {
  entity: TeacherSalaryReport,
  expectedJoins: {
    teacher: {},
    lesson: {},
    klass: {},
    'klass.klassType': {},
    reportMonth: {},
  },
  expectedExportJoins: {
    teacher: { eager: true },
    klass: { eager: true },
    'klass.klassType': { eager: false },
    lesson: { eager: true },
    reportMonth: { eager: true },
  },
  expectedExportHeaders: {
    count: 6,
    first: { value: 'teacher.name', label: 'שם המורה' },
  },
});
