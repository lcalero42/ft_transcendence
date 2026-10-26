import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';
import { BootstrapService } from './bootstrap.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';
import { WORD_PAIRS } from './word-pairs.data';

jest.mock('bcrypt');

describe('BootstrapService', () => {
  let service: BootstrapService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  const env = process.env;

  beforeEach(async () => {
    process.env = {
      ...env,
      ADMINS:
        'alice:alice@test.com:alice-password\n\nbob:bob@test.com:bob:pass\n',
    };
    prismaMock = mockDeep<PrismaClient>();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    prismaMock.games.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.rooms.updateMany.mockResolvedValue({ count: 0 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
  });

  afterEach(() => {
    process.env = env;
  });

  it('should upsert every admin account from the environment by name', async () => {
    await service.onApplicationBootstrap();

    expect(prismaMock.player.upsert).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith('alice-password', 10);
    expect(prismaMock.player.upsert).toHaveBeenCalledWith({
      where: { name: 'alice' },
      update: {
        email: 'alice@test.com',
        password: 'hashed-password',
        isAdmin: true,
      },
      create: {
        name: 'alice',
        email: 'alice@test.com',
        password: 'hashed-password',
        isAdmin: true,
      },
    });
  });

  it('should keep colons inside the admin password', async () => {
    await service.onApplicationBootstrap();

    expect(bcrypt.hash).toHaveBeenCalledWith('bob:pass', 10);
  });

  it('should fail when an admin line is malformed', async () => {
    process.env.ADMINS = 'alice:alice@test.com';

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'ADMINS line 1 must be formatted as name:email:password',
    );
    expect(prismaMock.player.upsert).not.toHaveBeenCalled();
  });

  it('should seed the word pairs when the table is empty', async () => {
    prismaMock.word_Pair.count.mockResolvedValue(0);

    await service.onApplicationBootstrap();

    expect(prismaMock.word_Pair.createMany).toHaveBeenCalledWith({
      data: WORD_PAIRS,
    });
  });

  it('should not seed the word pairs when the table already has some', async () => {
    prismaMock.word_Pair.count.mockResolvedValue(3);

    await service.onApplicationBootstrap();

    expect(prismaMock.word_Pair.createMany).not.toHaveBeenCalled();
  });

  it('should close the rooms and games left open by a previous run', async () => {
    await service.onApplicationBootstrap();

    expect(prismaMock.games.updateMany).toHaveBeenCalledWith({
      where: { finishedAt: null },
      data: { status: 'aborted', finishedAt: expect.any(Date) as Date },
    });
    expect(prismaMock.rooms.updateMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      data: { deletedAt: expect.any(Date) as Date },
    });
  });

  it('should fail when the admin credentials are missing', async () => {
    delete process.env.ADMINS;

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'ADMINS environment variable is not set',
    );
    expect(prismaMock.player.upsert).not.toHaveBeenCalled();
  });
});
