# Cloud Forest

Cloud Forest is a working product prototype for helping people deliberately
cultivate a smaller, community-centered social world. It organizes people,
groups, and public sources by relational depth so that not everything competes
for attention on equal terms. The prototype runs in a pnpm TypeScript monorepo
with an installable React PWA, a versioned Fastify API, shared contract and
domain packages, and a PostgreSQL data boundary. It has two views:

- Curator: the primary layered view for selecting and managing Party, Tribe,
  Guilds, and Signals.
- Timeline: the currently active chronological view of relationship activity.

Timeline and Curator are switchable in the current app. Current product work
prioritizes making these functional paths durable while preserving their
approved responsive and accessible interaction patterns.

## Tech stack

- TypeScript and pnpm workspaces
- React PWA with Vite, Tailwind CSS, and shadcn/ui
- Fastify with TypeBox-validated versioned contracts
- generated OpenAPI and a transport-only typed API client
- PostgreSQL with Drizzle and reviewed SQL migrations
- Vitest, Node test runner, and pinned Playwright Chromium
- ESLint and Prettier

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

The web application requests versioned routes from the same-origin `/api`
boundary. During local development, Vite proxies that path to the default API
address, so run `pnpm dev` and `pnpm dev:api` in separate terminals. The first
Timeline card is loaded through this boundary from PostgreSQL. The other seven
visible cards remain intentionally mock-backed until later product slices
replace them through similarly narrow seams.

The API's registered TypeBox route schemas generate the committed OpenAPI
artifact at `apps/api/openapi/openapi.json`. That document generates the
transport types used by `packages/api-client`:

```powershell
pnpm.cmd openapi:generate
pnpm.cmd openapi:check
```

Generation is deterministic and `openapi:check` fails when either the OpenAPI
document or generated client types differ from their committed form. The API
client exposes only the versioned health and Timeline-item reads. It uses the
platform `fetch` implementation and returns distinct typed success, documented
HTTP error, network error, and unexpected-response results.

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
`db:generate` only writes migration artifacts; it never connects to a database
or applies SQL. `db:migrations:check` validates the committed SQL and metadata
without connecting to a database. The remaining commands explicitly report the
environment variable and database name they target.

Normal local database commands use `DATABASE_URL`. Their disposable-test
counterparts require the guarded `TEST_DATABASE_URL`:

```powershell
pnpm.cmd db:migrate:test
pnpm.cmd db:status:test
pnpm.cmd db:inspect:test
```

`db:migrate` applies pending migrations forward and is a successful no-op when
the database is current. `db:status` and `db:inspect` are read-only. Direct
schema push and automatic rollback are not supported.

Database integration tests require `TEST_DATABASE_URL` to name a distinct local
database containing `test`. `pnpm.cmd test:database` creates that database when
absent, applies migrations, and runs isolated fictional fixtures. It never
drops or resets a database. Any destructive reset requires separate explicit
confirmation.

The local E2E gate prepares and verifies that same isolated test database, then
starts the API against `TEST_DATABASE_URL`, starts Vite with its same-origin
`/api` proxy, and runs one deterministic Chromium suite at desktop and mobile
sizes:

```powershell
pnpm.cmd test:e2e
```

Local PostgreSQL and the Playwright Chromium runtime must already be available.
Install that runtime after a fresh dependency install with
`pnpm.cmd exec playwright install chromium`. The command fails before mutation
when `TEST_DATABASE_URL` is missing or unsafe, applies only reviewed forward
migrations, proves the migrated Mira item reaches the rendered Timeline through
PostgreSQL and the API, and smoke-checks representative Timeline and Curator
behavior. It also checks keyboard focus recovery, page overflow, development
service-worker cleanup by seeding and removing a stale registration, browser
console health, and committed desktop/mobile Timeline screenshots. Snapshot
contexts use the fixed `America/Chicago` timezone so fixture times are portable
across workstations.

API, Vite, and browser logs stream to the terminal. Failure screenshots and
traces are written below ignored `test-results/`. Playwright owns the service
process groups, and the root runner handles interruption and enforces a bounded
process-tree cleanup. POSIX forwards the requested signal; Windows terminates
the complete child tree because it does not support those signals. Existing
listeners on ports 3001 or 5173 fail startup instead of being reused.

Reviewed visual baselines live in `e2e/snapshots`. Update them only for an
approved visual change, then inspect their Git diff directly:

```powershell
pnpm.cmd test:e2e -- --update-snapshots
```

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
  api-client/      # generated types and transport-only API client boundary
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
api-client -> generated OpenAPI transport types
api-client -> api-contracts -> domain
database -> domain
domain -> no workspace package
```

Other shared-package dependencies should be introduced only by the task that
needs them. Use pnpm's `workspace:` protocol when an approved implementation
adds an internal dependency. The database package is server-only and must not
be consumed by the web application or API client.

`apps/web` may consume `@cloud-forest/api-client`. The client must not import
Fastify, API implementation modules, Drizzle, `pg`, or `packages/database`.

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
