import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

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
    return currentRooms;
  }

  async findOne(id: number) {
    const room = await this.prisma.rooms.findUnique({
      where: { id: id },
    });
    return room;
  }

  async getGames(id: number) {
    const games = await this.prisma.rooms.findUnique({
      where: { id: id },
      include: { games: true },
    });
    return games?.games ?? [];
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const updateRoom = await this.prisma.rooms.update({
      where: { id: id },
      data: {
        name: updateRoomDto.name,
      },
    });
    return updateRoom;
  }

  async remove(id: number) {
    const deleteRoom = await this.prisma.rooms.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
    return deleteRoom;
  }
}
