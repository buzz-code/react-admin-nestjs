import { CrudRequest } from '@dataui/crud';
import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { LessonSchedule } from 'src/db/entities/LessonSchedule.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: LessonSchedule,
    query: {
      join: {
        teacher: { eager: false },
        klass: { eager: false },
        lesson: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          teacher: { eager: true },
          klass: { eager: true },
          lesson: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'teacher.name', label: 'מורה' },
          { value: 'klass.name', label: 'התמחות' },
          { value: 'lesson.name', label: 'שיעור' },
          { value: 'groupNumber', label: 'קבוצה' },
          { value: 'scheduleDate', label: 'תאריך' },
          { value: 'startTime', label: 'משעה' },
          { value: 'organizationalYear', label: 'שנה אירגונית' },
        ];
      },
    },
  };
}

export default getConfig();
