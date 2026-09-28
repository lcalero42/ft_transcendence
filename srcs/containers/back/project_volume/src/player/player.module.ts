import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PrismaService } from '../prisma.service';
import { GuestCleanupService } from './guest-cleanup.service';

@Module({
  controllers: [PlayerController],
  providers: [PrismaService, PlayerService, GuestCleanupService],
})
export class PlayerModule {}
