# Development Environment

Cloud Forest uses a native Windows development workflow. Keep the repository on
the Windows filesystem, run Codex with its Windows-native agent, and use Docker
Desktop's WSL2 backend for Linux containers.

## Required tools

The verified baseline is:

- Windows 11 with PowerShell
- Git 2.55 or newer
- NVM for Windows 1.2 or newer
- Node.js 22.23.2
- Corepack with pnpm 11.1.2
- Docker Desktop with Docker Compose
- Python 3.14 for development and agent tooling, not the application runtime
- GitHub CLI
- Visual Studio Code
- ChatGPT desktop app in Codex mode with the Windows-native agent

Exact versions verified on August 14, 2026:

| Tool               | Version          |
| ------------------ | ---------------- |
| Windows            | 11 build 26200   |
| Git                | 2.55.0.windows.3 |
| GitHub CLI         | 2.96.0           |
| NVM for Windows    | 1.2.2            |
| Node.js            | 22.23.2          |
| Corepack           | 0.35.0           |
| pnpm               | 11.1.2           |
| Docker Desktop     | 4.86.0           |
| Docker Engine      | 29.7.2           |
| Docker Compose     | 5.3.1            |
| Python             | 3.14.7           |
| Visual Studio Code | 1.131.0          |

Install and select the pinned Node version:

```powershell
nvm install 22.23.2
nvm use 22.23.2
corepack.cmd enable
corepack.cmd prepare pnpm@11.1.2 --activate
```

If PowerShell blocks package-manager `.ps1` wrappers, use `corepack.cmd` and
`pnpm.cmd` rather than changing the machine execution policy.

## Repository setup

From the repository root:

```powershell
pnpm.cmd setup
Copy-Item .env.example .env
pnpm.cmd services:up
pnpm.cmd services:status
pnpm.cmd dev
```

`pnpm.cmd setup` is intentionally repeatable. It verifies the exact Node and
pnpm versions, installs dependencies from the frozen lockfile, and runs the
complete project check.

### Local API

Start the Fastify API with file watching in a separate terminal:

```powershell
pnpm.cmd dev:api
```

The default address is `http://127.0.0.1:3001`, and the database-independent
health endpoint is `GET /api/v1/health`. Set `API_HOST` or `API_PORT` in the
process environment to override the defaults. Invalid values fail before the
server listens. Docker services are not required for the API foundation or its
focused check:

```powershell
pnpm.cmd check:api
```

### OpenAPI and typed client generation

Fastify generates OpenAPI 3.0.3 from the runtime TypeBox schemas registered for
the versioned health and Timeline-item routes. Regenerate the committed server
document and client types after an approved route-contract change:

```powershell
pnpm.cmd openapi:generate
```

This writes:

- `apps/api/openapi/openapi.json`
- `packages/api-client/src/generated/openapi.ts`

Do not edit either file manually. Generation uses fixed metadata, canonical
JSON key ordering, pinned tooling, and no environment-specific server URL or
timestamp. Verify that committed artifacts match a clean regeneration with:

```powershell
pnpm.cmd openapi:check
```

The check generates the expected content in memory and compares it byte for
byte with both artifacts. Missing or stale output exits nonzero and names the
affected file. `pnpm.cmd check` includes this drift check.

`packages/api-client` is a transport-only browser-safe package. Its public
surface is `createApiClient`, the two versioned read operations, and their
result types. Documented HTTP responses are distinct from network failures and
undocumented or schema-invalid responses. Runtime validators are reused from
`packages/api-contracts`; malformed JSON and HTML fallbacks are reported as
unexpected responses rather than asserted into generated types. The package
has no Fastify, Drizzle, PostgreSQL, or database-package dependency. The
Timeline route defaults to a typed not-found result until T-018J supplies its
database-backed resolver.

The local services are:

| Service             | Endpoint                | Purpose                    |
| ------------------- | ----------------------- | -------------------------- |
| PostgreSQL 17       | `localhost:5432`        | Durable application data   |
| Mailpit             | `http://localhost:8025` | Captured development email |
| Garage S3 API       | `http://localhost:3900` | Local object storage       |
| Garage web endpoint | `http://localhost:3902` | Local stored-object access |

Values in `.env.example` are safe development-only defaults. Never reuse them
outside the local machine.

