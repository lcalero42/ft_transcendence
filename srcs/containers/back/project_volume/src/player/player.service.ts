import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class PlayerService {
  async create(createPlayerDto: CreatePlayerDto) {
    const createPlayer = await prisma.player.create({
      data: {
        email: createPlayerDto.email,
        name: createPlayerDto.name,
      },
    });
    return createPlayer;
  }

  async findAll() {
    const players = await prisma.player.findMany();
    return players;
  }

  async findOne(id: number) {
    const player = await prisma.player.findUnique({
      where: { id: id },
    });
    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const updatePlayer = await prisma.player.update({
      where: { id: id },
      data: {
        email: updatePlayerDto.email,
        name: updatePlayerDto.name,
      },
    });
    return updatePlayer;
  }

  async remove(id: number) {
    const deleteUser = await prisma.player.update({
      where: { id: id },
      data: {
        deleted_at: new Date(),
      },
    });
    return deleteUser;
  }

  async countGamesPlayed(id: number) {
    const gamesPlayed = await prisma.game_Players.count({
      where: {
        player_id: id,
        game_id_rel: { status: 'finished' },
      },
    });
    return { playerId: id, gamesPlayed };
  }

  async countVictory(id: number) {
    const playerVictories = await prisma.game_Players.findMany({
      where: {
        player_id: id,
        game_id_rel: {
          status: 'finished',
        },
      },
      select: {
        role: true,
        game_id_rel: {
          select: {
            victory: true,
          },
        },
      },
    });

    let victoriesCount = 0;
    for (const pv of playerVictories) {
      if (pv.role === pv.game_id_rel.victory) {
        victoriesCount++;
      }
    }

    return { playerId: id, victoriesCount };
  }
}
