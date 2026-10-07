import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { requireEnv } from '../common/require-env';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const player = await this.prisma.player.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, isAdmin: true },
    });
    if (!player) throw new UnauthorizedException();
    return { id: player.id, email: player.email, isAdmin: player.isAdmin };
  }
}
