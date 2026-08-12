import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { WordPairModule } from './word_pair/word_pair.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PlayerModule, RoomModule, AuthModule, WordPairModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
