import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { GradeName } from 'src/db/entities/GradeName.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: GradeName,
    query: {
      join: {
        klassType: { eager: false },
      },
    },
  };
}

export default getConfig();
