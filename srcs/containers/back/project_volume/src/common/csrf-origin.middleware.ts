import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE } from '../auth/auth-cookie-header';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfOriginCheck(allowedOrigin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const usesAuthCookie =
      !!cookies?.[AUTH_COOKIE] && !req.headers.authorization;
    if (
      SAFE_METHODS.has(req.method) ||
      !usesAuthCookie ||
      req.headers.origin === allowedOrigin
    ) {
      next();
      return;
    }
    res.status(403).json({ statusCode: 403, message: 'Invalid origin' });
  };
}
