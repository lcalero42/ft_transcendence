# Architecture

## Overview

**UnderCover** is a fullstack social-deduction party game: players join a
room, each gets a secret word (civilians share one word, the undercover
player(s) get a different-but-related word), and players try to unmask the
undercover through discussion and voting.

The system is three Docker services orchestrated by Compose:

```
┌──────────────┐        HTTP (JSON)        ┌──────────────┐        SQL        ┌──────────────┐
│    front     │ ────────────────────────► │     back     │ ─────────────────►│  postgres    │
│  React + Vite│ ◄──────────────────────── │ NestJS + REST│ ◄───────────────── │  (Postgres 16│
│  :5173       │        CORS-allowed       │  :3000       │      Prisma        │   in Docker) │
└──────────────┘                            └──────────────┘                    └──────────────┘
```

There is no reverse proxy / gateway in front of the two app containers yet;
the browser talks directly to the back container's exposed port.

## Services

### `front` — `srcs/containers/front`

- React 19 + TypeScript, built with Vite, styled with Tailwind CSS 4.
- Client-side routing via `react-router-dom` (see `src/App.tsx` for the route
  table: `/home`, `/login`, `/register`, `/profile`, `/create-room`,
  `/game/:id`, plus a dev-only `/testColyseus` page — see
  [Realtime game state](#realtime-game-state) below). `/profile`,
  `/create-room`, and `/game/:id` are wrapped in `ProtectedRoute`
  (`src/context/ProtectedRoute.tsx`), which redirects to `/login` when
  there's no authenticated user.
- Auth state is a React context (`src/context/AuthContext.tsx`): it holds
  the decoded JWT payload as `user`, and `login`/`register`/`logout`
  delegate to `src/api/auth/auth.ts`. The token itself lives in
  `localStorage` (`src/api/auth/client.ts`), and every request goes through
  a shared `apiFetch()` helper there that attaches
  `Authorization: Bearer <token>` automatically — `src/api/player.ts` and
  `src/api/rooms.ts` are both thin wrappers around it.
- Talks to the backend exclusively over `fetch()` calls (via `apiFetch()`),
  using the `VITE_API_URL` env var as the base URL (see
  [runbook.md](runbook.md) for the env-file gotcha around this).
- Dev server runs `vite` directly inside the container (`npm run dev`), so
  changes on the host are hot-reloaded — there is no production build step
  wired up in Docker yet.
- Actual application source lives in
  `srcs/containers/front/front_data` (this is the directory bind-mounted
  into the container at `/app`; everything above it in `containers/front/`
  is just Docker plumbing and is *not* mounted).

### `back` — `srcs/containers/back`

- NestJS (Express platform) REST API, TypeScript, Prisma ORM.
- Module layout mirrors the domain: `player`, `room`, `game`, `word_pair`,
  `auth`, plus shared `common/` guards and helpers. Each domain module
  follows the standard Nest resource shape (controller + service + DTOs +
  entity + `*.spec.ts` unit tests colocated).
- Auth is JWT-based (`@nestjs/jwt` + `passport-jwt`): `POST /auth/register`
  and `POST /auth/login` issue a bearer token; protected routes use
  `JwtAuthGuard` (see `src/auth/`). A separate `InternalApiKeyGuard`
  (`x-internal-api-key` header) protects service-to-service routes such as
  `word-pair` creation — intended for the realtime layer (Colyseus, see
  below) to call back into the API without a user token, though the
  current Colyseus scaffold doesn't call any REST routes yet.
- `ServeStaticModule` serves uploaded files (e.g. avatars) from
  `/uploads`.
- CORS is currently hardcoded to `http://localhost:5173` in `src/main.ts`
  (the Vite dev server origin) — there's no per-environment CORS config
  yet.
- Global `ValidationPipe` with `whitelist: true` /
  `forbidNonWhitelisted: true` rejects any request body field not declared
  on a DTO.
- On container start, `conf/entrypoint.sh` reads Docker secrets, builds
  `DATABASE_URL`/`JWT_SECRET`/`INTERNAL_API_KEY`, writes them to `/app/.env`,
  runs `prisma migrate deploy` + `prisma generate` + `prisma db seed`, then
  starts `prisma studio` (port `51212`) alongside `nest start --watch`.
  Application source lives in `srcs/containers/back/project_volume`
  (bind-mounted to `/app`).

### `postgres`

- Official `postgres:16` image, credentials supplied via Docker secrets
  (`POSTGRES_USER_FILE` / `POSTGRES_PASSWORD_FILE` / `POSTGRES_DB_FILE`),
  never as plaintext env vars. Healthcheck gates `back`'s startup
  (`depends_on: condition: service_healthy`).
- No port is published to the host — only reachable from other containers
  on the Compose network, by design.

## Data model

Defined in `srcs/containers/back/project_volume/prisma/schema.prisma`:

- **Player** — account (name/email/password hash, bio, avatar). Soft-delete
  via `deletedAt`.
- **Rooms** — a lobby created by a `Player`, with `minPlayers`/`maxPlayers`
  and a nullable `colyseusRoomId` reserved for the realtime layer (see
  [ADR 0001](adr/0001-adopt-colyseus-for-realtime-game-sync.md)).
- **Games** — one played round inside a `Rooms`, holding the
  `civilianWord`/`undercoverWord` pair for that round, a `status`
  (`waiting`/`playing`/`finished`), and the `victory` outcome (`civilian`
  or `undercover`).
- **Game_Players** — join table between `Games` and `Player`, carrying the
  per-player `role` (`civilian`/`undercover`) and `eliminatedAt`.
- **Word_Pair** — the pool of civilian/undercover word pairs games are
  seeded from (`prisma/seed.ts`); mutated only via the internal-API-key
  protected route, since it's meant to be managed by trusted tooling, not
  end users.

## API surface (back, `:3000`)

| Resource | Routes |
|---|---|
| `auth` | `POST /auth/register`, `POST /auth/login` |
| `player` | `GET /player`, `GET /player/count-activ`, `GET /player/me`, `GET/PATCH/DELETE /player/:id`, `GET /player/:id/games-played`, `GET /player/:id/victory`, `GET /player/:id/winrate`, `GET /player/:id/about-me`, `PATCH /player/:id/avatar` |
| `room` | `POST /room`, `GET /room`, `GET /room/current`, `GET /room/:id`, `GET /room/:id/games`, `PATCH/DELETE /room/:id` |
| `game` | `POST /game`, `GET /game`, `GET /game/count`, `GET /game/:id`, `GET /game/:id/players`, `PATCH/DELETE /game/:id` |
| `word-pair` | `POST /word-pair` (internal-key only), `GET /word-pair`, `GET/PATCH/DELETE /word-pair/:id` |

Routes without a guard annotation are currently public; most mutating
routes require a valid JWT, and room/game ownership is enforced
service-side (e.g. only the room's creator can `PATCH`/`DELETE` it).

## Realtime game state

A Colyseus server now runs (see [ADR 0001](adr/0001-adopt-colyseus-for-realtime-game-sync.md)
for why Colyseus), but it's still an early scaffold, not the actual game
loop:

- `back/src/colyseus/server.ts` defines the server and starts it
  alongside the REST API in the same process — `main.ts` calls
  `colyseusServer.listen(2567)` right before `app.listen(...)`. It is
  **not** a separate Compose service; `docker-compose.yml` just publishes
  the extra port (`2567:2567`) on the existing `back` container.
- `back/src/colyseus/rooms/Rooms.ts` (registered as room type `udvRoom`)
  and `RoomState.ts` are still generic Colyseus-starter-template code —
  players are tracked by `x`/`y`/`name`, messages are named
  `doSomething`/`do`, and none of it is wired to Undercover's actual
  mechanics (word assignment, roles, elimination, voting). `onJoin`
  performs no authentication — any client can join `udvRoom` up to
  `maxClients`.
- The frontend's `/testColyseus` page (`TestColyseus.tsx` + `GameView.tsx`)
  connects to it via `@colyseus/react`'s `useRoom()` hook, purely to
  exercise the plumbing — it's not linked from the app's normal
  navigation. The real `/game/:id` page (`GameRoom.tsx`) is still a
  placeholder and isn't hooked up to Colyseus yet.
- `Rooms.colyseusRoomId` in the Prisma schema (populated once a lobby's
  game actually starts) is still unused by any of the above — nothing yet
  links a `Rooms` DB row to a live Colyseus room instance.

## Configuration & secrets

- Non-secret app config lives in `.env` files (`srcs/.env`,
  `srcs/containers/back/project_volume/.env`,
  `srcs/containers/front/front_data/.env`) — see
  [runbook.md](runbook.md) for exactly where each one needs to live and why.
- Actual credentials (DB user/password/name, JWT secret, internal API key)
  live in `srcs/secrets/*.txt`, consumed as Docker secrets and never passed
  as plain environment variables to `postgres` or read directly by `back`
  outside of `entrypoint.sh`.

## CI

Two GitHub Actions workflows gate every PR (`.github/workflows/`):

- `ci-lint-eslint.yaml` — installs both apps, generates the Prisma client,
  runs ESLint across front and back.
- `ci-typecheck.yaml` — installs both apps, runs `tsc` typecheck for front
  and back.

A separate set of `automation-*` workflows syncs issue/PR status labels
based on branch and PR lifecycle events (not part of the app's runtime
architecture, but relevant to the [engineering guidelines](engineering-guidelines.md)).
