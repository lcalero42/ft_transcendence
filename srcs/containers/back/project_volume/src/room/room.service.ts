import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class RoomService {
  async create(createRoomDto: CreateRoomDto) {
    return 'This action adds a new room';
  }

  async findAll() {
    const rooms = await prisma.rooms.findMany();
    return rooms;
  }

  async findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  async remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
