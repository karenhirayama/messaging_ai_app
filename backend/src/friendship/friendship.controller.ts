import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';

import { FriendshipService } from './friendship.service';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('friendship')
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) {}

    @Post('request')
    async sendFriendRequest(@Request() req, @Body('nickname') receiveNickname: string) {
        console.log('req.user', req.user)
        const senderId = req.user.userId
        return this.friendshipService.sendFriendRequest(senderId, receiveNickname);
    }

    @Post('accept/:id')
    async acceptFriendRequest(@Request() req, @Param('id') friendshipId: string) {
        const userId = req.user.userId;
        return this.friendshipService.acceptFriendRequest(userId, friendshipId);
    }

    @Get('list')
    async getFriendsList(@Request() req) {
        const userId = req.user.userId;
        return this.friendshipService.getFriendsList(userId);
    }
}
