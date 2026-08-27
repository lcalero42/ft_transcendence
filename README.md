# ft_transcendence

> A fullstack web app, built as part of the 42 curriculum.

## Getting Started

This project uses a Makefile to manage the Docker stack.

```bash
make up      # Start all services
make down    # Stop all services
make re      # Rebuild everything
make help    # List all available commands
```

See `make help` for the full list of targets (front/back specific builds, logs, Prisma helpers, cleaning, etc.).

## Stack

- **Frontend** — React + TypeScript, Vite, Tailwind CSS
- **Backend** — NestJS + TypeScript, Prisma ORM
- **Database** — PostgreSQL
- **Realtime** (planned) — Colyseus, see [ADR 0001](docs/adr/0001-adopt-colyseus-for-realtime-game-sync.md)
- **Infra** — Docker Compose, Docker secrets for credentials

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.

## Team

| Name | GitHub |
|------|--------|
|||

## Contributing

Read [`docs/engineering-guidelines.md`](docs/engineering-guidelines.md) before contributing.
All changes go through a branch + PR. No direct pushes to `main`.

.env
.vscode

