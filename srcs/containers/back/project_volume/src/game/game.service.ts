import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma.service';
import type { Games } from '../generated/prisma/client';

// A game as it's safe to hand to a client: the two words are the whole secret
// of the round, so they stay null until the game is over.
export type GameView = Omit<Games, 'civilianWord' | 'undercoverWord'> & {
  civilianWord: string | null;
  undercoverWord: string | null;
};

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  private toGameView(game: Games): GameView {
    return game.status === 'finished'
      ? game
      : { ...game, civilianWord: null, undercoverWord: null };
  }

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

  async findAll(): Promise<GameView[]> {
    const games = await this.prisma.games.findMany();
    return games.map((game) => this.toGameView(game));
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

  async findOne(id: number): Promise<GameView> {
    const game = await this.prisma.games.findUnique({
      where: { id: id },
    });
    if (!game) throw new NotFoundException(`Game ${id} not found`);
    return this.toGameView(game);
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
