import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

import { AuthService } from './auth.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChatService } from 'src/chat/chat.service';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private chatService: ChatService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.email) {
      throw new ConflictException('Missing email field');
    }

    if (!createUserDto.nickname) {
      throw new ConflictException('Missing username field');
    }

    if (!createUserDto.password) {
      throw new ConflictException('Missing password field');
    }

    const existingEmail = await this.usersService.findOneByEmail(
      createUserDto.email,
    );

    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingNickname = await this.usersService.findOneByNickname(
      createUserDto.nickname,
    );

    if (existingNickname) {
      throw new ConflictException('User with this username already exists');
    }

    const newUser = await this.usersService.createUser(createUserDto);

    const lariUserId = this.configService.get('LARI_USER_ID');

    if (lariUserId) {
      const conversation = await this.chatService.createAiConversation(
        newUser.id,
        lariUserId,
      );

      await this.chatService.saveMessage(
        lariUserId,
        conversation.id,
        `Hello, ${newUser.nickname}! Welcome to the app. I'm Lari, your personal AI assistant. How can I help you get started?`,
        true,
        newUser.id,
      );
    }

    delete newUser.password;

    return { message: 'User created successfully', user: newUser };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: ExpressRequest & { user?: any }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest & { user?: any }) {
    return {
      message: 'This is a secured resource!',
      user: req.user,
    };
  }
}
