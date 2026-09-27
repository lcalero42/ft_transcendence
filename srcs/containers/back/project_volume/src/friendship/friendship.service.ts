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
import { notifyPlayer } from '../colyseus/presence-pubsub';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async create(createFriendshipDto: CreateFriendshipDto, id: number) {
    const addressee = await this.prisma.player.findFirst({
      where: {
        name: createFriendshipDto.name,
        deletedAt: null,
      },
    });
    if (!addressee) throw new NotFoundException('Player not found');
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: id, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: id },
        ],
      },
    });
    if (existingFriendship !== null)
      throw new ConflictException('Friendship already exists');
    else if (addressee.id === id)
      throw new BadRequestException("You can't be friend with yourself");

    const createFriendship = await this.prisma.friendship.create({
      data: {
        requesterId: id,
        addresseeId: addressee.id,
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    notifyPlayer(addressee.id, 'friendRequest', {
      friendshipId: createFriendship.id,
      fromName: createFriendship.requester.name,
    });
    return createFriendship;
  }

  async findAll(playerId: number, status?: FriendshipStatus) {
    return this.prisma.friendship.findMany({
      where: {
        status,
        OR: [{ requesterId: playerId }, { addresseeId: playerId }],
        requester: { deletedAt: null },
        addressee: { deletedAt: null },
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
        requester: { deletedAt: null },
        addressee: { deletedAt: null },
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
    const updated = await this.prisma.friendship.update({
      where: { id, status: from },
      data:
        to === FriendshipStatus.BLOCKED
          ? { status: to, requesterId: playerId, addresseeId: otherId }
          : { status: to },
    });
    if (to === FriendshipStatus.ACCEPTED) {
      notifyPlayer(friendship.requesterId, 'friendRequestAccepted', {
        friendshipId: updated.id,
        fromName: friendship.addressee.name,
      });
    }
    return updated;
  }

  async remove(id: number, playerId: number) {
    const friendship = await this.findOne(id, playerId);

    if (
      friendship.status === FriendshipStatus.BLOCKED &&
      friendship.requesterId !== playerId
    )
      throw new ForbiddenException('Only the blocker can remove a block');

    return this.prisma.friendship.delete({
      where: { id, status: friendship.status },
    });
  }
}
