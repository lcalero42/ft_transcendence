# Engineering Guidelines

## Workflow

- No direct pushes to `main`. Every change goes through a branch and a PR.
- One issue per change, opened from a template in `.github/ISSUE_TEMPLATE/`
  (`feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `style`, `test`).
- Name branches `<type>/<issue>-<slug>` (e.g. `feat/71-voting-phase`). The
  issue number links the branch to its issue: `automation-*` workflows move
  the issue labels to in-progress, then in-review, and clean them up on
  merge. Never edit those labels by hand.
- Fill the PR template (`.github/pull_request_template.md`) and end it with
  `Closes #<issue>`. `.github/CODEOWNERS` decides who gets auto-requested
  for review.

## Before opening a PR

CI runs lint, typecheck, backend tests and a Docker build on every PR. Run
the same checks locally with the dev stack up:

```bash
make check-all
```

The PR "Tests" checklist means you exercised the change in the running app,
edge cases included (simultaneous requests, disconnects). A green CI is
not enough.

## Code style

- ESLint + Prettier in both apps: `npm run lint:fix` (front) or
  `npm run lint` (back). Don't hand-format.
- **Back:**
  - One Nest module per domain (`auth`, `player`, `room`, `game`,
    `word_pair`, `friendship`, `bootstrap`) with controller, service and
    `dto/`. Cross-cutting guards and helpers go in `src/common/`, and
    realtime code in `src/colyseus/`.
  - Every request body is a `class-validator` DTO. The global
    `ValidationPipe` rejects undeclared fields, so add the field to the DTO
    instead of working around the pipe.
  - Read config with `requireEnv('KEY')` (`common/require-env.ts`), never
    with raw `process.env`, so a missing value fails at startup.
- **Front:**
  - Page-local components go in `src/pages/<Page>/components/`. Only
    shared UI goes in `src/components/`.
  - API calls go through `src/api/*.ts` (one file per resource), all using
    `apiFetch()`.
  - Use the theme tokens and shared components described in
    [design-system.md](design-system.md), never raw hex colours.

## Language

- Code, identifiers, comments, commits, PRs and docs are in English.
- User-facing text goes through i18n keys (`t("...")`), never hard-coded.
  Add every new key to `src/locales/en.json`, `fr.json` and `es.json`.

## Testing

- Backend: Jest specs sit next to the code as `*.spec.ts`. Run them with
  `make test`, or `npm test` inside back. New services, guards and room
  logic come with specs.
- Frontend: there is no test runner yet. Verify manually in the running app.

## Secrets

- Never commit `.env` files or `srcs/secrets/` (both are git-ignored).
- New required config goes in the matching `.env.example` with a
  placeholder, and new secrets go in `make check-secrets`.

## Architecture decisions

Record hard-to-reverse choices (library, protocol, storage) as a short ADR
in [`docs/adr/`](adr/), numbered sequentially, using the format of
[0001](adr/0001-adopt-colyseus-for-realtime-game-sync.md): context,
decision, consequences.
