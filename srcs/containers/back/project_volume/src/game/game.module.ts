import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GameController],
  providers: [PrismaService, GameService],
})
export class GameModule {}
