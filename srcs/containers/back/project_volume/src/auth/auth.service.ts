import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
    const existingName = await this.prisma.player.findUnique({
      where: { name: dto.name },
    });
    if (existingName) throw new ConflictException('Username already taken');
    const hashed = await bcrypt.hash(dto.password, 10);
    const player = await this.prisma.player.create({
      data: { email: dto.email, name: dto.name, password: hashed },
    });
    return this.signToken(player.id, player.email, player.name);
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
    return this.signToken(player.id, player.email, player.name);
  }

  private signToken(sub: number, email: string, name: string) {
    return { accessToken: this.jwtService.sign({ sub, email, name }) };
  }
}
