import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request';

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
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
