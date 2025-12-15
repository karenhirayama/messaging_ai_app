import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AiService } from 'src/ai/ai.service';

import { WsJwtGuard } from './ws-jwt.guard';
import { ChatService } from './chat.service';

interface CustomSocket extends Socket {
  user: {
    id: string;
    nickname: string;
    email: string;
  };
}

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>();
  private socketUserMap = new Map<string, string>();
  private userConversations = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private aiService: AiService,
  ) {}

  handleConnection(client: CustomSocket) {
    const token = client.handshake.auth.token;

    if (!token) {
      console.error('No token provided in handshake.auth');
      client.disconnect();
      return;
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.user = {
        id: payload.sub,
        email: payload.email,
        nickname: payload.nickname,
      };
    } catch (err) {
      console.error('Unauthorized: Invalid or expired token.', err);
      client.disconnect();
      return;
    }

    const userId = client?.user.id;

    this.userSocketMap.set(userId, client.id);
    this.socketUserMap.set(client.id, userId);
    this.userConversations.set(userId, new Set());

    client.emit('connected', { userId });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      this.userConversations.delete(userId);
    }
  }

  leaveConversation(userId: string, conversationId: string) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`conversation:${conversationId}`);

        const userConvs = this.userConversations.get(userId);
        if (userConvs) {
          userConvs.delete(conversationId);
        }
      }
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: CustomSocket,
  ): Promise<void> {
    const userId = client.user.id;
    const { conversationId } = data;

    if (!userId || !conversationId) {
      client.emit('error', { message: 'Missing userId or conversationId' });
      return;
    }

    client.join(`conversation:${conversationId}`);

    const userConvs = this.userConversations.get(userId);
    if (userConvs) {
      userConvs.add(conversationId);
    } else {
      this.userConversations.set(userId, new Set([conversationId]));
    }

    console.log(`User ${userId} joined conversation: ${conversationId}`);

    client.emit('joinedConversation', { conversationId });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      receiverId: string;
      isAiResponse?: boolean;
    },
    @ConnectedSocket() client: CustomSocket,
  ): Promise<void> {
    const senderId = client.user.id;
    const { conversationId, content, receiverId, isAiResponse = false } = data;

    if (!senderId || !conversationId || !content || !receiverId) {
      client.emit('error', { message: 'Missing required fields' });
      return;
    }

    try {
      const message = await this.chatService.saveMessage(
        senderId,
        conversationId,
        content,
        isAiResponse,
        receiverId,
      );

      const messageWithSender = {
        ...message,
        senderId,
        isAiResponse,
      };

      this.server
        .to(`conversation:${conversationId}`)
        .emit('receiveMessage', messageWithSender);

      client.emit('messageSent', messageWithSender);

      if (content.trim().startsWith('@Lari')) {
        const aiResponseContent = await this.aiService.generateAiResponse(
          senderId,
          conversationId,
          content,
        );

        const aiMessage = await this.chatService.saveMessage(
          receiverId,
          conversationId,
          aiResponseContent,
          true,
          senderId,
        );

        const aiMessageForBroadcast = {
          ...aiMessage,
          sender_id: receiverId,
          isAiResponse: true,
        };

        this.server
          .to(`conversation:${conversationId}`)
          .emit('receiveMessage', aiMessageForBroadcast);
      }
    } catch (error) {
      console.error('Error saving/broadcasting message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  broadcastToConversation(conversationId: string, message: any) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('receiveMessage', message);
  }

  getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }
}
