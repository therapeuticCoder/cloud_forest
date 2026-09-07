# Cloud Forest

Cloud Forest is a private relationship map and mutual-care application for
people who want calmer, more deliberate community than attention-driven social
platforms provide. It organizes a person's world into bounded Party, Tribe,
Guild, and Signal layers. See `docs/project-brief.md` for product scope and
`DECISIONS.md` for durable decisions.

The current prototype includes responsive Curator and Timeline views, an
installable React PWA, a fictional device-local Receive-care lifecycle, and one
PostgreSQL-backed Timeline item crossing the versioned API and typed client.
Care browser storage and the perspective switcher demonstrate behavior; they
are not authentication, shared authority, or production data.

## Stack and boundaries

- TypeScript and pnpm workspaces
- React, Vite, Tailwind CSS, and shadcn/ui in `apps/web`
- Fastify and TypeBox in `apps/api`
- PostgreSQL and reviewed Drizzle SQL in `packages/database`
- generated OpenAPI and a transport-only `packages/api-client`
- framework-neutral rules in `packages/domain`
- Vitest, Node tests, and pinned Playwright Chromium

Workspace dependencies flow from `apps/*` to `packages/*`. The API client may
depend on API contracts and domain types; the database may depend on domain;
shared packages never depend on applications. The web app must not import
Fastify, Drizzle, PostgreSQL, or the database package. Add internal dependencies
only for an approved task and use the `workspace:` protocol.

## Quick start

Use Node `22.23.2` and pnpm `11.1.2`. On native Windows, prefer `pnpm.cmd` so a
blocked PowerShell wrapper does not require changing machine policy.

```powershell
pnpm.cmd setup
Copy-Item .env.example .env
pnpm.cmd services:up
pnpm.cmd db:migrate
```

Then run the two foreground development servers in separate terminals:

```powershell
# Terminal 1
pnpm.cmd dev:api

# Terminal 2
pnpm.cmd dev
```

The API defaults to `http://127.0.0.1:3001`; Vite proxies same-origin `/api`
requests to it. `GET /api/v1/health` does not require Docker or PostgreSQL.
Development mode does not register the production service worker and removes a
stale worker on its own origin.

Common checks:

```powershell
pnpm.cmd check
pnpm.cmd check:api
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd test
pnpm.cmd build
pnpm.cmd openapi:check
pnpm.cmd db:migrations:check
pnpm.cmd test:database
pnpm.cmd e2e:install
pnpm.cmd test:e2e
```

Contract changes use `pnpm.cmd openapi:generate`; review both generated files.
Schema changes use `pnpm.cmd db:generate`; review SQL and metadata before
`pnpm.cmd db:migrate`. Database tests require a distinct local
`TEST_DATABASE_URL` whose database name contains `test`. Project commands never
drop, reset, or truncate databases automatically.

For production-PWA inspection:

```powershell
pnpm.cmd build
pnpm.cmd --filter @cloud-forest/web exec vite preview
```

The service worker caches only the static shell, not API responses or user data.
Visual baselines live in `e2e/snapshots`; update them only for an approved visual
change and inspect the PNG diff directly.

## Operational references

- `docs/development.md`: setup, services, migrations, browser/PWA checks,
  Tailscale review, recovery, and troubleshooting
- `docs/design-guide.md`: approved visual and accessibility grammar
- `docs/care-lifecycle-prototype.md`: accepted care behavior and authority limits
- `docs/authorization-and-privacy-matrix.md`: field- and operation-level policy
- `docs/workflow.md`: collaboration-mode router

Safe cleanup and dependency recovery are explicit:

```powershell
pnpm.cmd clean:generated -- --dry-run
pnpm.cmd clean:generated
pnpm.cmd deps:repair
pnpm.cmd deps:repair -- --confirm
```

The repair command removes only repository `node_modules` directories and
reinstalls from the lockfile. It does not remove the pnpm store, source, `.env`,
backups, Docker volumes, or user data. See `docs/development.md` before recovery
or remote-device testing.

## Repository map

```text
apps/
  api/          versioned Fastify service
  web/          React PWA
  worker/       reserved boundary; no active job behavior
packages/
  api-client/   generated transport types and browser-safe client
  api-contracts/runtime transport contracts
  database/     server-only database boundary
  domain/       framework-neutral rules
```

Current work is defined in `BACKLOG.md`. Use one explicitly selected workflow
skill per session and follow `AGENTS.md`.
