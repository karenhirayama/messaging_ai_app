import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

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
})
export class ChatGateway implements OnGatewayConnection, OnGatewayConnection {
  private users: Map<string, string> = new Map();

  constructor(private chatService: ChatService) {}

  handleConnection(client: CustomSocket) {
    const userId = client.user.id;
    this.users.set(userId, client.id);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = Array.from(this.users.entries()).find(
      ([key, value]) => value === client.id,
    )?.[0];
    if (userId) {
      this.users.delete(userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { recipientId: string; content: string },
    @ConnectedSocket() client: CustomSocket,
  ): Promise<void> {
    const senderId = client.user.id;

    if (!senderId) {
      console.error('Sender not registered');
      return;
    }

    const { recipientId, content } = data;

    const message = await this.chatService.saveMessage(senderId, recipientId, content);

    const recipientSocketId = this.users.get(recipientId);

    if (recipientSocketId) {
      client.to(recipientSocketId).emit('receiveMessage', message);
      client.emit('messageSent', message);
    } else {
      console.error('Recipient not connected');
    }
  }
}
