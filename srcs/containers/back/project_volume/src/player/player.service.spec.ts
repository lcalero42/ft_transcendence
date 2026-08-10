import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, Role } from '../generated/prisma/client';

type VictoryRow = { role: Role; gameIdRel: { victory: Role | null } };

describe('PlayerService', () => {
  let service: PlayerService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a player', async () => {
      const createDto = {
        name: 'Bob',
        email: 'bob@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
      };
      const result = {
        id: 5,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.create.mockResolvedValue(result);

      expect(await service.create(createDto)).toBe(result);
      expect(prismaMock.player.create).toHaveBeenCalledWith({
        data: {
          email: createDto.email,
          name: createDto.name,
          password: createDto.password,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return a player array', async () => {
      const result = [
        {
          id: 5,
          name: 'Bob',
          email: 'bob@test.com',
          password: 'password123',
          aboutMe: 'Hello there',
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      prismaMock.player.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.player.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a player', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });

  describe('update', () => {
    it('should update a player and return it', async () => {
      const updateDto = { name: 'Bob', email: 'boblebricoleur@test.com' };
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          email: updateDto.email,
          name: updateDto.name,
          aboutMe: undefined,
        },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a player and return it', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        createdAt: new Date(),
        deletedAt: new Date(),
      };
      prismaMock.player.update.mockResolvedValue(result);

      expect(await service.remove(5)).toBe(result);
      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('countGamesPlayed', () => {
    it('should count a player finished games and return it', async () => {
      prismaMock.game_Players.count.mockResolvedValue(3);

      expect(await service.countGamesPlayed(5)).toEqual({
        playerId: 5,
        gamesPlayed: 3,
      });
      expect(prismaMock.game_Players.count).toHaveBeenCalledWith({
        where: { playerId: 5, gameIdRel: { status: 'finished' } },
      });
    });
  });

  describe('countVictory', () => {
    it('should count a player games victory and return it', async () => {
      const rows: VictoryRow[] = [
        { role: Role.civilian, gameIdRel: { victory: Role.civilian } },
        { role: Role.undercover, gameIdRel: { victory: Role.civilian } },
        { role: Role.civilian, gameIdRel: { victory: Role.civilian } },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(
        rows as unknown as Awaited<
          ReturnType<PrismaClient['game_Players']['findMany']>
        >,
      );

      expect(await service.countVictory(5)).toEqual({
        playerId: 5,
        victoriesCount: 2,
      });
      expect(prismaMock.game_Players.findMany).toHaveBeenCalledWith({
        where: {
          playerId: 5,
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
    });

    it('should return zero victories when the player never won', async () => {
      const rows: VictoryRow[] = [
        { role: Role.civilian, gameIdRel: { victory: Role.undercover } },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(
        rows as unknown as Awaited<
          ReturnType<PrismaClient['game_Players']['findMany']>
        >,
      );

      expect(await service.countVictory(5)).toEqual({
        playerId: 5,
        victoriesCount: 0,
      });
    });
  });
});
