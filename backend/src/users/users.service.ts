import { Injectable } from '@nestjs/common';
import bcrypt from 'node_modules/bcryptjs';

import { PgService } from 'src/database/database.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    private readonly HASH_SALT = 13

    constructor(private pgService: PgService) {}

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.HASH_SALT);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async findOneByEmail(email: string): Promise<any | undefined> {
        const query = 'SELECT id, email, password, nickname FROM users WHERE email = $1';
        const result = await this.pgService.query(query, [email]);
        return result.rows[0];
    }

    async findOneByNickname(nickname: string): Promise<any | undefined> {
        const query = 'SELECT id, email, password, nickname FROM users WHERE nickname = $1';
        const result = await this.pgService.query(query, [nickname]);

        return result.rows[0];
    }

    async createUser(data: CreateUserDto): Promise<any> {
        const { email, password, nickname } = data;

        const hashedPassword = await this.hashPassword(password);

        const query = 'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname';
        const result = await this.pgService.query(query, [email, hashedPassword, nickname]);
        
        return result.rows[0];
    }

    async updateProfile(newNickname: string, userId: string, oldPassword: string, newPassword: string): Promise<any> {
        const user = await this.findOneByEmail(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await this.comparePassword(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const hashedNewPassword = await this.hashPassword(newPassword);

        const query = 'UPDATE users SET nickname = $1, password = $2 WHERE id = $3 RETURNING id, email, nickname';
        const result = await this.pgService.query(query, [newNickname, hashedNewPassword, userId]);

        return result.rows[0];
    }

    async deleteUser(userId: string): Promise<void> {
        const query = 'DELETE FROM users WHERE id = $1';
        await this.pgService.query(query, [userId]);
    }
}
