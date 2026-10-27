import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { PrismaService } from '../prisma.service';
import { FriendshipStatus } from '../generated/prisma/enums';
import { notifyPlayer, updateFriendship } from '../colyseus/presence-pubsub';
import { apiError } from '../common/api-error';

const playerSelect = { select: { id: true, name: true, avatarUrl: true } };
const DECLINED_REQUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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
    if (!addressee)
      throw new NotFoundException(
        apiError('PLAYER_NOT_FOUND', 'Player not found'),
      );
    if (addressee.id === id)
      throw new BadRequestException(
        apiError('FRIEND_SELF', "You can't be friend with yourself"),
      );
    if (addressee.isGuest)
      throw new ForbiddenException(
        apiError('FRIEND_GUEST', "You can't be friend with a guest"),
      );

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: id, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: id },
        ],
      },
    });

    if (existingFriendship?.status === FriendshipStatus.DECLINED) {
      if (
        existingFriendship.requesterId === id &&
        Date.now() - existingFriendship.updatedAt.getTime() <
          DECLINED_REQUEST_COOLDOWN_MS
      )
        throw new HttpException(
          apiError(
            'FRIEND_REQUEST_COOLDOWN',
            'You must wait before sending another friend request to this player',
          ),
          HttpStatus.TOO_MANY_REQUESTS,
        );
      return this.reviveFriendship(existingFriendship.id, id, addressee.id);
    }

    if (existingFriendship?.status === FriendshipStatus.PENDING)
      throw new ConflictException(
        existingFriendship.requesterId === id
          ? apiError(
              'FRIEND_REQUEST_PENDING',
              'You already have a pending friend request to this player',
            )
          : apiError(
              'FRIEND_REQUEST_RECEIVED',
              'This player already sent you a friend request',
            ),
      );

    if (existingFriendship !== null)
      throw new ConflictException(
        apiError('FRIENDSHIP_EXISTS', 'Friendship already exists'),
      );

    const createFriendship = await this.prisma.friendship.create({
      data: {
        requesterId: id,
        addresseeId: addressee.id,
      },
      include: { requester: playerSelect },
    });
    notifyPlayer(addressee.id, 'friendRequest', {
      friendshipId: createFriendship.id,
      fromName: createFriendship.requester.name,
    });
    return createFriendship;
  }

  private async reviveFriendship(
    friendshipId: number,
    requesterId: number,
    addresseeId: number,
  ) {
    const revivedFriendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: FriendshipStatus.PENDING,
        requesterId,
        addresseeId,
      },
      include: { requester: playerSelect },
    });
    notifyPlayer(addresseeId, 'friendRequest', {
      friendshipId: revivedFriendship.id,
      fromName: revivedFriendship.requester.name,
    });
    return revivedFriendship;
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
        requester: playerSelect,
        addressee: playerSelect,
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
        requester: playerSelect,
        addressee: playerSelect,
      },
    });
    if (!friendship)
      throw new NotFoundException(
        apiError('FRIENDSHIP_NOT_FOUND', 'Friendship not found'),
      );
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
        apiError(
          'FRIENDSHIP_INVALID_TRANSITION',
          `Cannot change status from ${from} to ${to}`,
        ),
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
    if (to === FriendshipStatus.ACCEPTED || to === FriendshipStatus.BLOCKED) {
      updateFriendship(playerId, otherId, to === FriendshipStatus.ACCEPTED);
    }
    if (to === FriendshipStatus.ACCEPTED) {
      notifyPlayer(friendship.requesterId, 'friendRequestAccepted', {
        friendshipId: updated.id,
        fromName: friendship.addressee.name,
      });
    } else if (to === FriendshipStatus.DECLINED) {
      notifyPlayer(friendship.requesterId, 'friendRequestDeclined', {
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
      throw new ForbiddenException(
        apiError(
          'ONLY_BLOCKER_CAN_UNBLOCK',
          'Only the blocker can remove a block',
        ),
      );

    const deleted = await this.prisma.friendship.delete({
      where: { id, status: friendship.status },
    });

    const otherId =
      friendship.requesterId === playerId
        ? friendship.addresseeId
        : friendship.requesterId;

    if (friendship.status === FriendshipStatus.PENDING) {
      notifyPlayer(otherId, 'friendRequestCancelled', {
        friendshipId: deleted.id,
      });
    } else if (friendship.status === FriendshipStatus.ACCEPTED) {
      updateFriendship(playerId, otherId, false);
      notifyPlayer(otherId, 'friendRemoved', {
        friendshipId: deleted.id,
      });
    }

    return deleted;
  }
}
