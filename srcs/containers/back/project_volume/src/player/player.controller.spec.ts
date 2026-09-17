import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';

function requestAs(
  id: number,
  email: string,
  isAdmin = false,
): AuthenticatedRequest {
  return { user: { id, email, isAdmin } } as AuthenticatedRequest;
}

describe('PlayerController', () => {
  let playerController: PlayerController;
  let playerService: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [PlayerService, { provide: PrismaService, useValue: {} }],
    }).compile();

    playerController = module.get<PlayerController>(PlayerController);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it('playerController should be defined', () => {
    expect(playerController).toBeDefined();
  });

  it('playerService should be defined', () => {
    expect(playerService).toBeDefined();
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
          isAdmin: false,
          createdAt: new Date(),
          deletedAt: null,
        },
        {
          id: 6,
          name: 'Jean',
          email: 'valjean@test.com',
          password: 'password123',
          aboutMe: 'Hello there',
          avatarUrl: null,
          isAdmin: false,
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(playerService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.findAll()).toBe(result);
      expect(playerService.findAll).toHaveBeenCalled();
    });
  });

  describe('countPlayerActiv', () => {
    it('should return the active players count', async () => {
      jest
        .spyOn(playerService, 'countPlayerActiv')
        .mockImplementation(() => Promise.resolve(3));

      expect(await playerController.countPlayerActiv()).toBe(3);
      expect(playerService.countPlayerActiv).toHaveBeenCalled();
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
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(playerService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.findOne('5')).toBe(result);
      expect(playerService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('getGamesList', () => {
    it('should return a player games list', async () => {
      const result = [
        {
          id: 1,
          name: 'Room #42',
          nbPlayers: 5,
          date: new Date('2026-07-25T14:30:00Z'),
          victory: true,
        },
      ];
      jest
        .spyOn(playerService, 'getGamesList')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(5, 'bob@test.com');
      expect(await playerController.getGamesList('5', req)).toBe(result);
      expect(playerService.getGamesList).toHaveBeenCalledWith(5);
    });

    it('should reject viewing another player games', async () => {
      const req = requestAs(6, 'other@test.com');
      await expect(playerController.getGamesList('5', req)).rejects.toThrow(
        'Cannot view games of another player',
      );
    });
  });

  describe('update', () => {
    it('should update a player and return it', async () => {
      const updateDto = {
        name: 'Bob',
        email: 'boblebricoleur@test.com',
      };
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(playerService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(5, 'bob@test.com');
      expect(await playerController.update('5', updateDto, req)).toBe(result);
      expect(playerService.update).toHaveBeenCalledWith(5, updateDto);
    });

    it('should reject updating another player', async () => {
      const req = requestAs(6, 'other@test.com');
      await expect(
        playerController.update(
          '5',
          { name: 'Bob', email: 'boblebricoleur@test.com' },
          req,
        ),
      ).rejects.toThrow('Cannot edit another player');
    });
  });

  describe('remove', () => {
    it('should delete a player and return it', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        password: 'password123',
        aboutMe: 'Hello there',
        avatarUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        deletedAt: new Date(),
      };
      jest
        .spyOn(playerService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(5, 'bob@test.com');
      expect(await playerController.remove('5', req)).toBe(result);
      expect(playerService.remove).toHaveBeenCalledWith(5);
    });

    it('should reject deleting another player', async () => {
      const req = requestAs(6, 'other@test.com');
      await expect(playerController.remove('5', req)).rejects.toThrow(
        'Cannot delete another player',
      );
    });
  });

  describe('countGamesPlayed', () => {
    it('should count a player finished games and return it', async () => {
      const result = {
        playerId: 5,
        gamesPlayed: 3,
      };
      jest
        .spyOn(playerService, 'countGamesPlayed')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.countGamesPlayed('5')).toBe(result);
      expect(playerService.countGamesPlayed).toHaveBeenCalledWith(5);
    });
  });

  describe('countVictory', () => {
    it('should count a player games victory and return it', async () => {
      const result = {
        playerId: 5,
        victoriesCount: 3,
      };
      jest
        .spyOn(playerService, 'countVictory')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.countVictory('5')).toBe(result);
      expect(playerService.countVictory).toHaveBeenCalledWith(5);
    });
  });

  describe('getWinrate', () => {
    it('should return a player winrate and return it', async () => {
      const result = {
        playerId: 5,
        winrate: 50,
      };
      jest
        .spyOn(playerService, 'getWinrate')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.getWinrate('5')).toBe(result);
      expect(playerService.getWinrate).toHaveBeenCalledWith(5);
    });
  });

  describe('getAboutMe', () => {
    it('should return a player about me section and return it', async () => {
      const result = {
        playerId: 5,
        aboutMe: { aboutMe: 'Hello there' },
      };
      jest
        .spyOn(playerService, 'getAboutMe')
        .mockImplementation(() => Promise.resolve(result));

      expect(await playerController.getAboutMe('5')).toBe(result);
      expect(playerService.getAboutMe).toHaveBeenCalledWith(5);
    });
  });
});
