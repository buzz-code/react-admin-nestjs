import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../known-absence.config';

createEntityConfigTests('KnownAbsenceConfig', config, {
  entity: KnownAbsence,
  expectedJoins: {
    student: { eager: false },
    lesson: { eager: false },
    klass: { eager: false },
    absenceType: { eager: false },
  },
  expectedExportJoins: {
    student: { eager: true },
    absenceType: { eager: true },
  },
  expectedExportHeaders: {
    count: 11,
    first: { value: 'student.name', label: 'תלמידה' },
  },
});
