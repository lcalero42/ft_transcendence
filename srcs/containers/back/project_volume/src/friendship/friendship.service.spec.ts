import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { FriendshipService } from './friendship.service';
import { PrismaService } from '../prisma.service';
import { FriendshipStatus, PrismaClient } from '../generated/prisma/client';
import { notifyPlayer, updateFriendship } from '../colyseus/presence-pubsub';

jest.mock('../colyseus/presence-pubsub');

const playerSelect = { select: { id: true, name: true, avatarUrl: true } };

function friendshipRow(
  status: FriendshipStatus,
  requesterId = 1,
  addresseeId = 2,
) {
  return {
    id: 5,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    requesterId,
    addresseeId,
    requester: {
      id: requesterId,
      name: `player${requesterId}`,
      avatarUrl: null,
    },
    addressee: {
      id: addresseeId,
      name: `player${addresseeId}`,
      avatarUrl: null,
    },
  };
}

describe('FriendshipService', () => {
  let service: FriendshipService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FriendshipService>(FriendshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const addressee = {
      id: 2,
      name: 'Bob',
      email: 'bob@test.com',
      password: 'password123',
      googleId: null,
      discordId: null,
      isGuest: false,
      aboutMe: null,
      avatarUrl: null,
      isAdmin: false,
      tokenVersion: 0,
      createdAt: new Date(),
      deletedAt: null,
    };

    it('should create a pending friendship request', async () => {
      const result = friendshipRow(FriendshipStatus.PENDING);
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(null);
      prismaMock.friendship.create.mockResolvedValue(result);

      expect(await service.create({ name: 'Bob' }, 1)).toBe(result);
      expect(prismaMock.player.findFirst).toHaveBeenCalledWith({
        where: { name: 'Bob', deletedAt: null },
      });
      expect(prismaMock.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { requesterId: 1, addresseeId: 2 },
            { requesterId: 2, addresseeId: 1 },
          ],
        },
      });
      expect(prismaMock.friendship.create).toHaveBeenCalledWith({
        data: { requesterId: 1, addresseeId: 2 },
        include: { requester: playerSelect },
      });
    });

    it('should throw a NotFoundException when the player does not exist', async () => {
      prismaMock.player.findFirst.mockResolvedValue(null);

      await expect(service.create({ name: 'Ghost' }, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.friendship.create).not.toHaveBeenCalled();
    });

    it('should throw a ConflictException naming the other player when they already sent a pending request', async () => {
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.PENDING, 2, 1),
      );

      await expect(service.create({ name: 'Bob' }, 1)).rejects.toThrow(
        'This player already sent you a friend request',
      );
      expect(prismaMock.friendship.create).not.toHaveBeenCalled();
    });

    it('should throw a ConflictException when resending a request that is still pending', async () => {
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.PENDING, 1, 2),
      );

      await expect(service.create({ name: 'Bob' }, 1)).rejects.toThrow(
        'You already have a pending friend request to this player',
      );
      expect(prismaMock.friendship.create).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when befriending yourself', async () => {
      prismaMock.player.findFirst.mockResolvedValue({ ...addressee, id: 1 });
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(service.create({ name: 'Bob' }, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.friendship.create).not.toHaveBeenCalled();
    });

    it('should revive a declined friendship back to pending instead of conflicting', async () => {
      const declined = friendshipRow(FriendshipStatus.DECLINED, 2, 1);
      const revived = friendshipRow(FriendshipStatus.PENDING);
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(declined);
      prismaMock.friendship.update.mockResolvedValue(revived);

      expect(await service.create({ name: 'Bob' }, 1)).toBe(revived);
      expect(prismaMock.friendship.update).toHaveBeenCalledWith({
        where: { id: declined.id },
        data: {
          status: FriendshipStatus.PENDING,
          requesterId: 1,
          addresseeId: 2,
        },
        include: { requester: playerSelect },
      });
      expect(prismaMock.friendship.create).not.toHaveBeenCalled();
    });

    it('should throw a 429 when the requester resends a declined request during the cooldown', async () => {
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.DECLINED, 1, 2),
      );

      await expect(service.create({ name: 'Bob' }, 1)).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
        response: { code: 'FRIEND_REQUEST_COOLDOWN' },
      });
      expect(prismaMock.friendship.update).not.toHaveBeenCalled();
      expect(notifyPlayer).not.toHaveBeenCalled();
    });

    it('should revive a declined request resent by the requester once the cooldown is over', async () => {
      const declined = {
        ...friendshipRow(FriendshipStatus.DECLINED, 1, 2),
        updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      };
      const revived = friendshipRow(FriendshipStatus.PENDING);
      prismaMock.player.findFirst.mockResolvedValue(addressee);
      prismaMock.friendship.findFirst.mockResolvedValue(declined);
      prismaMock.friendship.update.mockResolvedValue(revived);

      expect(await service.create({ name: 'Bob' }, 1)).toBe(revived);
      expect(notifyPlayer).toHaveBeenCalledWith(2, 'friendRequest', {
        friendshipId: revived.id,
        fromName: revived.requester.name,
      });
    });
  });

  describe('findAll', () => {
    it('should return the player friendships filtered by status', async () => {
      const result = [friendshipRow(FriendshipStatus.ACCEPTED)];
      prismaMock.friendship.findMany.mockResolvedValue(result);

      expect(await service.findAll(1, FriendshipStatus.ACCEPTED)).toBe(result);
      expect(prismaMock.friendship.findMany).toHaveBeenCalledWith({
        where: {
          status: FriendshipStatus.ACCEPTED,
          OR: [{ requesterId: 1 }, { addresseeId: 1 }],
          requester: { deletedAt: null },
          addressee: { deletedAt: null },
        },
        include: { requester: playerSelect, addressee: playerSelect },
      });
    });

    it('should return every player friendship when no status is given', async () => {
      const result = [
        friendshipRow(FriendshipStatus.ACCEPTED),
        friendshipRow(FriendshipStatus.PENDING, 3, 1),
      ];
      prismaMock.friendship.findMany.mockResolvedValue(result);

      expect(await service.findAll(1)).toBe(result);
      expect(prismaMock.friendship.findMany).toHaveBeenCalledWith({
        where: {
          status: undefined,
          OR: [{ requesterId: 1 }, { addresseeId: 1 }],
          requester: { deletedAt: null },
          addressee: { deletedAt: null },
        },
        include: { requester: playerSelect, addressee: playerSelect },
      });
    });
  });

  describe('findOne', () => {
    it('should return a friendship the player is part of', async () => {
      const result = friendshipRow(FriendshipStatus.ACCEPTED);
      prismaMock.friendship.findFirst.mockResolvedValue(result);

      expect(await service.findOne(5, 1)).toBe(result);
      expect(prismaMock.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          id: 5,
          OR: [{ requesterId: 1 }, { addresseeId: 1 }],
          requester: { deletedAt: null },
          addressee: { deletedAt: null },
        },
        include: { requester: playerSelect, addressee: playerSelect },
      });
    });

    it('should throw a NotFoundException when the friendship does not exist or the player is not part of it', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(service.findOne(5, 3)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should let the addressee accept a pending request', async () => {
      const result = friendshipRow(FriendshipStatus.ACCEPTED);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.PENDING),
      );
      prismaMock.friendship.update.mockResolvedValue(result);

      expect(
        await service.update(5, { status: FriendshipStatus.ACCEPTED }, 2),
      ).toBe(result);
      expect(prismaMock.friendship.update).toHaveBeenCalledWith({
        where: { id: 5, status: FriendshipStatus.PENDING },
        data: { status: FriendshipStatus.ACCEPTED },
      });
      expect(updateFriendship).toHaveBeenCalledWith(2, 1, true);
    });

    it('should let the addressee decline a pending request', async () => {
      const result = friendshipRow(FriendshipStatus.DECLINED);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.PENDING),
      );
      prismaMock.friendship.update.mockResolvedValue(result);

      expect(
        await service.update(5, { status: FriendshipStatus.DECLINED }, 2),
      ).toBe(result);
      expect(prismaMock.friendship.update).toHaveBeenCalledWith({
        where: { id: 5, status: FriendshipStatus.PENDING },
        data: { status: FriendshipStatus.DECLINED },
      });
      expect(updateFriendship).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the requester accepts its own request', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.PENDING),
      );

      await expect(
        service.update(5, { status: FriendshipStatus.ACCEPTED }, 1),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.friendship.update).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when accepting a non pending friendship', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.DECLINED),
      );

      await expect(
        service.update(5, { status: FriendshipStatus.ACCEPTED }, 2),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.friendship.update).not.toHaveBeenCalled();
    });

    it('should store the blocker as the requester when blocking', async () => {
      const result = friendshipRow(FriendshipStatus.BLOCKED, 2, 1);
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.ACCEPTED),
      );
      prismaMock.friendship.update.mockResolvedValue(result);

      expect(
        await service.update(5, { status: FriendshipStatus.BLOCKED }, 2),
      ).toBe(result);
      expect(prismaMock.friendship.update).toHaveBeenCalledWith({
        where: { id: 5, status: FriendshipStatus.ACCEPTED },
        data: {
          status: FriendshipStatus.BLOCKED,
          requesterId: 2,
          addresseeId: 1,
        },
      });
      expect(updateFriendship).toHaveBeenCalledWith(2, 1, false);
    });

    it('should throw a ForbiddenException when the friendship is already blocked', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.BLOCKED),
      );

      await expect(
        service.update(5, { status: FriendshipStatus.BLOCKED }, 2),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.friendship.update).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException when the friendship does not exist', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(
        service.update(404, { status: FriendshipStatus.ACCEPTED }, 2),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.friendship.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should let either player remove a non blocked friendship', async () => {
      const friendship = friendshipRow(FriendshipStatus.ACCEPTED);
      prismaMock.friendship.findFirst.mockResolvedValue(friendship);
      prismaMock.friendship.delete.mockResolvedValue(friendship);

      expect(await service.remove(5, 2)).toBe(friendship);
      expect(prismaMock.friendship.delete).toHaveBeenCalledWith({
        where: { id: 5, status: FriendshipStatus.ACCEPTED },
      });
      expect(updateFriendship).toHaveBeenCalledWith(2, 1, false);
    });

    it('should let the blocker remove a block', async () => {
      const friendship = friendshipRow(FriendshipStatus.BLOCKED);
      prismaMock.friendship.findFirst.mockResolvedValue(friendship);
      prismaMock.friendship.delete.mockResolvedValue(friendship);

      expect(await service.remove(5, 1)).toBe(friendship);
      expect(prismaMock.friendship.delete).toHaveBeenCalledWith({
        where: { id: 5, status: FriendshipStatus.BLOCKED },
      });
    });

    it('should throw a ForbiddenException when the blocked player removes the block', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(
        friendshipRow(FriendshipStatus.BLOCKED),
      );

      await expect(service.remove(5, 2)).rejects.toThrow(ForbiddenException);
      expect(prismaMock.friendship.delete).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException when the friendship does not exist', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(service.remove(404, 1)).rejects.toThrow(NotFoundException);
      expect(prismaMock.friendship.delete).not.toHaveBeenCalled();
    });
  });
});
