import { BaseNraAppModule } from '@shared/app/base-app.module';
import { EntitiesModule } from './entities.module';
import { UserInitModule } from './user-init.module';
import { YemotHandlerService } from './yemot-handler.service';
import { AttendanceCleanupHandler } from './jobs/attendance-cleanup.handler';

export const AppModule = BaseNraAppModule.forRoot({
  entitiesModule: EntitiesModule,
  yemotHandlerService: YemotHandlerService,
  userInitModule: UserInitModule,
  throttlerLimit: 200,
  jobHandlers: [AttendanceCleanupHandler],
});
