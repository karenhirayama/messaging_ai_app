import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AiService } from './ai.service';

import type { AiPromptDto } from './dto/ai-prompt.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('prompt')
  async generateAiResponse(
    @Body() body: AiPromptDto,
    @Request() req: ExpressRequest & { user?: any },
  ) {
    if (!body.prompt || !body.conversationId) {
      throw new HttpException(
        'Prompt and conversationId are required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = req.user.userId;
    const { conversationId, prompt } = body;

    if (!prompt.startsWith('@Lari')) {
      throw new HttpException(
        'AI messages must start with "@Lari".',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const aiResponse = await this.aiService.generateAiResponse(
        userId,
        conversationId,
        prompt,
      );
      return { response: aiResponse };
    } catch (error) {
      throw new HttpException(
        'Failed to get AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
