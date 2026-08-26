import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { requireEnv } from './require-env';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-internal-api-key'];
    const expected = requireEnv('INTERNAL_API_KEY');

    if (typeof provided !== 'string' || provided.length !== expected.length) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    const isValid = timingSafeEqual(
      Buffer.from(provided),
      Buffer.from(expected),
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
