import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, GameStatus, Role } from '../generated/prisma/client';

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
    it('should create a game', async () => {
      const createDto = {
        civilianWord: 'cat',
        undercoverWord: 'tiger',
        roomId: 7,
      };
      const result = {
        id: 5,
        status: GameStatus.waiting,
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
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return a game array', async () => {
      const result = [
        {
          id: 5,
          status: GameStatus.waiting,
          civilianWord: 'cat',
          undercoverWord: 'tiger',
          createdAt: new Date(),
          finishedAt: null,
          victory: null,
          roomId: 7,
        },
      ];
      prismaMock.games.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.games.findMany).toHaveBeenCalledWith();
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
    it('should return a game', async () => {
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

    it('should return null when the game does not exist', async () => {
      prismaMock.games.findUnique.mockResolvedValue(null);

      expect(await service.findOne(404)).toBeNull();
    });
  });

  describe('getPlayersByGame', () => {
    it('should return players mapped with role', async () => {
      const gamePlayers = [
        {
          id: 10,
          role: Role.civilian,
          eliminatedAt: null,
          gameId: 5,
          playerId: 1,
          playerIdRel: {
            id: 1,
            name: 'Alice',
            avatarUrl: null,
          },
        },
        {
          id: 11,
          role: Role.undercover,
          eliminatedAt: null,
          gameId: 5,
          playerId: 2,
          playerIdRel: {
            id: 2,
            name: 'Bob',
            avatarUrl: '/uploads/avatars/bob.png',
          },
        },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(gamePlayers);
      const res = await service.getPlayersByGame(5);

      expect(res).toEqual([
        {
          id: 1,
          name: 'Alice',
          avatarUrl: null,
          role: Role.civilian,
        },
        {
          id: 2,
          name: 'Bob',
          avatarUrl: '/uploads/avatars/bob.png',
          role: Role.undercover,
        },
      ]);
      expect(prismaMock.game_Players.findMany).toHaveBeenCalledWith({
        where: { gameId: 5 },
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
    });

    it('should return a void tab when the game has no players', async () => {
      prismaMock.game_Players.findMany.mockResolvedValue([]);
      expect(await service.getPlayersByGame(404)).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a game and return it', async () => {
      const updateDto = {
        civilianWord: 'dog',
        undercoverWord: 'wolf',
        roomId: 8,
      };
      const result = {
        id: 5,
        status: GameStatus.playing,
        civilianWord: 'dog',
        undercoverWord: 'wolf',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 8,
      };
      prismaMock.games.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.games.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          civilianWord: updateDto.civilianWord,
          undercoverWord: updateDto.undercoverWord,
          roomId: updateDto.roomId,
        },
      });
    });

    it('should forward undefined fields when the dto is partial', async () => {
      const updateDto = { civilianWord: 'dog' };
      const result = {
        id: 5,
        status: GameStatus.playing,
        civilianWord: 'dog',
        undercoverWord: 'tiger',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 7,
      };
      prismaMock.games.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.games.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          civilianWord: 'dog',
          undercoverWord: undefined,
          roomId: undefined,
        },
      });
    });
  });

  describe('remove', () => {
    // Documents current behaviour: remove only stamps finishedAt,
    // it does not switch the status to finished.
    it('should soft delete a game and return it', async () => {
      const result = {
        id: 5,
        status: GameStatus.playing,
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
        where: { id: 5 },
        data: { finishedAt: expect.any(Date) as Date },
      });
    });
  });
});
