# Engineering Guidelines

## Workflow

- No direct pushes to `main`. All changes go through a feature branch + PR.
- Branch names should embed the issue number so automation can link them
  back to the issue (see `.github/automation/src/branches/parse-issue-number-from-branch-name.ts`),
  e.g. `feat/71-short-description`, `fix/83-short-description`. This repo's
  own history follows `<type>/<issue>-<slug>`.
- Issue/PR type prefixes mirror the templates in `.github/ISSUE_TEMPLATE/`:
  `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `style`, `test`.
- Opening a branch for an issue and opening/updating a PR both trigger
  status-label automation (`automation-branch-state-transition.yaml`,
  `automation-pr-state-transition.yaml`) that moves the linked issue through
  in-progress → in-review. Merging cleans the labels back up
  (`automation-merge-state-cleanup.yaml`). You don't need to manage these
  labels by hand.
- Fill out the PR template (`.github/pull_request_template.md`) — Summary,
  Why, Changes, Tests, Risks, and `Closes #<issue-number>` so the automation
  can resolve the linked issue.
- `.github/CODEOWNERS` currently routes `.github/` changes through
  `@lcalero42` for review.

## Before opening a PR

CI runs lint and typecheck on every PR (`ci-lint-eslint.yaml`,
`ci-typecheck.yaml`). Run the same checks locally first — see
[runbook.md](runbook.md#checks-mirrors-ci):

```bash
make check-lint
make check-typecheck
```

Both front and back have their own `lint` / `lint:fix` / `typecheck` npm
scripts if you'd rather run them without Docker (`npm run typecheck` in
`back` runs `prisma generate` first — don't skip that step or you'll get
stale-client type errors).

## Code style

- ESLint + Prettier are configured in both apps (`eslint.config.mjs` /
  `eslint.config.js`); fix with `npm run lint` (back) or
  `npm run lint:fix` (front) rather than hand-formatting.
- Backend: NestJS conventions — one module per domain
  (`player/`, `room/`, `game/`, `word_pair/`, `auth/`), each with
  `*.controller.ts` / `*.service.ts` / `dto/` / `entities/`. Request bodies
  are validated with `class-validator` DTOs; the global `ValidationPipe`
  (`whitelist: true`, `forbidNonWhitelisted: true`) means any field not
  declared on a DTO is rejected — add it to the DTO, don't work around the
  pipe.
- Shared backend cross-cutting concerns (guards, env helpers) live in
  `src/common/`, not duplicated per-module.
- Secrets and credentials are never read via `process.env` directly outside
  of `common/require-env.ts` — use `requireEnv('KEY')` so a missing var
  fails loudly at startup instead of producing `undefined` deep in a
  service.
- Frontend: components are colocated by feature under `src/pages/<Page>/`
  with a `components/` subfolder for page-local pieces; only genuinely
  shared UI lives in top-level `src/components/`. API calls live in
  `src/api/*.ts`, one file per backend resource, using
  `import.meta.env.VITE_API_URL` as the base — don't hardcode
  `localhost:3000` in a component.

## Language

- All user-facing text (UI copy, page content) must be in English, even
  though the team communicates in French day-to-day. Check new/changed
  components for stray French strings before requesting review — this has
  been an ongoing cleanup effort in this codebase (see the
  `refacto/*-refactor-text-fields-in-english` branch history).
- Code, identifiers, comments, and commit messages are English too.

## Testing

- Backend unit tests are colocated as `*.spec.ts` next to the code they
  test (Jest, `ts-jest`), run via `npm test` inside `back`, or `test:cov`
  for coverage. Every existing module (`player`, `room`, `game`,
  `word_pair`, `auth`) has both controller and service specs — follow that
  pattern for new modules.
- There's no frontend test runner configured yet; rely on manual
  verification through the running app (`make up`, then click through
  the flow) until one is added.
- The PR template's "Tests" checklist expects containers to actually be
  built and the change exercised at `localhost:...`, plus edge cases like
  simultaneous requests or client disconnects where relevant — not just a
  passing CI run.

## Environment & secrets hygiene

- Never commit `.env` files or anything under `srcs/secrets/` — both are
  git-ignored; double check `git status`/`git diff` before pushing if
  you've touched config.
- New required config goes in `.env.example` at the repo root with a
  placeholder value and a comment, so `make check-env` keeps failing loudly
  for anyone who hasn't set it up yet, rather than the app failing
  mysteriously at runtime.
- See [runbook.md](runbook.md) for where each `.env` file physically needs
  to live — misplacing one (particularly the frontend's, which must sit
  inside `front_data/`) is a recurring source of "it works on my machine
  but nothing loads" bugs.

## Architecture decisions

Non-trivial, hard-to-reverse technical decisions (choice of a library,
storage engine, protocol, etc.) should get a short ADR under
[`docs/adr/`](adr/), numbered sequentially. See
[0001](adr/0001-adopt-colyseus-for-realtime-game-sync.md) for the format —
context, decision, consequences. Not every decision needs one; use
judgement for anything a future contributor would otherwise have to
reverse-engineer from git blame.
