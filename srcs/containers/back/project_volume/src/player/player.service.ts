import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class PlayerService {
  async create(createPlayerDto: CreatePlayerDto) {
    const createPlayer = await prisma.player.create({
      data: {
        email: createPlayerDto.email,
        name: createPlayerDto.name,
      },
    });
    return createPlayer;
  }

  async findAll() {
    const players = await prisma.player.findMany();
    return players;
  }

  async findOne(id: number) {
    const player = await prisma.player.findUnique({
      where: { id: id },
    });
    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const updatePlayer = await prisma.player.update({
      where: { id : id },
      data: {
        email: updatePlayerDto.email,
        name: updatePlayerDto.name,
       },
    });
    return updatePlayer;
  }

  async remove(id: number) {
    const deleteUser = await prisma.player.delete({
    where: {
        id: id,
      },
    });
    return deleteUser;
  }
}
