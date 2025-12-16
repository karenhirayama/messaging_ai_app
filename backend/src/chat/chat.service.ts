import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

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
      `SELECT user_id, friend_id FROM friendships 
       WHERE id = $1 AND status = 'accepted'`,
      [friendshipId],
    );

    if (friendshipResult.rows.length === 0) {
      throw new BadRequestException('No accepted friendship found');
    }

    const conversationResult = await this.pgService.query(
      `INSERT INTO conversations (friendship_id) VALUES ($1) RETURNING *`,
      [friendshipId],
    );

    const conversation = conversationResult.rows[0];

    const { user_id, friend_id } = friendshipResult.rows[0];
    
    await this.pgService.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) 
       VALUES ($1, $2), ($1, $3)`,
      [conversation.id, user_id, friend_id]
    );

    return conversation;
  }

  async createAiConversation(userId: string, aiUserId: string) {
    const convResult = await this.pgService.query(
      `INSERT INTO conversations (is_ai_chat) VALUES (TRUE) RETURNING id`,
    );
    const conversationId = convResult.rows[0].id;

    await this.pgService.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) 
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, userId, aiUserId],
    );

    return { id: conversationId };
  }

  async getConversationHistory(conversationId: string, userId: string) {
    const validationResult = await this.pgService.query(
      `SELECT 1 FROM conversation_participants 
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId],
    );

    if (validationResult.rows.length === 0) {
      throw new BadRequestException('Conversation not found or access denied');
    }

    const messagesResult = await this.pgService.query(
      `SELECT 
         m.id,
         m.sender_id,
         m.content,
         m.is_ai_response,
         m.created_at,
         u.nickname AS sender_nickname
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId],
    );

    return messagesResult.rows;
  }

  async getConversationsForUser(userId: string) {
    const query = `
      SELECT DISTINCT ON (c.id)
        c.id AS conversation_id,
        c.is_ai_chat,
        CASE
          WHEN c.is_ai_chat THEN 'Lari'
          ELSE (
            SELECT u2.nickname 
            FROM conversation_participants cp2
            JOIN users u2 ON u2.id = cp2.user_id
            WHERE cp2.conversation_id = c.id 
              AND cp2.user_id != $1
            LIMIT 1
          )
        END AS participant_nickname,
        (
          SELECT u2.id
          FROM conversation_participants cp2
          JOIN users u2 ON u2.id = cp2.user_id
          WHERE cp2.conversation_id = c.id 
            AND cp2.user_id != $1
          LIMIT 1
        ) AS participant_id,
        (
          SELECT m.content
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_content,
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_time
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.id, last_message_time DESC NULLS LAST`;

    const result = await this.pgService.query(query, [userId]);
    return result.rows;
  }
}
