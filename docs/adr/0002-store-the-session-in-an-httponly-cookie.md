# 0002. Store the session in an httpOnly cookie

## Status

Accepted and implemented (#193, #197). This also settles how Colyseus
connections authenticate, which ADR 0001 left open.

## Context

`back` issues a JWT at login. The front used to keep it in `localStorage`
("remember me", register, guest) or `sessionStorage`, decode it to know the
user, and send it as `Authorization: Bearer` on every request. That had
three problems:

- Any script running in the page (an XSS bug, a compromised dependency) can
  read the token and use it from anywhere until it expires.
- The WebSocket connection to Colyseus needed its own way to pass the
  token, and the scaffold room did not authenticate at all.
- Logging out only deleted the local copy. A stolen token stayed valid.

## Decision

- `back` sets the JWT in an `access_token` cookie that is `httpOnly`,
  `Secure`, `SameSite=Lax` and `Path=/` (`src/auth/auth-cookie.ts`). Remember
  me adds an `expires` date (`JWT_REMEMBER_EXPIRES_IN`). Without it, the
  cookie is a session cookie.
- `JwtStrategy` reads the cookie first (`src/auth/jwt.strategy.ts`). Bearer
  stays as a fallback for the calls that Colyseus makes on behalf of a
  player (`src/colyseus/api.ts`).
- Colyseus rooms authenticate in `onAuth` by reading the same cookie from
  the WebSocket upgrade headers (`tokenFromCookieHeader`).
- The token carries `ver = Player.tokenVersion`. Logout increments it, which
  revokes every token already issued for that account.
- The front never sees the token. It asks `GET /player/me` to know who is
  logged in, and treats a `401` as a logout.
- Because the browser now sends the cookie on its own, CSRF has to be
  handled:
  - `SameSite=Lax` stops other sites from sending it on cross-site POSTs.
  - `csrf-origin.middleware.ts` rejects any request other than
    GET/HEAD/OPTIONS whose `Origin` is not `CORS_ORIGIN`.

## Alternatives considered

- **Keep the token in Web Storage and harden against XSS only.** That is
  simpler, but a single XSS bug still leaks a long-lived token. Rejected.
- **Server-side sessions (session id in a cookie, data in a store).** That
  gives the same browser security, but adds a session store to run and
  query on every request. `tokenVersion` gives us revocation with one
  column. Rejected.
- **`SameSite=Strict`.** It would add little. Every API call is a
  same-site `fetch`, and the `Origin` check already blocks cross-site
  writes. Not needed on top of `Lax`.

## Consequences

- Scripts can no longer steal the token, and logout really ends every
  session of the account.
- The app must stay same-origin behind NGINX (`/api`, `/colyseus`) and
  HTTPS-only, otherwise the `Secure` cookie is not sent.
- Every request costs one database read to check `tokenVersion`.
- Tools that called the API with a stored token had to change. The bots now
  take the cookie the server sends (#197). Postman needs the cookie, or the
  Bearer fallback.
- Any new state-changing route is covered by the `Origin` check
  automatically. A new GET route must never change state.
