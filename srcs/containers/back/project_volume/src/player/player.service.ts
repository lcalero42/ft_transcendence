import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async create(createPlayerDto: CreatePlayerDto) {
    const createPlayer = await this.prisma.player.create({
      data: {
        email: createPlayerDto.email,
        name: createPlayerDto.name,
      },
    });
    return createPlayer;
  }

  async findAll() {
    const players = await this.prisma.player.findMany();
    return players;
  }

  async findOne(id: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: id },
    });
    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const updatePlayer = await this.prisma.player.update({
      where: { id: id },
      data: {
        email: updatePlayerDto.email,
        name: updatePlayerDto.name,
      },
    });
    return updatePlayer;
  }

  async remove(id: number) {
    const deleteUser = await this.prisma.player.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
    return deleteUser;
  }

  async countGamesPlayed(id: number) {
    const gamesPlayed = await this.prisma.game_Players.count({
      where: {
        playerId: id,
        gameIdRel: { status: 'finished' },
      },
    });
    return { playerId: id, gamesPlayed };
  }

  async countVictory(id: number) {
    const playerVictories = await this.prisma.game_Players.findMany({
      where: {
        playerId: id,
        gameIdRel: {
          status: 'finished',
        },
      },
      select: {
        role: true,
        gameIdRel: {
          select: {
            victory: true,
          },
        },
      },
    });
    let victoriesCount = 0;
    for (const pv of playerVictories) {
      if (pv.role === pv.gameIdRel.victory) {
        victoriesCount++;
      }
    }
    return { playerId: id, victoriesCount };
  }
}
