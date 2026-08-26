import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma.service';
import {
  Games,
  GameStatus,
  PrismaClient,
  Role,
  Rooms,
} from '../generated/prisma/client';

describe('RoomService', () => {
  let service: RoomService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a room when the player is under the room limit', async () => {
      const createDto = { name: 'Room1' };
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
      prismaMock.rooms.count.mockResolvedValue(2);
      prismaMock.rooms.create.mockResolvedValue(result);

      expect(await service.create(3, createDto)).toBe(result);
      expect(prismaMock.rooms.count).toHaveBeenCalledWith({
        where: { createdBy: 3, deletedAt: null },
      });
      expect(prismaMock.rooms.create).toHaveBeenCalledWith({
        data: { name: createDto.name, createdBy: 3 },
      });
    });

    it('should throw a ForbiddenException when the player has reached the room limit', async () => {
      const createDto = { name: 'Room1' };
      prismaMock.rooms.count.mockResolvedValue(3);

      await expect(service.create(3, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.rooms.create).not.toHaveBeenCalled();
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
      ];
      prismaMock.rooms.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.rooms.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findCurrent', () => {
    it('should return rooms that are not deleted', async () => {
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
      prismaMock.rooms.findMany.mockResolvedValue(result);

      expect(await service.findCurrent()).toBe(result);
      expect(prismaMock.rooms.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
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
      prismaMock.rooms.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });

  describe('getGames', () => {
    it('should return games tab of an existing room', async () => {
      const games: Games[] = [
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
      const roomWithGames: Rooms & { games: Games[] } = {
        id: 3,
        name: "alice's room",
        minPlayers: 3,
        maxPlayers: 6,
        colyseusRoomId: null,
        createdAt: new Date(),
        deletedAt: null,
        createdBy: 1,
        games,
      };

      prismaMock.rooms.findUnique.mockResolvedValue(roomWithGames);

      const res = await service.getGames(3);

      expect(res).toBe(games);
      expect(prismaMock.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 3 },
        include: { games: true },
      });
    });

    it('should return void tab when room not exist', async () => {
      prismaMock.rooms.findUnique.mockResolvedValue(null);
      expect(await service.getGames(404)).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a room and return it', async () => {
      const updateDto = { name: 'RoomRenamed' };
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
      prismaMock.rooms.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.rooms.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { name: updateDto.name },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a room and return it', async () => {
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
      prismaMock.rooms.update.mockResolvedValue(result);

      expect(await service.remove(5)).toBe(result);
      expect(prismaMock.rooms.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
  });
});
