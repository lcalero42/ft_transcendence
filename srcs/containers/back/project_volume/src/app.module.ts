import { Module } from '@nestjs/common';
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
import { PrismaModule } from './prisma.module';
import { ColyseusModule } from './colyseus/colyseus.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
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
    ColyseusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
