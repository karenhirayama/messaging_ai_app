import { forwardRef, Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule, forwardRef(() => AiModule)],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
