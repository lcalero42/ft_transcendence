import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async create(createFriendshipDto: CreateFriendshipDto, id: number) {
    const addressee = await this.prisma.player.findUnique({
      where: {
        id: createFriendshipDto.addressee,
        deletedAt: null,
      },
    });
    if (!addressee) throw new NotFoundException('Addressee not found');
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: id, addresseeId: createFriendshipDto.addressee },
          { requesterId: createFriendshipDto.addressee, addresseeId: id },
        ],
      },
    });
    if (existingFriendship !== null)
      throw new ConflictException('Friendship already exists');
    else if (createFriendshipDto.addressee === id)
      throw new BadRequestException("You can't be friend with yourself");

    const createFriendship = await this.prisma.friendship.create({
      data: {
        requesterId: id,
        addresseeId: createFriendshipDto.addressee,
      },
    });
    return createFriendship;
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
