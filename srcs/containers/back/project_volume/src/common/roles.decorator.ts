import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isadmin';
export const adminOnly = () => SetMetadata(IS_ADMIN_KEY, true);