Copy `.env.example` to `.env` before using database commands. The normal
`DATABASE_URL` targets `cloud_forest`; `TEST_DATABASE_URL` must target a
separate local database whose name contains `test`. Prepare and verify the
disposable database without resetting existing data:

```powershell
pnpm.cmd db:test:prepare
pnpm.cmd test:database
pnpm.cmd db:migrate:test
pnpm.cmd db:status:test
pnpm.cmd db:inspect:test
```

Test preparation only creates the named database when it is absent. Migration
apply is forward-only and repeatable. No command automatically drops a
database, schema, table, Docker volume, or migration. Confirm the exact target
separately before any destructive database reset.

Migration generation and checking are separate from database execution:

```powershell
pnpm.cmd db:generate
pnpm.cmd db:migrations:check
```

Generation writes reviewable SQL and Drizzle metadata only and never applies
SQL. The check validates those artifacts without connecting to PostgreSQL.
Normal apply, status, and inspection commands use `DATABASE_URL`; the `:test`
variants use the guarded `TEST_DATABASE_URL`. Each database command reports the
selected variable and database name without printing credentials.

Before T-018K supplies a browser runner and product test, verify the complete
disposable E2E database boundary with:

```powershell
pnpm.cmd test:e2e
```

PostgreSQL must already be available through the existing local Compose
service. The command prepares the test database when absent, applies reviewed
migrations, and runs test-target status and schema inspection. It stops on the
first failure and returns a nonzero exit code. The current shell starts no API,
web, browser, or persistent child process; T-018K owns process startup, signal
forwarding, and guaranteed cleanup when its approved runner is introduced.

Stop the services without deleting their volumes:

```powershell
pnpm.cmd services:down
```

Do not add `--volumes` unless intentionally discarding all local database and
object-storage data.

## Codex Desktop and VS Code

The shared Codex local environment is stored at
`.codex/environments/environment.toml`. New Codex worktrees run
`pnpm.cmd setup`. The available project actions start the app, run checks and
tests, and manage local services.

Keep the Codex approval sandbox enabled. The repository is the writable scope;
machine installations, external network access, and destructive operations
should continue to require explicit approval.

VS Code recommends the Codex, ESLint, Prettier, Tailwind CSS, Docker, and
Playwright extensions. Repository settings use the workspace TypeScript version,
LF line endings, Prettier formatting, and explicit ESLint fixes.

GitHub CLI authentication is interactive:

```powershell
gh auth login -h github.com
gh auth status
```

Never paste an access token into a repository file, prompt, or command recorded
in project documentation.

## Database backup and restore

