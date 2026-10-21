import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { GuestCleanupService } from './guest-cleanup.service';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, GuestCleanupService],
})
export class PlayerModule {}
