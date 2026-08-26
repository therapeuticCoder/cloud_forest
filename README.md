# Cloud Forest

Cloud Forest is a React prototype for helping people deliberately cultivate a
smaller, community-centered social world. It organizes people, groups, and
public sources by relational depth so that not everything competes for attention
on equal terms. The prototype has three views:

- Curator: the primary layered view for selecting and managing Party, Tribe,
  Guilds, and Signals.
- Timeline: the currently active chronological view of relationship activity.
- Galaxy: an existing relationship-map experiment that is preserved for now but
  is not the product priority.

Timeline and Curator are switchable in the current app. The immediate milestone
is a carefully polished Curator prototype. Galaxy code may remain where useful,
but new polish should focus on Curator and Timeline unless the backlog says
otherwise.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest
- ESLint
- Prettier

## Local development

Use Node.js `22.23.2`. The repository records the version in `.nvmrc` and
`.node-version` and pins pnpm `11.1.2` through the `packageManager` field.

For the complete native Windows workstation, Docker, local service, Codex, and
troubleshooting instructions, see [`docs/development.md`](docs/development.md).
For the approved visual principles, semantic palette, responsive patterns, and
anti-patterns, see [`docs/design-guide.md`](docs/design-guide.md).

Install dependencies:

```bash
pnpm install
```

Or run the repeatable environment setup, which verifies tool versions, installs
from the lockfile, and runs the full project check:

```powershell
pnpm.cmd setup
```

Routine setup uses `pnpm install --frozen-lockfile` and does not purge a healthy
environment. To inspect or remove disposable build and test output, use:

```powershell
pnpm.cmd clean:generated -- --dry-run
pnpm.cmd clean:generated
```

For a damaged dependency layout, preview and then explicitly confirm a rebuild:

```powershell
pnpm.cmd deps:repair
pnpm.cmd deps:repair -- --confirm
```

See [`docs/development.md`](docs/development.md#environment-hygiene-and-recovery)
for the exact deletion boundaries and troubleshooting procedure.

Run the app locally:

```bash
pnpm dev
```

Run the versioned API locally in a separate terminal:

```bash
pnpm dev:api
```

The API defaults to `http://127.0.0.1:3001`. Override `API_HOST` or `API_PORT`
in the process environment when needed. `GET /api/v1/health` is independent of
Docker and the database. Run its focused checks with `pnpm check:api`.

Development mode does not register the production service worker. If the same
development origin was previously used for a production preview, startup also
unregisters that origin's existing workers. The production worker always tries
online navigations first, so an available Vite development page can load and
perform that cleanup instead of being hidden behind the cached shell.

Build and preview the installable PWA locally:

```bash
pnpm build
pnpm --filter @cloud-forest/web exec vite preview
```

The production build emits the web app manifest, Cloud Forest-owned install
icons, and a service worker. The first online load installs a cache containing
only the static application shell. It does not runtime-cache API responses,
account data, user content, or future dynamic requests. A cached shell can
reload offline; content that is not part of that shell still requires its normal
source.

When a new build is discovered, the current build remains active until the app
offers **Update now**. Accepting activates the waiting worker and reloads the
page; choosing **Later** keeps the current session and the app checks again when
it becomes visible and at least hourly while open.

Run the full project check:

```bash
pnpm check
```

Useful focused commands:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

### Native Windows PowerShell

If PowerShell blocks `pnpm.ps1` because script execution is disabled, use the
Windows command shim without changing the machine execution policy:

```powershell
pnpm.cmd install
pnpm.cmd dev
pnpm.cmd check
```

The package scripts use cross-platform Node-based tools and work on both native
Windows and Linux.

Start the local PostgreSQL, email capture, and S3-compatible services after
Docker Desktop is running:

```powershell
pnpm.cmd services:up
pnpm.cmd services:status
```

### Local database migrations

`packages/database` is a server-only package. It connects only to the existing
local PostgreSQL service and keeps database configuration out of the domain and
API-contract packages. Schema changes use generated, reviewed SQL migrations:

```powershell
pnpm.cmd db:generate
pnpm.cmd db:migrations:check
pnpm.cmd db:status
pnpm.cmd db:migrate
pnpm.cmd db:inspect
```

Review every generated SQL file and its Drizzle metadata before applying it.
`db:migrate` applies pending migrations forward and is a successful no-op when
the database is current. `db:status` and `db:inspect` are read-only. Direct
schema push and automatic rollback are not supported.

Database integration tests require `TEST_DATABASE_URL` to name a distinct local
database containing `test`. `pnpm.cmd test:database` creates that database when
absent, applies migrations, and runs isolated fictional fixtures. It never
drops or resets a database. Any destructive reset requires separate explicit
confirmation.

## Project structure

```text
apps/
  api/             # versioned Fastify API service
  web/             # working Vite/React prototype
    src/
      app/
      components/
      data/
      lib/
      test/
  worker/          # reserved background-worker application boundary
packages/
  api-client/      # shared typed API client boundary
  api-contracts/   # shared transport contract boundary
  database/        # shared server-side database boundary
  domain/          # shared framework-neutral domain boundary
```

The working Vite prototype lives in `apps/web`, and the Fastify service lives in
`apps/api`. The remaining reserved workspace directories contain boundary-only
manifests until their owning backlog tasks implement them.

### Workspace conventions

Workspace packages use the private `@cloud-forest/*` scope, with names matching
their directory names. Applications may depend on shared packages; shared
packages must never depend on an application package.

The intended shared-package dependency direction is:

```text
apps/* -> packages/*
api-client -> api-contracts -> domain
database -> domain
domain -> no workspace package
```

Other shared-package dependencies should be introduced only by the task that
needs them. Use pnpm's `workspace:` protocol when an approved implementation
adds an internal dependency. The database package is server-only and must not
be consumed by the web application or API client.

## Agentic workflow

This repo is designed for supervised agentic development. Use one small backlog
task per agent session and read these files before making changes:

- `AGENTS.md`
- `README.md`
- `BACKLOG.md`
- `DECISIONS.md`
- `docs/project-brief.md`
- `docs/prototype-roadmap.md`
- `docs/workflow.md`

The human remains the product owner and reviewer. Keep changes small,
reviewable, and scoped to the active backlog task.
