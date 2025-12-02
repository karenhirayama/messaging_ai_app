import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiService } from './ai.service';
import { AiController } from './ai.controller';

import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ConfigModule, ChatModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
