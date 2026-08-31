import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to AuthService.register with the request body', async () => {
      jest
        .spyOn(authService, 'register')
        .mockResolvedValue({ accessToken: 'fake-jwt-token' });

      const dto = {
        email: 'bob@test.com',
        name: 'Bob',
        password: 'PlaintextPassword1!',
      };
      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'fake-jwt-token' });
    });
  });

  describe('login', () => {
    it('should delegate to AuthService.login with the request body', async () => {
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ accessToken: 'fake-jwt-token' });

      const dto = { email: 'bob@test.com', password: 'CorrectPassword1!' };
      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'fake-jwt-token' });
    });
  });
});
