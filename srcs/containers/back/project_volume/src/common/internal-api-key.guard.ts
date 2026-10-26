import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { requireEnv } from './require-env';

export function isInternalRequest(request: Request): boolean {
  const provided = request.headers['x-internal-api-key'];
  if (typeof provided !== 'string') {
    return false;
  }

  const expected = Buffer.from(requireEnv('INTERNAL_API_KEY'));
  const providedBuffer = Buffer.from(provided);
  return (
    providedBuffer.length === expected.length &&
    timingSafeEqual(providedBuffer, expected)
  );
}

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!isInternalRequest(request)) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
