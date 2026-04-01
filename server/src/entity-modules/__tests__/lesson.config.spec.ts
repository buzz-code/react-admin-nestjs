import { Lesson } from 'src/db/entities/Lesson.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../lesson.config';

createEntityConfigTests('LessonConfig', config, {
  entity: Lesson,
  expectedJoins: {
    teacher: { eager: false },
    lessonKlassName: { eager: false },
  },
  expectedExportJoins: {
    teacher: { eager: true },
    lessonKlassName: { eager: true },
  },
  expectedExportHeaders: {
    count: 7,
    first: { value: 'key', label: 'מזהה' },
  },
});
