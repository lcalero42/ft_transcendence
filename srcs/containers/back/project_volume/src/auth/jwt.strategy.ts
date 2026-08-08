import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { requireEnv } from '../common/require-env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  validate(payload: { sub: number; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
