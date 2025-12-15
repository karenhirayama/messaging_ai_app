import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PgService } from 'src/database/database.service';

import { FriendshipStatus } from './friendship.constants';

@Injectable()
export class FriendshipService {
  constructor(private readonly pgService: PgService) {}

  private async findUserByEmail(email: string) {
    const result = await this.pgService.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    return result.rows[0];
  }

  async sendFriendRequest(senderId: string, receiverEmail: string) {
    const receiver = await this.findUserByEmail(receiverEmail);
    if (!receiver) {
      throw new NotFoundException(
        `User with email ${receiverEmail} not found`,
      );
    }

    if (senderId === receiver.id) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const existingRequest = await this.pgService.query(
      'SELECT id FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [senderId, receiver.id],
    );

    if (existingRequest.rows.length > 0) {
      throw new BadRequestException(
        'Friend request already exists or you are already friends',
      );
    }

    const result = await this.pgService.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3)',
      [senderId, receiver.id, FriendshipStatus.PENDING],
    );

    return result.rows[0];
  }

  async acceptFriendRequest(userId: string, friendshipId: string) {
    const client = await this.pgService.pool.connect();
    try {
      await client.query('BEGIN');


      const updateResult = await client.query(
        `UPDATE friendships 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 AND friend_id = $3 AND status = $4
             RETURNING *`,
        [
          FriendshipStatus.ACCEPTED,
          friendshipId,
          userId,
          FriendshipStatus.PENDING,
        ],
      );

      if (updateResult.rows.length === 0) {
        throw new BadRequestException(
          'Friend request not found, already accepted, or you are not the recipient.',
        );
      }

      await client.query('UPDATE friendships SET status = $1 WHERE id = $2', [
        FriendshipStatus.ACCEPTED,
        friendshipId,
      ]);

      await client.query(
        'INSERT INTO conversations (friendship_id) VALUES ($1)', [friendshipId],
      )

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getFriendsList(userId: string) {
    const result = await this.pgService.query(
        `SELECT
        f.id AS friendship_id,
        CASE
            WHEN f.user_id = $1 THEN u2.nickname
            ELSE u1.nickname
        END AS nickname,
        CASE
            WHEN f.user_id = $1 THEN u2.id
            ELSE u1.id
        END AS friend_id,
        c.id AS conversation_id
        FROM friendships f
        JOIN users u1 ON u1.id = f.user_id
        JOIN users u2 ON u2.id = f.friend_id
        LEFT JOIN conversations c ON c.friendship_id = f.id
        WHERE f.status = $2 AND (f.user_id = $1 OR f.friend_id = $1)`,
        [userId, FriendshipStatus.ACCEPTED],
    )

    return result.rows;
  }

async getRequestsReceived(userId: string) {
    const result = await this.pgService.query(
      `SELECT
        f.id AS friendship_id,
        u1.nickname AS nickname,
        u1.email AS email
      FROM friendships f
      JOIN users u1 ON u1.id = f.user_id
      WHERE f.status = $2 AND f.friend_id = $1 -- Key change: f.friend_id must be the current user ($1)
      `,
      [userId, FriendshipStatus.PENDING],
    );

    return result.rows;
  }

  async getRequestsSent(userId: string) {
    const result = await this.pgService.query(
      `SELECT
        f.id AS friendship_id,
        u2.nickname AS nickname,
        u2.email AS email
      FROM friendships f
      JOIN users u2 ON u2.id = f.friend_id
      WHERE f.status = $2 AND f.user_id = $1 -- Key condition: f.user_id must be the current user ($1)
      `,
      [userId, FriendshipStatus.PENDING],
    );

    return result.rows;
  }
}
