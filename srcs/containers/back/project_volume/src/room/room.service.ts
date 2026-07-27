import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../generated/prisma/client'

@Injectable()
export class RoomService {
  async create(player_id: number, createRoomDto: CreateRoomDto) {

    const roomCount = await prisma.rooms.count({
      where: {
        created_by: player_id,
        deleted_at: null,
      },
    });

    const max_room_per_player = 3;

    if (roomCount >= 3) {
      throw new ForbiddenException(`Player ${player_id} has reached the room creation limit.`);
    }

    try {
      const createRoom = await prisma.rooms.create({
        data: {
          name: createRoomDto.name,
          created_by: player_id,
        },
      });
      return createRoom;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Room name "${createRoomDto.name}" is already taken.`);
      }
      throw error;
    }
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
        deleted_at: new Date()
      }
    });
    return deleteRoom;
  }
}
