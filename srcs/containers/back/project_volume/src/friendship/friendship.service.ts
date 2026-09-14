import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { PrismaService } from '../prisma.service';
import { FriendshipStatus } from '../generated/prisma/enums';

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

  async findAll(playerId: number, status?: FriendshipStatus) {
    return this.prisma.friendship.findMany({
      where: {
        status,
        OR: [{ requesterId: playerId }, { addresseeId: playerId }],
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true } },
        addressee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async findOne(id: number, playerId: number) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        id,
        OR: [{ requesterId: playerId }, { addresseeId: playerId }],
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true } },
        addressee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    if (!friendship) throw new NotFoundException('Friendship not found');
    return friendship;
  }

  async update(id: number, dto: UpdateFriendshipDto, playerId: number) {
    const friendship = await this.findOne(id, playerId);
    const isAddressee = friendship.addresseeId === playerId;
    const { status: from } = friendship;
    const to = dto.status;

    const allowed =
      (from === FriendshipStatus.PENDING &&
        isAddressee &&
        (to === FriendshipStatus.ACCEPTED ||
          to === FriendshipStatus.DECLINED)) ||
      (from !== FriendshipStatus.BLOCKED && to === FriendshipStatus.BLOCKED);

    if (!allowed)
      throw new ForbiddenException(
        `Cannot change status from ${from} to ${to}`,
      );

    const otherId = isAddressee
      ? friendship.requesterId
      : friendship.addresseeId;
    return this.prisma.friendship.update({
      where: { id, status: from },
      data:
        to === FriendshipStatus.BLOCKED
          ? { status: to, requesterId: playerId, addresseeId: otherId }
          : { status: to },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} friendship`;
  }
}
