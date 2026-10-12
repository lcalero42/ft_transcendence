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
      ADMIN_EMAIL: 'admin@test.com',
      ADMIN_PASSWORD: 'admin-password',
    };
    prismaMock = mockDeep<PrismaClient>();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

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

  it('should upsert the admin account from the environment', async () => {
    await service.onApplicationBootstrap();

    expect(bcrypt.hash).toHaveBeenCalledWith('admin-password', 10);
    expect(prismaMock.player.upsert).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
      update: { password: 'hashed-password', isAdmin: true },
      create: {
        name: 'admin',
        email: 'admin@test.com',
        password: 'hashed-password',
        isAdmin: true,
      },
    });
  });

  it('should upsert every word pair by its civilian and undercover words', async () => {
    await service.onApplicationBootstrap();

    expect(prismaMock.word_Pair.upsert).toHaveBeenCalledTimes(
      WORD_PAIRS.length,
    );
    const [first] = WORD_PAIRS;
    expect(prismaMock.word_Pair.upsert).toHaveBeenCalledWith({
      where: {
        civilianWord_undercoverWord: {
          civilianWord: first.civilianWord,
          undercoverWord: first.undercoverWord,
        },
      },
      update: first,
      create: first,
    });
  });

  it('should fail when the admin credentials are missing', async () => {
    delete process.env.ADMIN_PASSWORD;

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'ADMIN_PASSWORD environment variable is not set',
    );
    expect(prismaMock.player.upsert).not.toHaveBeenCalled();
  });
});
