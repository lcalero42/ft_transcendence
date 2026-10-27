import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request';
import { apiError } from './api-error';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    if (!request.user.isAdmin) {
      throw new ForbiddenException(
        apiError('ADMIN_REQUIRED', 'Admin access required'),
      );
    }

    return true;
  }
}
