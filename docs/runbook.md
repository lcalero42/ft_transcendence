# Runbook

How to run, inspect and debug the stack locally. First-time setup is in the
[README](../README.md#instructions), and the design is in
[architecture.md](architecture.md).

> The front `.env` must be `srcs/containers/front/front_data/.env`, not
> one level up. Only `front_data/` is mounted in the container, and a
> misplaced file makes every API call go to `undefined/...`.

## Dev and prod modes

Both modes use `https://localhost:8443`, the same NGINX routes and the same
secrets. Compose files: `srcs/docker-compose.yml` (shared) plus
`docker-compose.dev.yml` or `docker-compose.prod.yml`.

| | `make dev` | `make prod` |
|---|---|---|
| Front | Vite dev server behind NGINX, hot reload | `vite build` output served by NGINX, no front container |
| Back | source bind-mounted, `nest start --watch` | `dist/` and production packages only, `node dist/main` |
| On start | `npm ci`, migrations, demo seed, Prisma Studio | migrations only |
| Published on `127.0.0.1` | API `3000`, Prisma Studio `51212` | Postgres `5432` |
| Postgres data | volume `postgres_dev_data` | volume `postgres_prod_data` |
| Avatars | `project_volume/uploads/` (bind mount) | volume `back_uploads` |

Only NGINX is reachable from other machines. In both modes `back` creates
or updates the admin accounts and the word pairs at startup
(`src/bootstrap/`). The demo data of `prisma/seed.ts` exists only in dev.

## Everyday commands

Run them from the repo root. `make help` lists every target. Lint,
typecheck, tests, bots and Prisma commands need the dev stack.

```bash
make dev / make upd        # dev stack, attached / detached
make prod                  # prod stack, detached
make down                  # stop and remove containers (keeps data)
make re                    # down + dev
make re-front / re-back    # rebuild one service
make logs / logs-front / logs-back / logs-nginx
make ps                    # container status
make bots ARGS="--create"  # run test bots inside back
```

## Checks (mirror CI)

```bash
make check-lint        # eslint, front + back
make check-lint-fix    # eslint --fix
make check-typecheck   # tsc, front + back
make test              # backend Jest tests
make check-all         # all of the above, reports every failure
```

## Database

- **Dev:** Postgres has no published port. Use Prisma Studio
  (`http://localhost:51212`) or
  `docker compose exec postgres psql ...`.
- **Prod:** Postgres is published on `127.0.0.1:5432` only. Connect with any
  client using the values in `srcs/secrets/db_*.txt`. If 5432 is already
  taken locally, map it to `127.0.0.1:5433:5432`.
- Migrations run on every `back` start (`prisma migrate deploy`). During
  development:
  ```bash
  make prisma-migrate    # prisma migrate dev
  make prisma-generate   # regenerate the client only
  ```
- Data lives in a named volume per mode, so it survives `make down` and
  `make re`. Don't delete the volume by hand (rootless Docker refuses it).
  `make fclean` wipes it after asking for confirmation.

## Troubleshooting

### Pages show no data / API calls fail
1. `docker exec front cat /app/.env` must show `VITE_API_URL=/api`. If the
   file is missing, see the note at the top, then run `make re-front`.
2. Open the app through NGINX (`https://localhost:8443`), not through a
   container port.
3. Requests other than GET are refused when the `Origin` differs from
   `CORS_ORIGIN` (`srcs/.env`, defaults to `https://localhost:<HTTPS_PORT>`).
   Set it if you use another host, then run `make re-back`.

### A page stays on "Connecting..."
Check `make logs-back` for Colyseus errors (rooms reject clients without a
valid session cookie) and `make logs-nginx` for proxy errors on
`/colyseus/`.

### `back` won't start
Run `make logs-back`. The usual causes are a missing or empty secret file
(`make check-secrets`) or a migration failing on a stale volume. As a last
resort, `make fclean && make dev` wipes the data.

### Unexpected `401 Unauthorized`
- The session is the httpOnly auth cookie. It expires after
  `JWT_EXPIRES_IN` (1d), or `JWT_REMEMBER_EXPIRES_IN` (30d) with
  remember me.
- A logout from any device revokes every token of that account. Log in
  again, or delete the cookie in DevTools → Application → Cookies.
- `/internal/` routes expect `x-internal-api-key`, not a session. NGINX
  never forwards them.

## Deploying on a VPS

`make vps` runs the prod stack with a real domain and a Let's Encrypt
certificate. It is opt-in: `make prod` keeps the self-signed certificate
and ports 8080/8443, so nothing changes where port 80 is unavailable.
`docker-compose.vps.yml` only mounts the certificate and webroot into
NGINX and points `SSL_CERT_PATH` / `SSL_KEY_PATH` at them.

1. Point an `A` record (and `AAAA` if the VPS has IPv6) of the domain at the
   VPS and check it with `dig +short example.com`.
2. Harden the VPS: SSH keys only, `ufw allow 22,80,443/tcp`, fail2ban, and
   don't open 3000, 2567 or 5432.
3. Install Docker with the compose plugin and certbot, clone the repo, then
   create the env files and secrets as in the README (fresh random values,
   e.g. `openssl rand -hex 32`).
4. In `srcs/.env` set:
   ```
   HTTP_PORT=80
   HTTPS_PORT=443
   DOMAIN=example.com
   CORS_ORIGIN=https://example.com
   ```
   `CORS_ORIGIN` has no trailing slash and no port. It drives CORS, the
   CSRF origin check and the OAuth redirect URIs.
5. Register `https://example.com/api/auth/{google,discord}/callback` in the
   Google and Discord apps (keep the localhost ones for local use).
6. Get the first certificate while port 80 is still free, then start the
   stack and switch renewal to the webroot method:
   ```bash
   sudo mkdir -p /var/www/certbot
   sudo certbot certonly --standalone -d example.com
   make vps
   sudo certbot certonly --webroot -w /var/www/certbot -d example.com
   ```
7. Certbot's systemd timer (`systemctl list-timers | grep certbot`) renews
   the certificate on its own. NGINX must be reloaded afterwards, so add a
   deploy hook that certbot runs after every successful renewal (a hook
   passed on the command line to `certbot renew` is not saved):
   ```bash
   sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'EOF'
   #!/bin/sh
   docker exec nginx nginx -s reload
   EOF
   sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
   ```
   Check it with `sudo certbot renew --dry-run` (it doesn't run deploy
   hooks, so also run the script once by hand).
8. Back up the `postgres_prod_data` and `back_uploads` volumes off the
   machine (for example a nightly `pg_dump`), and test a restore once.

Check: `curl -I http://example.com` returns a 301 to HTTPS, and
`curl -I https://example.com` returns 200 with a valid certificate and the
security headers. Use `make vps-logs` / `make vps-down` for day-to-day
operation. Never commit `.env` files, `srcs/secrets/` or certificates.

### Changed the Prisma schema and nothing updates
Run `make prisma-migrate`, or restart `back`. `npm run typecheck` in back
runs `prisma generate` first, so calling `tsc` directly can report a stale
client.
