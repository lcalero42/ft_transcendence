import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { matchMaker } from '@colyseus/core';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma.service';
import { MAX_CLIENTS } from '../colyseus/rooms/undercoverConstants';
import {
  Games,
  GameStatus,
  PrismaClient,
  Role,
  Rooms,
} from '../generated/prisma/client';

jest.mock('@colyseus/core', () => ({
  matchMaker: { query: jest.fn() },
}));

const queryMock = matchMaker.query as jest.Mock;

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

  describe('onApplicationBootstrap', () => {
    it('should close every open room that was linked to a Colyseus room', async () => {
      prismaMock.rooms.updateMany.mockResolvedValue({ count: 2 });

      await service.onApplicationBootstrap();

      expect(prismaMock.rooms.updateMany).toHaveBeenCalledWith({
        where: { deletedAt: null, colyseusRoomId: { not: null } },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
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
    const baseRoom = {
      minPlayers: 3,
      maxPlayers: 6,
      createdBy: 3,
      createdAt: new Date(),
      deletedAt: null,
    };

    it('should return rooms that are not deleted with their live player count', async () => {
      const liveRoom = {
        ...baseRoom,
        id: 5,
        name: 'Room1',
        colyseusRoomId: 'abc',
      };
      const deadRoom = {
        ...baseRoom,
        id: 6,
        name: 'Room2',
        colyseusRoomId: null,
      };
      prismaMock.rooms.findMany.mockResolvedValue([liveRoom, deadRoom]);
      queryMock.mockResolvedValue([
        { roomId: 'abc', maxClients: 12, metadata: { playerCount: 4 } },
      ]);

      expect(await service.findCurrent()).toEqual([
        { ...liveRoom, playerCount: 4, maxClients: 12 },
        { ...deadRoom, playerCount: 0, maxClients: MAX_CLIENTS },
      ]);
      expect(prismaMock.rooms.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(queryMock).toHaveBeenCalledWith({ name: 'undercover' });
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
        where: { id: 5, deletedAt: null },
      });
    });

    it('should throw a NotFoundException when the room does not exist', async () => {
      prismaMock.rooms.findUnique.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
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
        where: { id: 3, deletedAt: null },
        include: { games: true },
      });
    });

    it('should throw a NotFoundException when the room does not exist', async () => {
      prismaMock.rooms.findUnique.mockResolvedValue(null);

      await expect(service.getGames(404)).rejects.toThrow(NotFoundException);
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
        where: { id: 5, deletedAt: null },
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
        where: { id: 5, deletedAt: null },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
  });
});
