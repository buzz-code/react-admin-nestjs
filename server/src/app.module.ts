import { BaseNraAppModule } from '@shared/app/base-app.module';
import { EntitiesModule } from './entities.module';
import { UserInitModule } from './user-init.module';
import { YemotHandlerService } from './yemot-handler.service';

export const AppModule = BaseNraAppModule.forRoot({
  entitiesModule: EntitiesModule,
  yemotHandlerService: YemotHandlerService,
  userInitModule: UserInitModule,
  throttlerLimit: 200,
});
