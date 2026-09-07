import { Injectable } from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendshipService {

  constructor(private prisma: PrismaService) {}

  async create(createFriendshipDto: CreateFriendshipDto, id: number) {
    const createFriendShip = await this.prisma.friendship.create({
      data: {
        requesterId: id,
        addresseeId: createFriendshipDto.addressee,
      },
    });
    return createFriendShip;
  }

  findAll() {
    return `This action returns all friendship`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendship`;
  }

  update(id: number, updateFriendshipDto: UpdateFriendshipDto) {
    return `This action updates a #${id} friendship`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendship`;
  }
}
