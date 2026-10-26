import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let jwtServiceMock: { sign: jest.Mock; decode: jest.Mock };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    prismaMock.player.findUniqueOrThrow.mockResolvedValue({
      tokenVersion: 0,
    } as never);
    jwtServiceMock = { sign: jest.fn(), decode: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new player and return an access token', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);
      prismaMock.player.create.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'some-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');

      // Act
      const result = await service.register({
        email: 'bob@test.com',
        name: 'Bob',
        password: 'PlaintextPassword1!',
      });

      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        user: { id: 1, email: 'bob@test.com' },
      });
    });

    it('should throw a ConflictException when the email is already registered', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 2,
        name: 'ExistingBob',
        email: 'bob@test.com',
        password: 'some-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });

      await expect(
        service.register({
          email: 'bob@test.com',
          name: 'Bob',
          password: 'PlaintextPassword1!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.player.create).not.toHaveBeenCalled();
    });

    it('should throw a ConflictException when the username is already registered', async () => {
      prismaMock.player.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 2,
          name: 'Bob',
          email: 'differentemail@test.com',
          password: 'some-bcrypt-hash',
          googleId: null,
          discordId: null,
          isGuest: false,
          aboutMe: null,
          avatarUrl: null,
          isAdmin: false,
          tokenVersion: 0,
          createdAt: new Date(),
          deletedAt: null,
        });

      await expect(
        service.register({
          email: 'anotherbob@test.com',
          name: 'Bob',
          password: 'PlaintextPassword1!',
        }),
      ).rejects.toThrow('Username already taken');

      expect(prismaMock.player.create).not.toHaveBeenCalled();
    });

    it('should store a hashed password, not the raw one', async () => {
      jest.mocked(bcrypt.hash).mockResolvedValue('mocked-hash' as never);
      prismaMock.player.create.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'irrelevant-for-this-test',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');

      await service.register({
        email: 'bob@test.com',
        name: 'Bob',
        password: 'PlaintextPassword1!',
      });

      const createCallArgs = prismaMock.player.create.mock.calls[0][0];
      expect(createCallArgs.data.password).not.toBe('PlaintextPassword1!');
    });
  });

  describe('guest', () => {
    it('should create a guest player without email and return an access token', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);
      prismaMock.player.create.mockResolvedValue({
        id: 3,
        name: 'Zed',
        email: null,
        password: 'some-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: true,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');

      const result = await service.guest({ name: 'Zed' });

      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        user: { id: 3, email: null },
      });
      const createCallArgs = prismaMock.player.create.mock.calls[0][0];
      expect(createCallArgs.data).toMatchObject({ name: 'Zed', isGuest: true });
      expect(createCallArgs.data.email).toBeUndefined();
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 3,
        email: null,
        ver: 0,
      });
    });

    it('should throw a ConflictException when the name is already taken', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 1,
        name: 'Zed',
        email: 'zed@test.com',
        password: 'some-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });

      await expect(service.guest({ name: 'Zed' })).rejects.toThrow(
        'Username already taken',
      );

      expect(prismaMock.player.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return an access token when credentials are valid', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'stored-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login({
        email: 'bob@test.com',
        password: 'CorrectPassword1!',
      });

      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        user: { id: 1, email: 'bob@test.com' },
      });
      expect(result.expires).toBeUndefined();
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'bob@test.com',
        ver: 0,
      });
    });
    it('should embed the current tokenVersion in the token', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'stored-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 4,
        createdAt: new Date(),
        deletedAt: null,
      });
      prismaMock.player.findUniqueOrThrow.mockResolvedValue({
        tokenVersion: 4,
      } as never);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');

      await service.login({
        email: 'bob@test.com',
        password: 'CorrectPassword1!',
      });

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'bob@test.com',
        ver: 4,
      });
    });
    it('should sign a long-lived token when rememberMe is set', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'stored-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtServiceMock.sign.mockReturnValue('fake-jwt-token');
      jwtServiceMock.decode.mockReturnValue({ exp: 1_900_000_000 });

      const result = await service.login({
        email: 'bob@test.com',
        password: 'CorrectPassword1!',
        rememberMe: true,
      });

      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        expires: new Date(1_900_000_000 * 1000),
        user: { id: 1, email: 'bob@test.com' },
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        { sub: 1, email: 'bob@test.com', ver: 0 },
        { expiresIn: '30d' },
      );
    });
    it('should throw an UnauthorizedException when the password is wrong', async () => {
      prismaMock.player.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bob',
        email: 'bob@test.com',
        password: 'stored-bcrypt-hash',
        googleId: null,
        discordId: null,
        isGuest: false,
        aboutMe: null,
        avatarUrl: null,
        isAdmin: false,
        tokenVersion: 0,
        createdAt: new Date(),
        deletedAt: null,
      });
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'bob@test.com', password: 'WrongPassword1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw an UnauthorizedException when the email does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'AnyPassword1!' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should bump the tokenVersion so previously issued tokens die', async () => {
      await service.logout(1);

      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { tokenVersion: { increment: 1 } },
      });
    });
  });
});
