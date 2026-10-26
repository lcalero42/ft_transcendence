import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { matchMaker } from '@colyseus/core';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma.service';
import { MAX_CLIENTS } from '../colyseus/rooms/undercoverConstants';

@Injectable()
export class RoomService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.prisma.rooms.updateMany({
      where: { deletedAt: null, colyseusRoomId: { not: null } },
      data: { deletedAt: new Date() },
    });
  }

  async create(playerId: number, createRoomDto: CreateRoomDto) {
    const roomCount = await this.prisma.rooms.count({
      where: {
        createdBy: playerId,
        deletedAt: null,
      },
    });
    const maxRoomPerPlayer = 3;
    if (roomCount >= maxRoomPerPlayer) {
      throw new ForbiddenException(
        `Player ${playerId} has reached the room creation limit.`,
      );
    }
    const createRoom = await this.prisma.rooms.create({
      data: {
        name: createRoomDto.name,
        colyseusRoomId: createRoomDto.colyseusRoomId,
        createdBy: playerId,
      },
    });
    return createRoom;
  }

  async findAll() {
    const rooms = await this.prisma.rooms.findMany();
    return rooms;
  }

  async findCurrent() {
    const currentRooms = await this.prisma.rooms.findMany({
      where: { deletedAt: null },
    });
    const liveRooms = await matchMaker.query({ name: 'undercover' });
    const liveRoomsById = new Map(liveRooms.map((live) => [live.roomId, live]));
    return currentRooms.map((room) => {
      const live = room.colyseusRoomId
        ? liveRoomsById.get(room.colyseusRoomId)
        : undefined;
      const metadata = live?.metadata as { playerCount?: number } | undefined;
      return {
        ...room,
        playerCount: metadata?.playerCount ?? 0,
        maxClients: live?.maxClients ?? MAX_CLIENTS,
      };
    });
  }

  async isBanned(colyseusRoomId: string, playerId: number) {
    const live = await matchMaker.getRoomById(colyseusRoomId);
    const metadata = live?.metadata as
      { bannedPlayerIds?: number[] } | undefined;
    return metadata?.bannedPlayerIds?.includes(playerId) ?? false;
  }

  async findOne(id: number) {
    const room = await this.prisma.rooms.findUnique({
      where: { id: id, deletedAt: null },
    });
    if (!room) throw new NotFoundException('Room does not exist');
    return room;
  }

  async countActiv() {
    const i = await this.prisma.rooms.count({
      where: { deletedAt: null },
    });
    return i;
  }

  async getGames(id: number) {
    const room = await this.prisma.rooms.findUnique({
      where: { id: id, deletedAt: null },
      include: { games: true },
    });
    if (!room) throw new NotFoundException('Room does not exist');
    return room.games;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const updateRoom = await this.prisma.rooms.update({
      where: { id: id, deletedAt: null },
      data: {
        name: updateRoomDto.name,
      },
    });
    return updateRoom;
  }

  async remove(id: number) {
    const deleteRoom = await this.prisma.rooms.update({
      where: { id: id, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
    return deleteRoom;
  }
}
