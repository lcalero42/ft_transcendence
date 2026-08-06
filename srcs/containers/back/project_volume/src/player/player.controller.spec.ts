import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';

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

  describe('create', () => {
    it('should create a player', async () => {
      const createDto = {
        name: 'Bob',
        email: 'bob@test.com',
      };
      const result = {
        id: 5,
        name: 'Bob',
        email: 'bob@test.com',
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(playerService, 'create')
        .mockImplementation(async () => result);

      expect(await playerController.create(createDto)).toBe(result);
      expect(playerService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return a player array', async () => {
      const result = [
        {
          id: 5,
          name: 'Bob',
          email: 'bob@test.com',
          createdAt: new Date(),
          deletedAt: null,
        },
        {
          id: 6,
          name: 'Jean',
          email: 'valjean@test.com',
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(playerService, 'findAll')
        .mockImplementation(async () => result);

      expect(await playerController.findAll()).toBe(result);
      expect(playerService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a player', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'bob@test.com',
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(playerService, 'findOne')
        .mockImplementation(async () => result);

      expect(await playerController.findOne('5')).toBe(result);
      expect(playerService.findOne).toHaveBeenCalledWith(5);
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
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(playerService, 'update')
        .mockImplementation(async () => result);

      expect(await playerController.update('5', updateDto)).toBe(result);
      expect(playerService.update).toHaveBeenCalledWith(5, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a player and return it', async () => {
      const result = {
        id: 5,
        name: 'Bob',
        email: 'boblebricoleur@test.com',
        createdAt: new Date(),
        deletedAt: new Date(),
      };
      jest
        .spyOn(playerService, 'remove')
        .mockImplementation(async () => result);

      expect(await playerController.remove('5')).toBe(result);
      expect(playerService.remove).toHaveBeenCalledWith(5);
    });
  });

  describe('countGamesPlayed', () => {
    it('should count a player finished games and return it', async () => {
      const result = {
        playerId: 5,
        gamesPlayed: 3
      };
      jest
        .spyOn(playerService, 'countGamesPlayed')
        .mockImplementation(async () => result);

      expect(await playerController.countGamesPlayed('5')).toBe(result);
      expect(playerService.countGamesPlayed).toHaveBeenCalledWith(5);
    });
  });

  describe('countVictory', () => {
    it('should count a player games victory and return it', async () => {
      const result = {
        playerId: 5,
        victoriesCount: 3
      };
      jest
        .spyOn(playerService, 'countVictory')
        .mockImplementation(async () => result);

      expect(await playerController.countVictory('5')).toBe(result);
      expect(playerService.countVictory).toHaveBeenCalledWith(5);
    });
  });
});
