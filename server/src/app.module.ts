import { Module } from '@nestjs/common';
import { BaseNraAppModule } from '@shared/app/base-app.module';
import { EntitiesModule } from './entities.module';
import { UserInitModule } from './user-init.module';
import { YemotHandlerService } from './yemot-handler.service';
import { LlmAssistantModule } from './llm-assistant/llm-assistant.module';

@Module({
  imports: [
    BaseNraAppModule.forRoot({
      entitiesModule: EntitiesModule,
      yemotHandlerService: YemotHandlerService,
      userInitModule: UserInitModule,
      throttlerLimit: 200,
    }),
    LlmAssistantModule,
  ],
})
export class AppModule {}
