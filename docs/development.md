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

After copying `.env` and starting the local PostgreSQL service, apply the
reviewed migrations to the configured normal development database:

```powershell
pnpm.cmd db:migrate
```

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

The browser uses same-origin `/api` URLs. The local Vite server proxies that
path to `http://127.0.0.1:3001`, so no CORS configuration is needed for local
development. Start both `pnpm.cmd dev:api` and `pnpm.cmd dev` when verifying the
database-backed Timeline item. The API scripts load the same root `.env` used by
the migration commands, so both processes select the same `DATABASE_URL`.

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
Timeline route retains an injected resolver seam: production startup supplies
the PostgreSQL-backed resolver, while isolated route tests can supply a fixture
resolver or exercise the typed not-found default.

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

Run the complete local vertical-slice and prototype regression gate with:

```powershell
pnpm.cmd test:e2e
```

PostgreSQL must already be available through the existing local Compose
service. The command prepares the test database when absent, applies reviewed
migrations, and runs test-target status and schema inspection. It then starts
the API with `DATABASE_URL` scoped to the guarded `TEST_DATABASE_URL`, starts
Vite on `127.0.0.1:5173` with the same-origin `/api` proxy, and runs the pinned
Playwright Chromium suite at 1440 by 900 and 390 by 844.

Install the matching local browser runtime once after dependency installation:

```powershell
pnpm.cmd exec playwright install chromium
```

The browser gate verifies the migrated Mira response and rendered card,
representative Timeline and Curator interactions, keyboard focus recovery,
page-level horizontal overflow, development cleanup of a deliberately seeded
stale service worker, console and page errors, and reviewed desktop/mobile visual
baselines. Browser contexts use `America/Chicago` so fixture timestamps and
screenshots do not vary with the workstation timezone. Failure traces and
screenshots are ignored under `test-results/`; API and Vite output remains
visible in the terminal. Ports 3001 and 5173 are strict, readiness and total
runtime are bounded, and the complete runner tree is terminated after success,
failure, timeout, or interruption. POSIX runs the browser gate as a dedicated
process group and signals that whole group. Windows terminates the child tree
because it does not support those signals, so Codex must have process-control
permission; otherwise the browser assertions can pass while sandboxed teardown
is denied.

Update visual baselines only after the rendered change is approved and review
the resulting PNG diff:

```powershell
pnpm.cmd test:e2e -- --update-snapshots
```

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
sheet, install icons, and fictional mock portrait assets. It excludes API paths,
account data, user content, and all runtime request caching.

For an update check, keep the first preview open, produce a changed build, and
serve it from the same origin. The browser installs the new worker in the
waiting state and the app displays an update notice. **Update now** activates it
and reloads; **Later** preserves the current session. The app checks the worker
again when the page becomes visible and at least hourly while it remains open.

### Phone demo and PWA testing

Use a spare phone for real touch, viewport, browser-chrome, and installed-PWA
checks. Keep all demo data fictional. Two workflows cover different goals.

#### Quick trusted-LAN browser test

This path needs no phone software and is appropriate for responsive layout,
touch, scrolling, navigation, and ordinary interaction checks. It is not an
installability or offline-shell test because an HTTP LAN address is not a secure
browser context.

Connect the workstation and phone to the same trusted private Wi-Fi. Prepare the
normal local database, then run the API and a LAN-visible Vite development
server in separate PowerShell terminals:

```powershell
pnpm.cmd services:up
pnpm.cmd db:migrate
pnpm.cmd dev:api
```

```powershell
pnpm.cmd --filter @cloud-forest/web dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Find the workstation's active private IPv4 address:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' }
```

On the phone, open `http://<workstation-ip>:5173`. The browser still uses the
same-origin `/api` path; Vite proxies it inside the workstation to the API on
`127.0.0.1:3001`, so the API does not need a LAN binding or CORS policy.

If Windows asks about Node.js network access, allow only the current private
network. Do not set Vite's allowed hosts or CORS policy to unrestricted values,
do not use this workflow on public Wi-Fi, and do not create a broad persistent
firewall rule. Stop the Vite and API terminals when the test ends.

#### Private HTTPS installed-PWA test with Tailscale Serve

Use this path for service-worker installation, standalone display, update
prompts, and offline-shell checks. It requires separately installing and signing
in to Tailscale on both the Windows workstation and phone and enabling HTTPS for
the private tailnet. Those are human-controlled external-service steps, not
repository setup.

