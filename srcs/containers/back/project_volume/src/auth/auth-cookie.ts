import type { CookieOptions, Response } from 'express';
import { AUTH_COOKIE } from './auth-cookie-header';

const BASE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

export function setAuthCookie(res: Response, token: string, expires?: Date) {
  res.cookie(AUTH_COOKIE, token, { ...BASE_OPTIONS, expires });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, BASE_OPTIONS);
}
