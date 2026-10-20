import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth/oauth.service';
import { JwtStrategy } from './jwt.strategy';
import { requireEnv } from '../common/require-env';
import { PrismaService } from '../prisma.service';
import { PlayerService } from '../player/player.service';

@Module({
  imports: [
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as StringValue,
      },
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 5 }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OAuthService,
    JwtStrategy,
    PrismaService,
    PlayerService,
  ],
})
export class AuthModule {}
