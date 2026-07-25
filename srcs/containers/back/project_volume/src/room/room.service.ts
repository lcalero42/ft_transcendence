import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class RoomService {
  async create(createRoomDto: CreateRoomDto) {
    const createRoom = await prisma.rooms.create({
      data: {
        name: createRoomDto.name,
        created_by: createRoomDto.created_by,
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
    const deleteRoom = await prisma.rooms.delete({
      where: { id: id },
    });
    return deleteRoom;
  }
}
