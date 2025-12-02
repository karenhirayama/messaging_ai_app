import { BadRequestException, Injectable } from '@nestjs/common';

import { PgService } from 'src/database/database.service';

@Injectable()
export class ChatService {
  constructor(private pgService: PgService) {}

  async saveMessage(
    senderId: string,
    conversationId: string,
    content: string,
    isAiResponse: boolean = false,
    receiverId?: string,
  ): Promise<any> {
    const query =
      'INSERT INTO messages (conversation_id, sender_id, receiver_id, content, is_ai_response) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await this.pgService.query(query, [
      conversationId,
      senderId,
      receiverId,
      content,
      isAiResponse,
    ]);
    return result.rows[0];
  }

  async createConversation(friendshipId: string) {
    const friendshipResult = await this.pgService.query(
      `SELECT id FROM friendships 
            WHERE id = $1
              AND status = 'accepted'`,
      [friendshipId],
    );

    if (friendshipResult.rows.length === 0) {
      throw new BadRequestException(
        'No accepted friendship found between the users',
      );
    }

    const conversationResult = await this.pgService.query(
      `INSERT INTO conversations (friendship_id) VALUES ($1) RETURNING *`,
      [friendshipId],
    );

    return conversationResult.rows[0];
  }

  async getConversationHistory(conversationId: string, userId: string) {
    const validationResult = await this.pgService.query(
      `SELECT c.id
            FROM conversations c
            JOIN friendships f ON c.friendship_id = f.id
            WHERE c.id = $1 AND (f.user_id = $2 OR f.friend_id = $2)`,
      [conversationId, userId],
    );

    if (validationResult.rows.length === 0) {
      throw new BadRequestException('Conversation not found or access denied');
    }

    const messagesResult = await this.pgService.query(
      `SELECT m.id, m.sender_id, m.content, m.is_ai_response, m.created_at, u.nickname AS sender_nickname
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC`,
      [conversationId],
    );

    return messagesResult.rows;
  }
}
