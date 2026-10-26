import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, GameStatus, Role } from '../generated/prisma/client';

type GameForPlayers = Awaited<ReturnType<PrismaClient['games']['findUnique']>>;

describe('GameService', () => {
  let service: GameService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a playing game with its players', async () => {
      const createDto = {
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        roomId: 7,
        players: [
          { playerId: 1, role: Role.civilian },
          { playerId: 2, role: Role.undercover },
        ],
      };
      const result = {
        id: 5,
        status: GameStatus.playing,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 7,
      };
      prismaMock.games.create.mockResolvedValue(result);

      expect(await service.create(createDto)).toBe(result);
      expect(prismaMock.games.create).toHaveBeenCalledWith({
        data: {
          civilianWord: createDto.civilianWord,
          undercoverWord: createDto.undercoverWord,
          roomId: createDto.roomId,
          status: 'playing',
          gamePlayers: { create: createDto.players },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should hide secret words for a game that is not finished', async () => {
      const waitingGame = {
        id: 5,
        status: GameStatus.waiting,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 7,
      };
      prismaMock.games.findMany.mockResolvedValue([waitingGame]);

      expect(await service.findAll()).toEqual([
        { ...waitingGame, civilianWord: null, undercoverWord: null },
      ]);
      expect(prismaMock.games.findMany).toHaveBeenCalledWith();
    });

    it('should reveal secret words for a finished game', async () => {
      const finishedGame = {
        id: 6,
        status: GameStatus.finished,
        civilianWord: 'dog',
        undercoverWord: 'wolf',
        createdAt: new Date(),
        finishedAt: new Date(),
        victory: Role.undercover,
        roomId: 8,
      };
      prismaMock.games.findMany.mockResolvedValue([finishedGame]);

      expect(await service.findAll()).toEqual([finishedGame]);
    });
  });

  describe('countGames', () => {
    it('should count the finished games and return it', async () => {
      prismaMock.games.count.mockResolvedValue(3);

      expect(await service.countGames()).toBe(3);
      expect(prismaMock.games.count).toHaveBeenCalledWith({
        where: { finishedAt: { not: null } },
      });
    });

    it('should return zero when no game has been finished', async () => {
      prismaMock.games.count.mockResolvedValue(0);

      expect(await service.countGames()).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should reveal secret words for a finished game', async () => {
      const result = {
        id: 5,
        status: GameStatus.finished,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: new Date(),
        victory: Role.civilian,
        roomId: 7,
      };
      prismaMock.games.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.games.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it('should hide secret words for a game that is not finished', async () => {
      const result = {
        id: 5,
        status: GameStatus.playing,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 7,
      };
      prismaMock.games.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toEqual({
        ...result,
        civilianWord: null,
        undercoverWord: null,
      });
    });

    it('should throw NotFoundException when the game does not exist', async () => {
      prismaMock.games.findUnique.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlayersByGame', () => {
    it('should reveal roles when the game is finished', async () => {
      const game = {
        status: GameStatus.finished,
        gamePlayers: [
          {
            role: Role.civilian,
            playerIdRel: { id: 1, name: 'Alice', avatarUrl: null },
          },
          {
            role: Role.undercover,
            playerIdRel: {
              id: 2,
              name: 'Bob',
              avatarUrl: '/uploads/avatars/bob.png',
            },
          },
        ],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      const res = await service.getPlayersByGame(5);

      expect(res).toEqual([
        { id: 1, name: 'Alice', avatarUrl: null, role: Role.civilian },
        {
          id: 2,
          name: 'Bob',
          avatarUrl: '/uploads/avatars/bob.png',
          role: Role.undercover,
        },
      ]);
      expect(prismaMock.games.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: {
          status: true,
          gamePlayers: {
            select: {
              role: true,
              playerIdRel: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      });
    });

    it('should hide roles when the game is not finished', async () => {
      const game = {
        status: GameStatus.playing,
        gamePlayers: [
          {
            role: Role.civilian,
            playerIdRel: { id: 1, name: 'Alice', avatarUrl: null },
          },
        ],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      const res = await service.getPlayersByGame(5);

      expect(res).toEqual([
        { id: 1, name: 'Alice', avatarUrl: null, role: null },
      ]);
    });

    it('should return an empty tab when the game has no players', async () => {
      const game = { status: GameStatus.waiting, gamePlayers: [] };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      expect(await service.getPlayersByGame(5)).toEqual([]);
    });

    it('should throw NotFoundException when the game does not exist', async () => {
      prismaMock.games.findUnique.mockResolvedValue(null);

      await expect(service.getPlayersByGame(404)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyWord', () => {
    it('should return the civilian word for a civilian player while playing', async () => {
      const game = {
        status: GameStatus.playing,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        gamePlayers: [{ role: Role.civilian }],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      expect(await service.getMyWord(5, 1)).toEqual({ word: 'cat' });
      expect(prismaMock.games.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: {
          status: true,
          civilianWord: true,
          undercoverWord: true,
          gamePlayers: {
            where: { playerId: 1 },
            select: { role: true },
          },
        },
      });
    });

    it('should return the undercover word for an undercover player while playing', async () => {
      const game = {
        status: GameStatus.playing,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        gamePlayers: [{ role: Role.undercover }],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      expect(await service.getMyWord(5, 2)).toEqual({ word: 'tiger' });
    });

    it('should still return the word once the game is finished', async () => {
      const game = {
        status: GameStatus.finished,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        gamePlayers: [{ role: Role.civilian }],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      expect(await service.getMyWord(5, 1)).toEqual({ word: 'cat' });
    });

    it('should throw ForbiddenException while the game is still waiting', async () => {
      const game = {
        status: GameStatus.waiting,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        gamePlayers: [{ role: Role.civilian }],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      await expect(service.getMyWord(5, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when the requester is not a player in the game', async () => {
      const game = {
        status: GameStatus.playing,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        gamePlayers: [],
      };
      prismaMock.games.findUnique.mockResolvedValue(
        game as unknown as GameForPlayers,
      );

      await expect(service.getMyWord(5, 99)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when the game does not exist', async () => {
      prismaMock.games.findUnique.mockResolvedValue(null);

      await expect(service.getMyWord(404, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminate', () => {
    it('should stamp eliminatedAt on the player of the game', async () => {
      prismaMock.game_Players.updateMany.mockResolvedValue({ count: 1 });

      expect(await service.eliminate(5, 2)).toEqual({ count: 1 });
      expect(prismaMock.game_Players.updateMany).toHaveBeenCalledWith({
        where: { gameId: 5, playerId: 2, eliminatedAt: null },
        data: { eliminatedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('finish', () => {
    it('should finish a game with a victory and return it', async () => {
      const result = {
        id: 5,
        status: GameStatus.finished,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: new Date(),
        victory: Role.undercover,
        roomId: 7,
      };
      prismaMock.games.update.mockResolvedValue(result);

      expect(await service.finish(5, Role.undercover)).toBe(result);
      expect(prismaMock.games.update).toHaveBeenCalledWith({
        where: { id: 5, finishedAt: null },
        data: {
          status: 'finished',
          finishedAt: expect.any(Date) as Date,
          victory: Role.undercover,
        },
      });
    });
  });

  describe('remove', () => {
    it('should abort a game without victory and return it', async () => {
      const result = {
        id: 5,
        status: GameStatus.aborted,
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: new Date(),
        victory: null,
        roomId: 7,
      };
      prismaMock.games.update.mockResolvedValue(result);

      expect(await service.remove(5)).toBe(result);
      expect(prismaMock.games.update).toHaveBeenCalledWith({
        where: { id: 5, finishedAt: null },
        data: { status: 'aborted', finishedAt: expect.any(Date) as Date },
      });
    });
  });
});
