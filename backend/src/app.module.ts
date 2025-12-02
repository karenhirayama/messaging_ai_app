import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { AiService } from './ai/ai.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipModule } from './friendship/friendship.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChatModule,
    AiModule,
    FriendshipModule,
  ],
  controllers: [AppController, FriendshipController],
  providers: [AppService, AiService, FriendshipService],
})
export class AppModule {}
