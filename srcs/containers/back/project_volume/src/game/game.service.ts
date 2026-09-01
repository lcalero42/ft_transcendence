import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    const createGame = await this.prisma.games.create({
      data: {
        civilianWord: createGameDto.civilianWord,
        undercoverWord: createGameDto.undercoverWord,
        roomId: createGameDto.roomId,
      },
    });
    return createGame;
  }

  async findAll() {
    const [revealed, hidden] = await this.prisma.$transaction(
      [
        this.prisma.games.findMany({ where: { status: 'finished' } }),
        this.prisma.games.findMany({
          where: { status: { not: 'finished' } },
          omit: { civilianWord: true, undercoverWord: true },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    return [...revealed, ...hidden];
  }

  async countGames() {
    const i = await this.prisma.games.count({
      where: {
        finishedAt: {
          not: null,
        },
      },
    });
    return i;
  }

  async findOne(id: number) {
    const game = await this.prisma.games.findUnique({
      where: { id: id },
    });
    return game;
  }

  async getPlayersByGame(gameId: number) {
    const gamePlayers = await this.prisma.game_Players.findMany({
      where: { gameId },
      include: {
        playerIdRel: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
    return gamePlayers.map((gp) => ({
      ...gp.playerIdRel,
      role: gp.role,
    }));
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const updateGame = await this.prisma.games.update({
      where: { id: id },
      data: {
        civilianWord: updateGameDto.civilianWord,
        undercoverWord: updateGameDto.undercoverWord,
        roomId: updateGameDto.roomId,
      },
    });
    return updateGame;
  }

  async remove(id: number) {
    const deleteGame = await this.prisma.games.update({
      where: { id: id },
      data: {
        finishedAt: new Date(),
      },
    });
    return deleteGame;
  }
}
