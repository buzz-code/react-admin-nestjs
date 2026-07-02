import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

const SYSTEM_PROMPT = `את/ה עוזר/ת תמיכה למערכת "יומן" לניהול נוכחות בבתי ספר.
ענה/י אך ורק על סמך התיעוד המצורף למטה. אם התשובה לא מופיעה בתיעוד, אמור/י זאת בבירור והמלץ/י לפנות לתמיכה - אל תנחש/י.
ענה/י בעברית, בקצרה ובבהירות.

תיעוד:
{wiki}`;

@Injectable()
export class LlmAssistantService {
  private readonly logger = new Logger(LlmAssistantService.name);
  private readonly wikiDir = path.join(process.cwd(), 'llm-wiki');

  constructor(private readonly httpService: HttpService) {}

  async ask(question: string): Promise<{ answer: string }> {
    if (!question?.trim()) {
      throw new BadRequestException('question is required');
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('LLM assistant is not configured');
    }

    const systemPrompt = SYSTEM_PROMPT.replace('{wiki}', this.loadWiki());

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: question }],
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
          },
        ),
      );
      return { answer: response.data.content[0].text };
    } catch (error) {
      this.logger.error(`LLM assistant request failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get an answer from the assistant');
    }
  }

  private loadWiki(): string {
    if (!fs.existsSync(this.wikiDir)) {
      return '';
    }
    return this.collectMarkdownFiles(this.wikiDir)
      .map((file) => fs.readFileSync(file, 'utf-8').replace(/^---[\s\S]*?---\n/, ''))
      .join('\n\n---\n\n');
  }

  private collectMarkdownFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return this.collectMarkdownFiles(fullPath);
      }
      return entry.name.endsWith('.md') ? [fullPath] : [];
    });
  }
}
