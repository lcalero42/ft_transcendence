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
  private readonly expected = Buffer.from(requireEnv('INTERNAL_API_KEY'));

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-internal-api-key'];

    if (typeof provided !== 'string') {
      throw new UnauthorizedException('Invalid internal API key');
    }

    const providedBuffer = Buffer.from(provided);
    const isValid =
      providedBuffer.length === this.expected.length &&
      timingSafeEqual(providedBuffer, this.expected);
    if (!isValid) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
