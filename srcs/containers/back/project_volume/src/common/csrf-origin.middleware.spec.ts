import type { Request, Response } from 'express';
import { csrfOriginCheck } from './csrf-origin.middleware';

const APP_ORIGIN = 'https://localhost:8443';

function run(req: Partial<Request>) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  csrfOriginCheck(APP_ORIGIN)(
    { headers: {}, ...req } as Request,
    res as unknown as Response,
    next,
  );
  return { res, next };
}

describe('csrfOriginCheck', () => {
  const withCookie = { cookies: { access_token: 'jwt' } };

  it('should let safe methods through without checking the origin', () => {
    const { next } = run({
      ...withCookie,
      method: 'GET',
      headers: { origin: 'https://evil.example' },
    });

    expect(next).toHaveBeenCalled();
  });

  it('should accept a cookie-authenticated write from the app origin', () => {
    const { next } = run({
      ...withCookie,
      method: 'POST',
      headers: { origin: APP_ORIGIN },
    });

    expect(next).toHaveBeenCalled();
  });

  it('should reject a cookie-authenticated write from another origin', () => {
    const { res, next } = run({
      ...withCookie,
      method: 'PATCH',
      headers: { origin: 'https://evil.example' },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should reject a cookie-authenticated write without an origin', () => {
    const { res, next } = run({ ...withCookie, method: 'DELETE' });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should ignore requests authenticated with a bearer token', () => {
    const { next } = run({
      ...withCookie,
      method: 'POST',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(next).toHaveBeenCalled();
  });

  it('should ignore requests without the auth cookie', () => {
    const { next } = run({ method: 'POST', cookies: {} });

    expect(next).toHaveBeenCalled();
  });
});
