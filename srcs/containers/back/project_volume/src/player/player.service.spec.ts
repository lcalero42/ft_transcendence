import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, Role } from '../generated/prisma/client';
import { unlink } from 'node:fs/promises';

jest.mock('node:fs/promises', () => ({
  unlink: jest.fn(),
}));

const unlinkMock = unlink as jest.MockedFunction<typeof unlink>;

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
    unlinkMock.mockReset();

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
          isGuest: false,
          aboutMe: 'Hello there',
          avatarUrl: null,
          isAdmin: false,
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      prismaMock.player.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.player.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
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
        isGuest: false,
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: 5, deletedAt: null },
      });
    });

    it('should throw a NotFoundException when the player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGamesList', () => {
    it('should return the formatted games list for a player', async () => {
      const rows = [
        {
          role: Role.civilian,
          gameIdRel: {
            id: 1,
            victory: Role.civilian,
            createdAt: new Date('2026-07-25T14:30:00Z'),
            roomIdRel: { name: 'Room #42' },
            gamePlayers: [{}, {}, {}, {}, {}],
          },
        },
        {
          role: Role.undercover,
          gameIdRel: {
            id: 2,
            victory: Role.civilian,
            createdAt: new Date('2026-02-25T14:30:00Z'),
            roomIdRel: { name: 'giga boss Room' },
            gamePlayers: [{}, {}, {}, {}, {}, {}],
          },
        },
      ];
      prismaMock.game_Players.findMany.mockResolvedValue(
        rows as unknown as GamePlayersRows,
      );

      expect(await service.getGamesList(5)).toEqual([
        {
          id: 1,
          name: 'Room #42',
          nbPlayers: 5,
          date: new Date('2026-07-25T14:30:00Z'),
          victory: true,
        },
        {
          id: 2,
          name: 'giga boss Room',
          nbPlayers: 6,
          date: new Date('2026-02-25T14:30:00Z'),
          victory: false,
        },
      ]);
      expect(prismaMock.game_Players.findMany).toHaveBeenCalledWith({
        where: { playerId: 5 },
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
    });

    it('should return an empty array when the player has no games', async () => {
      prismaMock.game_Players.findMany.mockResolvedValue([]);

      expect(await service.getGamesList(5)).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a player and return it', async () => {
      const updateDto = { name: 'Bob' };
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        isGuest: false,
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { id: 5, deletedAt: null },
        data: {
          name: updateDto.name,
          aboutMe: undefined,
        },
      });
    });
  });

  describe('updateAvatar', () => {
    const basePlayer = {
      id: 5,
      name: 'Bob',
      email: 'bob@test.com',
      password: 'password123',
      isGuest: false,
      aboutMe: 'Hello there',
      isAdmin: false,
      createdAt: new Date(),
      deletedAt: null,
    };

    it('should update the avatar and delete the old file', async () => {
      const updated = { ...basePlayer, avatarUrl: '/uploads/avatars/new.webp' };
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: '/uploads/avatars/old.webp',
      } as PlayerRow);
      prismaMock.player.update.mockResolvedValue(updated);
      prismaMock.player.count.mockResolvedValue(0);
      unlinkMock.mockResolvedValue(undefined);

      expect(await service.updateAvatar(5, '/uploads/avatars/new.webp')).toBe(
        updated,
      );
      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { id: 5, deletedAt: null },
        data: { avatarUrl: '/uploads/avatars/new.webp' },
      });
      expect(unlinkMock).toHaveBeenCalledWith(
        expect.stringContaining('old.webp'),
      );
    });

    it('should not delete the old file when another player still uses it', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: '/uploads/avatars/shared.webp',
      } as PlayerRow);
      prismaMock.player.update.mockResolvedValue({
        ...basePlayer,
        avatarUrl: '/uploads/avatars/new.webp',
      });
      prismaMock.player.count.mockResolvedValue(1);

      await service.updateAvatar(5, '/uploads/avatars/new.webp');
      expect(prismaMock.player.count).toHaveBeenCalledWith({
        where: { avatarUrl: '/uploads/avatars/shared.webp' },
      });
      expect(unlinkMock).not.toHaveBeenCalled();
    });

    it('should not delete anything when there was no previous avatar', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: null,
      } as PlayerRow);
      prismaMock.player.update.mockResolvedValue({
        ...basePlayer,
        avatarUrl: '/uploads/avatars/new.webp',
      });

      await service.updateAvatar(5, '/uploads/avatars/new.webp');
      expect(unlinkMock).not.toHaveBeenCalled();
    });

    it('should not delete an external avatar url', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: 'https://cdn.example.com/a.png',
      } as PlayerRow);
      prismaMock.player.update.mockResolvedValue({
        ...basePlayer,
        avatarUrl: '/uploads/avatars/new.webp',
      });

      await service.updateAvatar(5, '/uploads/avatars/new.webp');
      expect(unlinkMock).not.toHaveBeenCalled();
    });

    it('should not fail when the old file cannot be deleted', async () => {
      const updated = { ...basePlayer, avatarUrl: '/uploads/avatars/new.webp' };
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: '/uploads/avatars/old.webp',
      } as PlayerRow);
      prismaMock.player.update.mockResolvedValue(updated);
      prismaMock.player.count.mockResolvedValue(0);
      unlinkMock.mockRejectedValue(new Error('ENOENT'));

      await expect(
        service.updateAvatar(5, '/uploads/avatars/new.webp'),
      ).resolves.toBe(updated);
    });

    it('should keep the old file when the database update fails', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        avatarUrl: '/uploads/avatars/old.webp',
      } as PlayerRow);
      prismaMock.player.update.mockRejectedValue(new Error('db down'));

      await expect(
        service.updateAvatar(5, '/uploads/avatars/new.webp'),
      ).rejects.toThrow('db down');
      expect(unlinkMock).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a player and return it', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        isGuest: false,
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
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
  });

  describe('getAboutMe', () => {
    it('should return the player about me section', async () => {
      const player = {
        id: 5,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'password123',
        isGuest: false,
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: null,
      };
      prismaMock.player.findUnique
        .mockResolvedValueOnce(player)
        .mockResolvedValueOnce({ aboutMe: 'Hello there' } as PlayerRow);

      expect(await service.getAboutMe(5)).toEqual({
        playerId: 5,
        aboutMe: 'Hello there',
      });
      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: 5, deletedAt: null },
      });
      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: 5, deletedAt: null },
        select: { aboutMe: true },
      });
    });

    it('should throw a NotFoundException when the player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      await expect(service.getAboutMe(404)).rejects.toThrow(NotFoundException);
      expect(prismaMock.player.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
