import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from '../prisma.service';
import type { Games } from '../generated/prisma/client';
import type { Player } from '../generated/prisma/client';
import type { Role } from '../generated/prisma/client';
import { apiError } from '../common/api-error';

const gameNotFound = (id: number) =>
  new NotFoundException(apiError('GAME_NOT_FOUND', `Game ${id} not found`));

export type GameView = Omit<Games, 'civilianWord' | 'undercoverWord'> & {
  civilianWord: string | null;
  undercoverWord: string | null;
};

export type GamePlayerView = Pick<Player, 'id' | 'name' | 'avatarUrl'> & {
  role: Role | null;
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
        status: 'playing',
        gamePlayers: { create: createGameDto.players },
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
    if (!game) throw gameNotFound(id);
    return this.toGameView(game);
  }

  async getPlayersByGame(gameId: number): Promise<GamePlayerView[]> {
    const game = await this.prisma.games.findUnique({
      where: { id: gameId },
      select: {
        status: true,
        gamePlayers: {
          select: {
            role: true,
            playerIdRel: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!game) throw gameNotFound(gameId);

    const revealRoles = game.status === 'finished';
    return game.gamePlayers.map((gp) => ({
      ...gp.playerIdRel,
      role: revealRoles ? gp.role : null,
    }));
  }

  async getMyWord(gameId: number, playerId: number): Promise<{ word: string }> {
    const game = await this.prisma.games.findUnique({
      where: { id: gameId },
      select: {
        status: true,
        civilianWord: true,
        undercoverWord: true,
        gamePlayers: {
          where: { playerId },
          select: { role: true },
        },
      },
    });
    if (!game) throw gameNotFound(gameId);

    const myGamePlayer = game.gamePlayers[0];
    if (!myGamePlayer) {
      throw new ForbiddenException(
        apiError('NOT_GAME_PLAYER', 'You are not a player in this game'),
      );
    }
    if (game.status === 'waiting') {
      throw new ForbiddenException(
        apiError(
          'WORD_NOT_AVAILABLE',
          'Word is not available until the game starts',
        ),
      );
    }

    const word =
      myGamePlayer.role === 'civilian'
        ? game.civilianWord
        : game.undercoverWord;
    return { word };
  }

  async eliminate(id: number, playerId: number) {
    const eliminated = await this.prisma.game_Players.updateMany({
      where: { gameId: id, playerId: playerId, eliminatedAt: null },
      data: {
        eliminatedAt: new Date(),
      },
    });
    return eliminated;
  }

  async finish(id: number, victory: Role) {
    const finishGame = await this.prisma.games.update({
      where: { id: id, finishedAt: null },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        victory: victory,
      },
    });
    return finishGame;
  }

  async remove(id: number) {
    const deleteGame = await this.prisma.games.update({
      where: { id: id, finishedAt: null },
      data: {
        status: 'aborted',
        finishedAt: new Date(),
      },
    });
    return deleteGame;
  }
}
