import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class RoomService {
  async create(player_id: number, createRoomDto: CreateRoomDto) {
    const roomCount = await prisma.rooms.count({
      where: {
        createdBy: player_id,
        deletedAt: null,
      },
    });

    const max_room_per_player = 3;

    if (roomCount >= max_room_per_player) {
      throw new ForbiddenException(
        `Player ${player_id} has reached the room creation limit.`,
      );
    }

    const createRoom = await prisma.rooms.create({
      data: {
        name: createRoomDto.name,
        createdBy: player_id,
      },
    });

    return createRoom;
  }

  async findAll() {
    const rooms = await prisma.rooms.findMany();
    return rooms;
  }

  async findOne(id: number) {
    const room = await prisma.rooms.findUnique({
      where: { id: id },
    });
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const updateRoom = await prisma.rooms.update({
      where: { id: id },
      data: {
        name: updateRoomDto.name,
      },
    });
    return updateRoom;
  }

  async remove(id: number) {
    const deleteRoom = await prisma.rooms.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
    return deleteRoom;
  }
}
