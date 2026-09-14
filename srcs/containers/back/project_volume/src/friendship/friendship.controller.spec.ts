import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { PrismaService } from '../prisma.service';
import { FriendshipStatus } from '../generated/prisma/enums';
import type { AuthenticatedRequest } from '../common/authenticated-request';

function requestAs(id: number, email: string): AuthenticatedRequest {
  return { user: { id, email } } as AuthenticatedRequest;
}

function friendshipRow(status: FriendshipStatus) {
  return {
    id: 5,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    requesterId: 3,
    addresseeId: 4,
    requester: { id: 3, name: 'Alice', avatarUrl: null },
    addressee: { id: 4, name: 'Bob', avatarUrl: null },
  };
}

describe('FriendshipController', () => {
  let friendshipController: FriendshipController;
  let friendshipService: FriendshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendshipController],
      providers: [FriendshipService, { provide: PrismaService, useValue: {} }],
    }).compile();

    friendshipController =
      module.get<FriendshipController>(FriendshipController);
    friendshipService = module.get<FriendshipService>(FriendshipService);
  });

  it('friendshipController should be defined', () => {
    expect(friendshipController).toBeDefined();
  });

  it('friendshipService should be defined', () => {
    expect(friendshipService).toBeDefined();
  });

  describe('create', () => {
    it('should create a friendship request from the logged player', async () => {
      const createDto = { addressee: 4 };
      const result = friendshipRow(FriendshipStatus.PENDING);
      jest
        .spyOn(friendshipService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(3, 'alice@test.com');
      expect(await friendshipController.create(createDto, req)).toBe(result);
      expect(friendshipService.create).toHaveBeenCalledWith(createDto, 3);
    });
  });

  describe('findAll', () => {
    it('should return the logged player friendships filtered by status', async () => {
      const result = [friendshipRow(FriendshipStatus.ACCEPTED)];
      jest
        .spyOn(friendshipService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(3, 'alice@test.com');
      expect(
        await friendshipController.findAll(req, FriendshipStatus.ACCEPTED),
      ).toBe(result);
      expect(friendshipService.findAll).toHaveBeenCalledWith(
        3,
        FriendshipStatus.ACCEPTED,
      );
    });

    it('should return every friendship when no status is given', async () => {
      const result = [
        friendshipRow(FriendshipStatus.ACCEPTED),
        friendshipRow(FriendshipStatus.PENDING),
      ];
      jest
        .spyOn(friendshipService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(3, 'alice@test.com');
      expect(await friendshipController.findAll(req)).toBe(result);
      expect(friendshipService.findAll).toHaveBeenCalledWith(3, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a friendship of the logged player', async () => {
      const result = friendshipRow(FriendshipStatus.ACCEPTED);
      jest
        .spyOn(friendshipService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(3, 'alice@test.com');
      expect(await friendshipController.findOne(5, req)).toBe(result);
      expect(friendshipService.findOne).toHaveBeenCalledWith(5, 3);
    });
  });

  describe('update', () => {
    it('should update a friendship status and return it', async () => {
      const updateDto = { status: FriendshipStatus.ACCEPTED };
      const result = friendshipRow(FriendshipStatus.ACCEPTED);
      jest
        .spyOn(friendshipService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(4, 'bob@test.com');
      expect(await friendshipController.update(5, updateDto, req)).toBe(result);
      expect(friendshipService.update).toHaveBeenCalledWith(5, updateDto, 4);
    });
  });

  describe('remove', () => {
    it('should remove a friendship and return it', async () => {
      const result = friendshipRow(FriendshipStatus.ACCEPTED);
      jest
        .spyOn(friendshipService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      const req = requestAs(3, 'alice@test.com');
      expect(await friendshipController.remove(5, req)).toBe(result);
      expect(friendshipService.remove).toHaveBeenCalledWith(5, 3);
    });
  });
});
