import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface SaveMessageDto {
  conversationId: string;
  content: string;
  isAiResponse: boolean;
  receiverId: string;
}

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversation')
  async createConversation(@Body('friendshipId') friendshipId: string) {
    const conversation = await this.chatService.createConversation(friendshipId);
    return { conversation };
  }

  @Post('message')
  async saveMessage(
    @Body() body: SaveMessageDto,
    @Request() req: ExpressRequest & { user?: any },
  ) {
    const senderId = req.user.userId;
    const { conversationId, content, isAiResponse, receiverId } = body;

    const message = await this.chatService.saveMessage(
      senderId,
      conversationId,
      content,
      isAiResponse,
      receiverId,
    );
    return { message };
  }

  @Get('history/:conversationId')
  async getConversationHistory(
    @Param('conversationId') conversationId: string,
    @Request() req: ExpressRequest & { user?: any },
  ) {
    const userId = req.user.userId;

    const history = await this.chatService.getConversationHistory(
      conversationId,
      userId,
    );
    return { history };
  }
}
