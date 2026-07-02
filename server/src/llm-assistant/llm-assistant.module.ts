import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LlmAssistantController } from './llm-assistant.controller';
import { LlmAssistantService } from './llm-assistant.service';

@Module({
  imports: [HttpModule],
  controllers: [LlmAssistantController],
  providers: [LlmAssistantService],
})
export class LlmAssistantModule {}
