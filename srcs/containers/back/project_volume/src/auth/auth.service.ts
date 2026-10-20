import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';

// A precomputed bcrypt hash with no matching plaintext, compared against on a
// login miss so the response time doesn't reveal whether the email exists.
const DUMMY_PASSWORD_HASH =
  '$2b$10$6Q5D0vqYWA5tSynigYdJZed9BeYujQsIBIMl7bXra16kqaaGSepiG';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.player.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    await this.assertNameAvailable(dto.name);
    const hashed = await bcrypt.hash(dto.password, 10);
    const player = await this.prisma.player.create({
      data: { email: dto.email, name: dto.name, password: hashed },
    });
    return this.signToken(player.id, player.email);
  }

  async guest(dto: GuestDto) {
    await this.assertNameAvailable(dto.name);
    const hashed = await bcrypt.hash(randomUUID(), 10);
    const player = await this.prisma.player.create({
      data: { name: dto.name, password: hashed, isGuest: true },
    });
    return this.signToken(player.id, player.email);
  }

  async login(dto: LoginDto) {
    const player = await this.prisma.player.findUnique({
      where: { email: dto.email },
      omit: { password: false },
    });
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      player?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!player || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(player.id, player.email, dto.rememberMe);
  }

  private async assertNameAvailable(name: string) {
    const existingName = await this.prisma.player.findUnique({
      where: { name },
    });
    if (existingName) throw new ConflictException('Username already taken');
  }

  signToken(sub: number, email: string | null, remember = false) {
    const payload = { sub, email };
    const accessToken = remember
      ? this.jwtService.sign(payload, {
          expiresIn: (process.env.JWT_REMEMBER_EXPIRES_IN ??
            '30d') as StringValue,
        })
      : this.jwtService.sign(payload);
    return { accessToken };
  }
}
