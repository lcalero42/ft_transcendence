import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    const hashed = await bcrypt.hash(password, 10);
    const player = await prisma.player.create({
      data: { email, name, password: hashed },
    });
    return this.signToken(player.id, player.email);
  }

  async login(email: string, password: string) {
    const player = await prisma.player.findUnique({ where: { email } });
    if (!player || !(await bcrypt.compare(password, player.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(player.id, player.email);
  }

  private signToken(sub: number, email: string) {
    return { accessToken: this.jwtService.sign({ sub, email }) };
  }
}
