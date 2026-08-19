import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { CrudAuthAdminFilter } from '@shared/auth/crud-auth.filter';
import jobConfig from '@shared/entities/configs/job.config';

/** Read-only job run monitor - admin only, same gating as the schedules that create these jobs. */
function getConfig(): BaseEntityModuleOptions {
  return {
    ...jobConfig,
    crudAuth: CrudAuthAdminFilter,
  };
}

export default getConfig();
