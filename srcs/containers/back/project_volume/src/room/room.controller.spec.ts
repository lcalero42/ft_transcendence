import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma.service';
import { GameStatus, Role } from '../generated/prisma/enums';

describe('RoomController', () => {
  let roomController: RoomController;
  let roomService: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [RoomService, { provide: PrismaService, useValue: {} }],
    }).compile();

    roomController = module.get<RoomController>(RoomController);
    roomService = module.get<RoomService>(RoomService);
  });

  it('roomController should be defined', () => {
    expect(roomController).toBeDefined();
  });

  it('roomService should be defined', () => {
    expect(roomService).toBeDefined();
  });

  describe('create', () => {
    it('should create a room', async () => {
      const createDto = {
        name: 'Room1',
      };
      const result = {
        id: 5,
        name: 'Room1',
        minPlayers: 3,
        maxPlayers: 6,
        colyseusRoomId: null,
        createdBy: 3,
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(roomService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.create('3', createDto)).toBe(result);
      expect(roomService.create).toHaveBeenCalledWith(3, createDto);
    });
  });

  describe('findAll', () => {
    it('should return a room array', async () => {
      const result = [
        {
          id: 5,
          name: 'Room1',
          minPlayers: 3,
          maxPlayers: 6,
          colyseusRoomId: null,
          createdBy: 3,
          createdAt: new Date(),
          deletedAt: null,
        },
        {
          id: 6,
          name: 'Room2',
          minPlayers: 3,
          maxPlayers: 6,
          colyseusRoomId: null,
          createdBy: 4,
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(roomService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.findAll()).toBe(result);
      expect(roomService.findAll).toHaveBeenCalled();
    });
  });

  describe('findCurrent', () => {
    it('should return an array of current rooms', async () => {
      const result = [
        {
          id: 5,
          name: 'Room1',
          minPlayers: 3,
          maxPlayers: 6,
          colyseusRoomId: null,
          createdBy: 3,
          createdAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(roomService, 'findCurrent')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.findCurrent()).toBe(result);
      expect(roomService.findCurrent).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a room', async () => {
      const result = {
        id: 5,
        name: 'Room1',
        minPlayers: 3,
        maxPlayers: 6,
        colyseusRoomId: null,
        createdBy: 3,
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(roomService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.findOne('5')).toBe(result);
      expect(roomService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('getGames', () => {
    it('should reutnr games of room', async () => {
      const res = [
        {
          id: 1,
          status: GameStatus.finished,
          civilianWord: 'cat',
          undercoverWord: 'tiger',
          createdAt: new Date(),
          finishedAt: new Date(),
          victory: Role.civilian,
          roomId: 3,
        },
      ];
      jest
        .spyOn(roomService, 'getGames')
        .mockImplementation(() => Promise.resolve(res));

      expect(await roomController.getGames('3')).toBe(res);
      expect(roomService.getGames).toHaveBeenCalledWith(3);
    });

    it('should return void tab when room has no games', async () => {
      jest
        .spyOn(roomService, 'getGames')
        .mockImplementation(() => Promise.resolve([]));
      expect(await roomController.getGames('404')).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a room and return it', async () => {
      const updateDto = {
        name: 'RoomRenamed',
      };
      const result = {
        id: 5,
        name: 'RoomRenamed',
        minPlayers: 3,
        maxPlayers: 6,
        colyseusRoomId: null,
        createdBy: 3,
        createdAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(roomService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.update('5', updateDto)).toBe(result);
      expect(roomService.update).toHaveBeenCalledWith(5, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a room and return it', async () => {
      const result = {
        id: 5,
        name: 'Room1',
        minPlayers: 3,
        maxPlayers: 6,
        colyseusRoomId: null,
        createdBy: 3,
        createdAt: new Date(),
        deletedAt: new Date(),
      };
      jest
        .spyOn(roomService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      expect(await roomController.remove('5')).toBe(result);
      expect(roomService.remove).toHaveBeenCalledWith(5);
    });
  });
});
