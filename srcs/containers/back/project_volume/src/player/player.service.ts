import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { prisma } from '../../lib/prisma'

@Injectable()
export class PlayerService {
  async create(createPlayerDto: CreatePlayerDto) {
    return 'This action adds a new player';
  }

  async findAll() {
    const players = await prisma.player.findMany();
    return players;
  }

  async findOne(id: number) {
    return `This action returns a #${id} player`;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  async remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
