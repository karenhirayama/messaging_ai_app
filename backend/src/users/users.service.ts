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
}
