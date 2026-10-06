import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';

export const adminOnly = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard));
