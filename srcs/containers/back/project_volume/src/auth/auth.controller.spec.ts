import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth/oauth.service';
import { PrismaService } from '../prisma.service';
import type { AuthenticatedRequest } from '../common/authenticated-request';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

function mockResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response & { cookie: jest.Mock; clearCookie: jest.Mock };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let res: ReturnType<typeof mockResponse>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: OAuthService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    res = mockResponse();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should set the session cookie and return the user without the token', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue({
        accessToken: 'fake-jwt-token',
        user: { id: 1, email: 'bob@test.com' },
      });

      const dto = {
        email: 'bob@test.com',
        name: 'Bob',
        password: 'PlaintextPassword1!',
      };
      const result = await controller.register(dto, res);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'fake-jwt-token',
        {
          ...COOKIE_OPTIONS,
          expires: undefined,
        },
      );
      expect(result).toEqual({ id: 1, email: 'bob@test.com' });
    });
  });

  describe('login', () => {
    it('should set a persistent cookie when the session expires', async () => {
      const expires = new Date('2030-01-01T00:00:00Z');
      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken: 'fake-jwt-token',
        expires,
        user: { id: 1, email: 'bob@test.com' },
      });

      const dto = {
        email: 'bob@test.com',
        password: 'CorrectPassword1!',
        rememberMe: true,
      };
      const result = await controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'fake-jwt-token',
        {
          ...COOKIE_OPTIONS,
          expires,
        },
      );
      expect(result).toEqual({ id: 1, email: 'bob@test.com' });
    });
  });

  describe('logout', () => {
    it('should revoke issued tokens and clear the cookie', async () => {
      const logoutSpy = jest
        .spyOn(authService, 'logout')
        .mockResolvedValue(undefined);
      const req = { user: { id: 1 } } as AuthenticatedRequest;

      await controller.logout(req, res);

      expect(logoutSpy).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        COOKIE_OPTIONS,
      );
    });
  });
});
