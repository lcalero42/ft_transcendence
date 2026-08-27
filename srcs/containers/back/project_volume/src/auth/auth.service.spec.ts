import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
	let service: AuthService;
	let prismaMock: DeepMockProxy<PrismaClient>;
	let jwtServiceMock: { sign: jest.Mock };

	beforeEach(async () => {
		prismaMock = mockDeep<PrismaClient>();
		jwtServiceMock = { sign: jest.fn() };

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
				aboutMe: null,
				avatarUrl: null,
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

			expect(result).toEqual({ accessToken: 'fake-jwt-token' });
		});

		it('should throw a ConflictException when the email is already registered', async () => {
			prismaMock.player.findUnique.mockResolvedValue({
				id: 2,
				name: 'ExistingBob',
				email: 'bob@test.com',
				password: 'some-bcrypt-hash',
				aboutMe: null,
				avatarUrl: null,
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

	});
});