Create the ignored backup directory and dump the local database:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
docker compose exec -T postgres pg_dump --clean --if-exists --no-owner --username cloud_forest cloud_forest | Set-Content -Encoding utf8 backups\cloud_forest.sql
```

Restoring replaces current local application data. Confirm the target first,
then run:

```powershell
Get-Content -Raw backups\cloud_forest.sql | docker compose exec -T postgres psql --username cloud_forest --dbname cloud_forest
```

Production backup and restore procedures will be separate and provider-managed.

## Verification checklist

### PWA development and local verification

`pnpm.cmd dev` runs the normal Vite development server without generating or
registering the production worker. It also unregisters workers left on that
development origin. The production worker handles navigations network-first
without caching their responses, so an available development page can load and
perform that cleanup instead of being masked by the offline shell.

Use the production build and Vite preview when checking installability and
offline behavior:

```powershell
pnpm.cmd build
pnpm.cmd --filter @cloud-forest/web exec vite preview
```

`localhost` is a browser-trusted local origin. Load it online once and wait for
the offline-ready notice before testing an offline reload. The cached boundary
contains the HTML, compiled JavaScript and CSS, local fonts, interface symbol
sheet, and install icons. It intentionally excludes the mock portrait sprite,
API paths, account data, user content, and all runtime request caching.

For an update check, keep the first preview open, produce a changed build, and
serve it from the same origin. The browser installs the new worker in the
waiting state and the app displays an update notice. **Update now** activates it
and reloads; **Later** preserves the current session. The app checks the worker
again when the page becomes visible and at least hourly while it remains open.

Step Zero is complete when all of these succeed:

```powershell
node --version
pnpm.cmd --version
py -3.14 --version
docker version
docker compose version
gh auth status
pnpm.cmd setup
pnpm.cmd services:up
pnpm.cmd services:status
```

Also verify that VS Code sees the recommended extensions, the Codex action bar
shows the shared actions, a clean Codex worktree completes its setup script, and
the rendered app opens without browser console errors.

## Environment hygiene and recovery

Healthy setup is deliberately non-destructive: `pnpm.cmd setup` verifies the
pinned tools, runs `pnpm install --frozen-lockfile`, and checks the project. It
does not purge dependencies, caches, or build output.

Preview the disposable generated artifacts known to the repository before
removing them:

```powershell
pnpm.cmd clean:generated -- --dry-run
pnpm.cmd clean:generated
```

The cleanup command may delete directories named `dist`, `dist-ssr`,
`coverage`, or `.vite`, plus files ending in `.tsbuildinfo`, while walking the
repository. It does not enter `.git`, `.pnpm-store`, `backups`, or
`node_modules`, and it ignores symbolic links. It must never be expanded to
cover `.env` files, source files, Docker volumes, backups, or user data. A
cleanup involving those categories requires a separate, exact plan and human
confirmation; Docker volumes and backups are outside this command entirely.

If pnpm reports an unexpected modules layout, incompatible virtual store, or
store-index/linking error, first record the exact error and verify
`node --version`, `pnpm.cmd --version`, and `git status --short --branch`. Retry
the deterministic install without deleting anything:

```powershell
pnpm.cmd install --frozen-lockfile
```

If the same dependency-layout error persists, preview the repair targets and
then explicitly confirm the rebuild:

```powershell
pnpm.cmd deps:repair
pnpm.cmd deps:repair -- --confirm
```

The confirmed command removes only directories named `node_modules` inside the
repository, then runs `pnpm install --frozen-lockfile`. It preserves the pnpm
content-addressable store and every protected data category above. Run
`pnpm.cmd check` afterward. Repeating the preview or confirmed repair is safe;
the install reconstructs the same layout from `pnpm-lock.yaml`.

If pnpm still identifies a corrupt global store index, run `pnpm.cmd store
status` and record its output. `pnpm store prune` can discard an expensive
shared cache and redownload packages, so it is not part of repository cleanup;
run it only after explicit human confirmation. Do not manually delete an
unknown store path.

Classify failures from evidence rather than assuming they are harmless:

- A failure reproduced in a normal PowerShell terminal or a second clean
  worktree points toward tracked configuration, the lockfile, or another
  repository defect.
- A permission denial naming `.git` or a path outside the Codex writable scope,
  followed by success for the same command with narrow approval, identifies a
  sandbox boundary.
- A failure tied to antivirus, filesystem ACLs, locked files, Docker Desktop,
  or machine-installed tools is a workstation issue when repository checks and
  clean worktrees do not reproduce it.

The workspace explicitly permits the `esbuild` and `msw` dependency build
scripts in `pnpm-workspace.yaml`. Both are required by tracked tooling. If pnpm
reports `ERR_PNPM_IGNORED_BUILDS`, inspect that allowlist instead of repeatedly
rebuilding `node_modules`; an unclassified build script must be reviewed before
it is allowed or denied.

Approval escalation is appropriate only when the required in-scope operation
is blocked by sandbox or workstation permissions and its exact target is known.
Do not escalate broad deletion, weaken execution policy, or use approval to hide
a repository defect. Setup, permission, sandbox, dependency-install, and build
errors must be investigated when discovered; if work must stop, document the
command, output, classification evidence, and explicit reason for deferral.

## Troubleshooting

- **Wrong Node version:** run `nvm use 22.23.2`, then open a new terminal.
- **`pnpm.ps1` is blocked:** use `pnpm.cmd`.
- **Docker command is missing:** install or start Docker Desktop, then open a new
  terminal.
- **A service port is occupied:** stop the other local service before changing
  committed ports; shared defaults should remain consistent.
- **GitHub authentication fails:** rerun `gh auth login -h github.com`.
- **Codex worktree lacks dependencies:** confirm the Cloud Forest local
  environment is selected when creating the worktree and inspect its setup log.
- **Local data must be reset:** back it up first; volume deletion is destructive
  and should be intentional.