Prepare the local data and API:

```powershell
pnpm.cmd services:up
pnpm.cmd db:migrate
pnpm.cmd dev:api
```

In another terminal, expose the not-yet-started loopback preview to the private
tailnet in the background and copy the exact `*.ts.net` hostname that Tailscale
prints:

```powershell
tailscale serve --bg 4173
tailscale serve status
```

On this Windows workstation, reading or changing the Tailscale Serve
configuration may require an elevated PowerShell session because the Tailscale
daemon is protected by Windows administrators-only IPC. If the command reports
`Access is denied`, rerun only that Tailscale command in an approved elevated
session; do not broaden the Vite host policy or grant the application access to
the whole filesystem. A healthy mapping reports the exact tailnet URL and
`proxy http://127.0.0.1:4173`.

Before starting Vite preview, allow only that exact Tailscale hostname in the
preview terminal. Replace the example value with the hostname printed above;
do not use `*.ts.net`, `.ts.net`, or an unrestricted host allowlist:

```powershell
$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = "<workstation-name>.<tailnet-name>.ts.net"
pnpm.cmd build
pnpm.cmd --filter @cloud-forest/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort
```

If filtered `pnpm.cmd ... exec vite preview` says that `vite` is not
recognized, use the workspace-local executable from the web package instead.
Run it from `apps/web`, because Vite resolves `dist` relative to its current
directory:

```powershell
Set-Location apps/web
$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = "<workstation-name>.<tailnet-name>.ts.net"
.\node_modules\.bin\vite.cmd preview --host 127.0.0.1 --port 4173 --strictPort
```

If preview says `The directory "dist" does not exist`, build first with
`pnpm.cmd --filter @cloud-forest/web build`, then start preview from
`apps/web`. Keep this preview terminal running while testing; Tailscale Serve
forwards only to the live loopback process.

Vite preview inherits the development server's narrow host policy. The
`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` value admits the reverse-proxied
request without allowing unrelated hostnames and applies only to that terminal
session.

Open the printed HTTPS URL on the connected phone. In Android Chrome, use
**Install app** from the three-dot menu; on iPhone, use **Add to Home Screen**
and enable **Open as Web App**. Load the app online once and wait for its
offline-ready notice before testing an offline reload. The installed shell,
portrait assets, and text-backed mock content remain available offline. The
database-backed Timeline card remains
in its loading state or shows its accessible error state while the API is
unavailable. Build a changed version and restart the preview on the same origin
to test **Update now** and **Later**.

Background Serve configuration persists for later demo sessions and only
forwards successfully while the loopback preview is running. For Cloud Forest
UI work, keep this private URL as the standing browser-review path across
tasks: rebuild when source changes, restart the preview on port 4173, and
reload the exact `*.ts.net` URL. If an installed PWA offers an update, choose
**Update now** before judging the new build; an older service worker can keep
showing the previous bundle. Stop the API and preview terminals when testing
ends if the workstation should not remain available. To remove the HTTPS
listener, run:

```powershell
tailscale serve --https=443 off
```

Use Tailscale Serve only; never substitute Tailscale Funnel, which would expose
the preview publicly. Vite preview is a local build-inspection server, not a
production host.

Official references:

- [Vite server options](https://vite.dev/config/server-options)
- [Vite preview options](https://vite.dev/config/preview-options)
- [MDN secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts)
- [Tailscale Serve](https://tailscale.com/docs/reference/tailscale-cli/serve)
- [Install a web app on iPhone](https://support.apple.com/guide/iphone/iphea86e5236/ios)

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

## Line endings

The repository owns its line-ending policy. `.gitattributes` keeps detected
text files LF in both the Git index and worktree on Windows and Linux, while
tracked binary assets are marked binary. `.editorconfig` and Prettier use the
same LF policy. Do not change machine-level `core.autocrlf` settings to work on
this repository; repository attributes take precedence.

Generated OpenAPI and typed-client artifacts are compared byte for byte and
their generators emit LF. A native Windows checkout must therefore retain LF
for those artifacts. Inspect effective policy and tracked state with:

```powershell
git check-attr text eol -- README.md apps/api/openapi/openapi.json apps/web/public/pwa-192x192.png
git ls-files --eol
```

When the policy itself changes, use `git add --renormalize .` once and review
the complete staged diff before committing. Routine development does not need
renormalization.

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
