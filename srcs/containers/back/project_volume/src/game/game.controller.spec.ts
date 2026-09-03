import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { GameStatus, Role } from '../generated/prisma/client';

describe('GameController', () => {
  let gameController: GameController;
  let gameService: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService, { provide: PrismaService, useValue: {} }],
    }).compile();

    gameController = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);
  });

  it('gameController should be defined', () => {
    expect(gameController).toBeDefined();
  });

  it('gameService should be defined', () => {
    expect(gameService).toBeDefined();
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
      jest
        .spyOn(gameService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await gameController.create(createDto)).toBe(result);
      expect(gameService.create).toHaveBeenCalledWith(createDto);
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
        {
          id: 6,
          status: GameStatus.finished,
          civilianWord: 'dog',
          undercoverWord: 'wolf',
          createdAt: new Date(),
          finishedAt: new Date(),
          victory: Role.undercover,
          roomId: 8,
        },
      ];
      jest
        .spyOn(gameService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await gameController.findAll()).toBe(result);
      expect(gameService.findAll).toHaveBeenCalled();
    });
  });

  describe('countGames', () => {
    it('should return the finished games count', async () => {
      jest
        .spyOn(gameService, 'countGames')
        .mockImplementation(() => Promise.resolve(3));

      expect(await gameController.countGames()).toBe(3);
      expect(gameService.countGames).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a game', async () => {
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
      jest
        .spyOn(gameService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await gameController.findOne('5')).toBe(result);
      expect(gameService.findOne).toHaveBeenCalledWith(5);
    });

    it('should propagate NotFoundException when the game does not exist', async () => {
      jest
        .spyOn(gameService, 'findOne')
        .mockRejectedValue(new NotFoundException('Game 404 not found'));

      await expect(gameController.findOne('404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPlayersByGame', () => {
    it('should return players of game', async () => {
      const res = [
        {
          id: 1,
          name: 'Alice',
          avatarUrl: null,
          role: Role.undercover,
        },
        {
          id: 2,
          name: 'blob',
          avatarUrl: '/uploads/avatars/bob.png',
          role: Role.undercover,
        },
      ];
      jest
        .spyOn(gameService, 'getPlayersByGame')
        .mockImplementation(() => Promise.resolve(res));

      expect(await gameController.getPlayersByGame('5')).toBe(res);
      expect(gameService.getPlayersByGame).toHaveBeenCalledWith(5);
    });
    it('should return void tab when the game has no players', async () => {
      jest
        .spyOn(gameService, 'getPlayersByGame')
        .mockImplementation(() => Promise.resolve([]));
      expect(await gameController.getPlayersByGame('5')).toEqual([]);
    });

    it('should propagate NotFoundException when the game does not exist', async () => {
      jest
        .spyOn(gameService, 'getPlayersByGame')
        .mockRejectedValue(new NotFoundException('Game 404 not found'));

      await expect(
        gameController.getPlayersByGame('404'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a game and return it', async () => {
      const updateDto = {
        civilianWord: 'dog',
        undercoverWord: 'wolf',
      };
      const result = {
        id: 5,
        status: GameStatus.playing,
        civilianWord: 'dog',
        undercoverWord: 'wolf',
        createdAt: new Date(),
        finishedAt: null,
        victory: null,
        roomId: 7,
      };
      jest
        .spyOn(gameService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      expect(await gameController.update('5', updateDto)).toBe(result);
      expect(gameService.update).toHaveBeenCalledWith(5, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a game and return it', async () => {
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
      jest
        .spyOn(gameService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      expect(await gameController.remove('5')).toBe(result);
      expect(gameService.remove).toHaveBeenCalledWith(5);
    });
  });
});
