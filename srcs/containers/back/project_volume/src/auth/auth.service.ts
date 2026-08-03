import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingEmail = await prisma.player.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    const existingName = await prisma.player.findUnique({
        where: { name: dto.name },
    });
    if (existingName)
        throw new ConflictException('Username already taken');
    const hashed = await bcrypt.hash(dto.password, 10);
    const player = await prisma.player.create({
      data: { email: dto.email, name: dto.name, password: hashed },
    });
    return this.signToken(player.id, player.email);
  }

  async login(dto: LoginDto) {
    const player = await prisma.player.findUnique({
      where: { email: dto.email },
    });
    if (!player || !(await bcrypt.compare(dto.password, player.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(player.id, player.email);
  }

  private signToken(sub: number, email: string) {
    return { accessToken: this.jwtService.sign({ sub, email }) };
  }
}
