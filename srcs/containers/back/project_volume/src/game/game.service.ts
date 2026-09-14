import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma.service';

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
    const games = await this.prisma.games.findMany();
    return games;
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
      where: { id: id, finishedAt: null },
    });
    if (!game) throw new NotFoundException('Game does not exist');
    return game;
  }

  async getPlayersByGame(gameId: number) {
    const existingGame = await this.prisma.games.findFirst({
      where: { id: gameId, finishedAt: null },
    });
    if (!existingGame) throw new NotFoundException('Game does not exist');
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
      where: { id: id, finishedAt: null },
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
      where: { id: id, finishedAt: null },
      data: {
        finishedAt: new Date(),
      },
    });
    return deleteGame;
  }
}
