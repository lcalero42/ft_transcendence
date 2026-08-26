import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, Role } from '../generated/prisma/client';

type VictoryRow = { role: Role; gameIdRel: { victory: Role | null } };
type GamePlayersRows = Awaited<
  ReturnType<PrismaClient['game_Players']['findMany']>
>;
type PlayerRow = Awaited<ReturnType<PrismaClient['player']['findUnique']>>;

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

  describe('findAll', () => {
    it('should return a player array', async () => {
      const result = [
        {
          id: 5,
          name: 'Bob',
          email: 'bob@test.com',
          password: 'password123',
          aboutMe: 'Hello there',
          avatarUrl: null,
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      prismaMock.player.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.player.findMany).toHaveBeenCalledWith();
    });
  });

  describe('countPlayerActiv', () => {
    it('should count the non deleted players and return it', async () => {
      prismaMock.player.count.mockResolvedValue(3);

      expect(await service.countPlayerActiv()).toBe(3);
      expect(prismaMock.player.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });

    it('should return zero when every player has been deleted', async () => {
      prismaMock.player.count.mockResolvedValue(0);

      expect(await service.countPlayerActiv()).toBe(0);
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
        avatarUrl: null,
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
        avatarUrl: null,
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
        avatarUrl: null,
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
        rows as unknown as GamePlayersRows,
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
        rows as unknown as GamePlayersRows,
      );

      expect(await service.countVictory(5)).toEqual({
        playerId: 5,
        victoriesCount: 0,
      });
    });
  });

  describe('getWinrate', () => {
    it('should return the winrate as a percentage', async () => {
      const rows: VictoryRow[] = [
        { role: Role.civilian, gameIdRel: { victory: Role.civilian } },
        { role: Role.civilian, gameIdRel: { victory: Role.civilian } },
        { role: Role.undercover, gameIdRel: { victory: Role.civilian } },
        { role: Role.civilian, gameIdRel: { victory: Role.undercover } },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(
        rows as unknown as GamePlayersRows,
      );
      prismaMock.game_Players.count.mockResolvedValue(4);

      expect(await service.getWinrate(5)).toEqual({ playerId: 5, winrate: 50 });
    });

    it('should return a winrate of 100 when every game was won', async () => {
      const rows: VictoryRow[] = [
        { role: Role.undercover, gameIdRel: { victory: Role.undercover } },
        { role: Role.civilian, gameIdRel: { victory: Role.civilian } },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(
        rows as unknown as GamePlayersRows,
      );
      prismaMock.game_Players.count.mockResolvedValue(2);

      expect(await service.getWinrate(5)).toEqual({
        playerId: 5,
        winrate: 100,
      });
    });

    // Documents current behaviour: dividing by zero games yields NaN.
    it('should return NaN when the player has never finished a game', async () => {
      prismaMock.game_Players.findMany.mockResolvedValue([]);
      prismaMock.game_Players.count.mockResolvedValue(0);

      const { winrate } = await service.getWinrate(5);
      expect(winrate).toBeNaN();
    });
  });

  describe('getAboutMe', () => {
    it('should return the player about me section', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        aboutMe: 'Hello there',
      } as unknown as PlayerRow);

      expect(await service.getAboutMe(5)).toEqual({
        playerId: 5,
        aboutMe: { aboutMe: 'Hello there' },
      });
      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: { aboutMe: true },
      });
    });

    it('should return a null about me when the player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      expect(await service.getAboutMe(5)).toEqual({
        playerId: 5,
        aboutMe: null,
      });
    });
  });
});
