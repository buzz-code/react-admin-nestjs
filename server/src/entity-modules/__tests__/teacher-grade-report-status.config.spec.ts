import { TeacherGradeReportStatus } from 'src/db/view-entities/TeacherGradeReportStatus.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../teacher-grade-report-status.config';

createEntityConfigTests('TeacherGradeReportStatusConfig', config, {
  entity: TeacherGradeReportStatus,
  expectedExportHeaders: {
    count: 4,
    first: { value: 'teacherName', label: 'מורה' },
  },
});
