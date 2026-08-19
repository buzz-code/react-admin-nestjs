import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { CrudAuthAdminFilter } from '@shared/auth/crud-auth.filter';
import scheduleConfig from '@shared/entities/configs/schedule.config';

/**
 * Recurring job definitions (e.g. the weekly attendance cleanup) - admin only,
 * since a wrong klass/lesson/cron here deletes attendance data.
 */
function getConfig(): BaseEntityModuleOptions {
  return {
    ...scheduleConfig,
    crudAuth: CrudAuthAdminFilter,
  };
}

export default getConfig();
