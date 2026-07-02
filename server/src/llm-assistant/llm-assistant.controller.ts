import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { LlmAssistantService } from './llm-assistant.service';

@Controller('llm-assistant')
export class LlmAssistantController {
  constructor(private readonly llmAssistantService: LlmAssistantService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ask')
  async ask(@Body() body: { question: string }) {
    return this.llmAssistantService.ask(body?.question);
  }
}
