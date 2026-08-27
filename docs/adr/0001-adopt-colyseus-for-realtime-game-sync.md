# 0001. Adopt Colyseus for realtime game synchronization

## Status

Accepted — dependency and data model reserved; server-side implementation
not yet built (tracked separately from this decision; see
[architecture.md](../architecture.md#realtime-game-state--not-yet-implemented)).

## Context

UnderCover is played synchronously by a small group (3–6 players) inside a
`Rooms`/`Games` pair: everyone needs to see the same game state (whose
turn it is, who's been eliminated, when the round ends) update live, and
votes/eliminations need to be resolved consistently across clients without
each client polling the REST API and racing each other.

The existing backend is a stateless NestJS REST API backed by PostgreSQL —
a good fit for CRUD on players/rooms/games/word-pairs, but not for
holding authoritative, low-latency, in-memory game state shared by a
handful of concurrently-connected sockets. Building that on top of plain
WebSockets in Nest would mean hand-rolling room membership, state
broadcast/diffing, and reconnect handling ourselves.

## Decision

Use [Colyseus](https://colyseus.io/) as the realtime layer for actual
gameplay (turn order, eliminations, live game state), running alongside
the existing NestJS REST API rather than replacing it:

- REST API (NestJS) stays the source of truth for persisted data —
  accounts, room metadata, game history/results — and for anything that
  doesn't need sub-second sync (creating a room, viewing profiles/stats).
- Colyseus owns the *live* game session: it creates a room instance per
  active game, broadcasts authoritative state diffs to connected clients,
  and is the thing clients open a socket to once a game starts.
- The link between the two is `Rooms.colyseusRoomId` (nullable string) in
  the Prisma schema — populated once a lobby's game actually starts and a
  Colyseus room is spun up for it.
- The backend already depends on `@colyseus/sdk` so the Nest process can
  create/manage Colyseus rooms and call back into internal, non-JWT
  endpoints (protected by `InternalApiKeyGuard`, e.g. `word-pair`) to pull
  game data without impersonating a user.

## Alternatives considered

- **Plain WebSockets / Nest's built-in `@WebSocketGateway`** — would work,
  but pushes room-membership, reconnection, and state-diffing concerns
  onto us instead of a library built for exactly this. Rejected as more
  effort for no real benefit at this scale.
- **Polling the REST API** — simplest to build, but a discussion/voting
  game where "who's eliminated" needs to update promptly across all
  clients would either feel laggy (slow poll) or hammer the API and DB
  (fast poll). Rejected.
- **Third-party realtime backend (e.g. Firebase, Supabase Realtime)** —
  would introduce an external managed dependency and a second data store
  to keep in sync with Postgres, for a project that's meant to be
  self-hosted via Docker Compose (see the 42 school project constraints).
  Rejected in favor of something that runs as another Compose service.

## Consequences

- Two runtime models to reason about: request/response (REST, persisted
  state) and event-driven/stateful (Colyseus, in-memory session state).
  Contributors need to know which one owns a given piece of data before
  touching it.
- `Rooms.colyseusRoomId` links the two, but nothing enforces that link is
  kept consistent yet (no Colyseus server exists in Compose today) — the
  `/game/:id` frontend page is currently a placeholder
  (`GameRoom.tsx`) pending that implementation.
- Once implemented, the Colyseus process will need its own Compose service
  entry, its own exposed port, and a decision on how/whether it
  authenticates against the same JWTs issued by `back` — none of that is
  decided yet and should get a follow-up ADR when it's built.
