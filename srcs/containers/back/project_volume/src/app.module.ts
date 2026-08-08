import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PlayerModule, RoomModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
