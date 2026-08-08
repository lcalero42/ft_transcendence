import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { WordPairModule } from './word_pair/word_pair.module';

@Module({
  imports: [PlayerModule, RoomModule, WordPairModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
