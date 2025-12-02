import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

import { AuthService } from './auth.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
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
      throw new ConflictException('User with this nickname already exists');
    }

    const newUser = await this.usersService.createUser(createUserDto);

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
