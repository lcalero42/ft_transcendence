import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { requireEnv } from '../common/require-env';
import { PrismaService } from '../prisma.service';
import { AUTH_COOKIE } from './auth-cookie-header';

function fromAuthCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[AUTH_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromAuthCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string | null; ver?: number }) {
    const player = await this.prisma.player.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        isGuest: true,
        isAdmin: true,
        tokenVersion: true,
      },
    });
    if (!player || player.tokenVersion !== payload.ver) {
      throw new UnauthorizedException();
    }
    return {
      id: player.id,
      email: player.email,
      isGuest: player.isGuest,
      isAdmin: player.isAdmin,
    };
  }
}
