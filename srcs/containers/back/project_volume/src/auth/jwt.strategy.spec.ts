import { UnauthorizedException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    prismaMock = mockDeep<PrismaService>();
    strategy = new JwtStrategy(prismaMock);
  });

  function mockPlayer(tokenVersion: number) {
    prismaMock.player.findUnique.mockResolvedValue({
      id: 1,
      email: 'bob@test.com',
      isGuest: false,
      isAdmin: false,
      tokenVersion,
    } as never);
  }

  it('should accept a token whose version matches the player', async () => {
    mockPlayer(2);

    await expect(
      strategy.validate({ sub: 1, email: 'bob@test.com', ver: 2 }),
    ).resolves.toEqual({
      id: 1,
      email: 'bob@test.com',
      isGuest: false,
      isAdmin: false,
    });
  });

  it('should reject a token issued before the last logout', async () => {
    mockPlayer(3);

    await expect(
      strategy.validate({ sub: 1, email: 'bob@test.com', ver: 2 }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a token without a version', async () => {
    mockPlayer(0);

    await expect(
      strategy.validate({ sub: 1, email: 'bob@test.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a deleted or unknown player', async () => {
    prismaMock.player.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 1, email: 'bob@test.com', ver: 0 }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
