import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/authenticated-request';

@Injectable()
export class NotGuestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (req.user?.isGuest) {
      throw new ForbiddenException('Guests cannot use this feature');
    }
    return true;
  }
}
