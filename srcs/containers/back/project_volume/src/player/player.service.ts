import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PrismaService } from '../prisma.service';
import { AVATAR_DIR, AVATAR_URL_PREFIX } from './avatar.constants';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    const players = await this.prisma.player.findMany({
      where: { deletedAt: null },
    });
    return players;
  }

  async countPlayerActiv() {
    const i = await this.prisma.player.count({
      where: { deletedAt: null },
    });
    return i;
  }

  async findOne(id: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: id, deletedAt: null },
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async getGamesList(id: number) {
    const gamePlayers = await this.prisma.game_Players.findMany({
      where: { playerId: id },
      include: {
        gameIdRel: {
          include: {
            roomIdRel: true,
            gamePlayers: true,
          },
        },
      },
      orderBy: {
        gameIdRel: { createdAt: 'desc' },
      },
    });
    return gamePlayers.map((gp) => ({
      id: gp.gameIdRel.id,
      name: gp.gameIdRel.roomIdRel.name,
      nbPlayers: gp.gameIdRel.gamePlayers.length,
      date: gp.gameIdRel.createdAt,
      victory: gp.role === gp.gameIdRel.victory,
    }));
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const updatePlayer = await this.prisma.player.update({
      where: { id: id, deletedAt: null },
      data: {
        email: updatePlayerDto.email,
        name: updatePlayerDto.name,
        aboutMe: updatePlayerDto.aboutMe,
        avatarUrl: updatePlayerDto.avatarUrl,
      },
    });
    return updatePlayer;
  }

  async updateAvatar(id: number, avatarUrl: string) {
    const current = await this.prisma.player.findUnique({
      where: { id, deletedAt: null },
      select: { avatarUrl: true },
    });

    const updatedPlayer = await this.prisma.player.update({
      where: { id, deletedAt: null },
      data: { avatarUrl },
    });

    if (current?.avatarUrl?.startsWith(AVATAR_URL_PREFIX)) {
      await this.deleteAvatarFile(current.avatarUrl);
    }
    return updatedPlayer;
  }

  private async deleteAvatarFile(avatarUrl: string) {
    const filename = basename(avatarUrl);
    try {
      await unlink(join(AVATAR_DIR, filename));
    } catch (error) {
      this.logger.warn(
        `could not delete old avatar ${filename}: ${String(error)}`,
      );
    }
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

  async getWinrate(id: number) {
    const victories = (await this.countVictory(id)).victoriesCount;
    const gamesPlayed = (await this.countGamesPlayed(id)).gamesPlayed;
    if (gamesPlayed === 0) return { playerId: id, winrate: 0 };
    else return { playerId: id, winrate: (victories / gamesPlayed) * 100 };
  }

  async getAboutMe(id: number) {
    const player = await this.prisma.player.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });
    if (!player) throw new NotFoundException('Player not found');
    const aboutMe = await this.prisma.player.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      select: {
        aboutMe: true,
      },
    });
    return { playerId: id, ...aboutMe };
  }
}
