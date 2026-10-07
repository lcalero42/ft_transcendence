import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from './roles.guard';
import { adminOnly } from './roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function contextWith(user?: {
  id: number;
  email: string;
  isAdmin: boolean;
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard();

  it('should allow an admin', () => {
    expect(
      guard.canActivate(
        contextWith({ id: 1, email: 'admin@test.com', isAdmin: true }),
      ),
    ).toBe(true);
  });

  it('should reject a non-admin with 403', () => {
    expect(() =>
      guard.canActivate(
        contextWith({ id: 2, email: 'bob@test.com', isAdmin: false }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('should reject a request without user with 401', () => {
    expect(() => guard.canActivate(contextWith())).toThrow(
      UnauthorizedException,
    );
  });
});

describe('adminOnly', () => {
  it('should apply JwtAuthGuard before RolesGuard', () => {
    class TestController {
      @adminOnly()
      handler() {}
    }

    expect(
      Reflect.getMetadata(GUARDS_METADATA, TestController.prototype.handler),
    ).toEqual([JwtAuthGuard, RolesGuard]);
  });
});
