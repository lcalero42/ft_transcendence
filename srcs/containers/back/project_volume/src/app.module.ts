import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { Request } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { GameModule } from './game/game.module';
import { WordPairModule } from './word_pair/word_pair.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FriendshipModule } from './friendship/friendship.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { isInternalRequest } from './common/internal-api-key.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
      skipIf: (context) =>
        isInternalRequest(context.switchToHttp().getRequest<Request>()),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PlayerModule,
    RoomModule,
    AuthModule,
    WordPairModule,
    GameModule,
    FriendshipModule,
    BootstrapModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
