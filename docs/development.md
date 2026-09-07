# Development Environment

Cloud Forest is developed on the Windows filesystem with PowerShell and Docker
Desktop's WSL2 backend. The supported baseline is Windows 11, Git 2.55+, NVM
for Windows 1.2+, Node `22.23.2`, pnpm `11.1.2`, Docker Desktop/Compose, Python
3.14 for tooling, GitHub CLI, VS Code, and the Windows-native Codex agent.

Use `.cmd` shims when PowerShell blocks scripts:

```powershell
nvm use 22.23.2
corepack.cmd enable
corepack.cmd prepare pnpm@11.1.2 --activate
pnpm.cmd setup
```

`pnpm.cmd setup` verifies versions, installs from the frozen lockfile, and runs
the full check without deleting a healthy dependency layout.

If the Windows `py -3.14` launcher reports no installed interpreter while
`python --version` reports the pinned Python, use `python` directly and leave
the launcher configuration unchanged.

## Local application and services

```powershell
Copy-Item .env.example .env
pnpm.cmd services:up
pnpm.cmd services:status
pnpm.cmd db:migrate
pnpm.cmd dev:api
pnpm.cmd dev
```

Run API and web watchers in separate terminals. Fastify defaults to
`127.0.0.1:3001`; Vite proxies same-origin `/api` requests there. The health
route does not require Docker or PostgreSQL:

```powershell
pnpm.cmd check:api
```

Local Compose provides PostgreSQL on `5432`, Mailpit at `localhost:8025`, and
Garage's S3/object endpoints on `3900`/`3902`. `.env.example` is local-only.
Stop containers without deleting volumes with `pnpm.cmd services:down`; never
add `--volumes` without explicit authorization to discard local data.

## Contracts and databases

After an approved route change:

```powershell
pnpm.cmd openapi:generate
pnpm.cmd openapi:check
```

Generation owns `apps/api/openapi/openapi.json` and
`packages/api-client/src/generated/openapi.ts`; do not edit them manually. The
client remains browser-safe and transport-only, with documented HTTP, network,
and invalid-response failures kept distinct.

Database schema work uses reviewed forward migrations:

```powershell
pnpm.cmd db:generate
pnpm.cmd db:migrations:check
pnpm.cmd db:status
pnpm.cmd db:migrate
pnpm.cmd db:inspect
```

Generation writes SQL and metadata but does not connect. Normal commands use
`DATABASE_URL`. Integration and E2E commands require `TEST_DATABASE_URL` to
name a separate local database containing `test`:

```powershell
pnpm.cmd db:test:prepare
pnpm.cmd db:migrate:test
pnpm.cmd db:status:test
pnpm.cmd db:inspect:test
pnpm.cmd test:database
```

Test preparation creates the named database only when absent. No project
command drops, resets, truncates, or rolls back a database automatically.
Database output names the selected variable and database without printing its
credentials.

Back up the normal local database before an intentional reset:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
docker compose exec -T postgres pg_dump --clean --if-exists --no-owner --username cloud_forest cloud_forest | Set-Content -Encoding utf8 backups\cloud_forest.sql
```

Restore only after confirming the target; restoration replaces current data:

```powershell
Get-Content -Raw backups\cloud_forest.sql | docker compose exec -T postgres psql --username cloud_forest --dbname cloud_forest
```

## Verification

The proportional full gate is `pnpm.cmd check`. Focused commands are listed in
`README.md`. The local vertical-slice browser gate requires PostgreSQL and the
pinned Chromium runtime:

```powershell
pnpm.cmd e2e:install
pnpm.cmd test:e2e
```

The gate prepares the guarded test database; starts API and Vite on strict ports
3001 and 5173; exercises desktop `1440x900` and mobile `390x844`; checks the
database-backed Timeline path, representative Timeline/Curator/care behavior,
focus recovery, overflow, stale-service-worker cleanup, console/page errors,
and reviewed screenshots; then terminates its process tree. Codex needs Windows
process-control permission for reliable teardown. Artifacts are ignored under
`test-results/`. Update baselines only after visual approval:

```powershell
pnpm.cmd test:e2e -- --update-snapshots
```

### E2E and verification failure discipline

These rules are mandatory. Do not improvise around them, and do not hide a
failure by rerunning a larger command until the output looks better.

- Install the pinned browser explicitly with `pnpm.cmd e2e:install`. The
  `test:e2e` preflight must fail before database or service startup when that
  browser is missing. Do not add an automatic download to the test command.
- The E2E migration target and E2E API target must be identical. Migrations use
  `TEST_DATABASE_URL`; the API process started by the E2E harness must receive
  that same value as `DATABASE_URL`. If Better Auth reports that `verification`
  is missing while Timeline requests succeed, stop: this is a database-target
  mismatch until proven otherwise, not a UI failure.
- Treat the pipeline as staged evidence: formatting, lint, contracts, types,
  unit tests, build, and E2E are separate gates. A passing test suite does not
  mean the build or full check passed, and a passing E2E run does not clear a
  failed lint or type gate.
- Never rerun a failing full gate blindly. Read the latest terminal output,
  name the failing stage and root cause, make one focused repair, and rerun the
  smallest relevant check only when the owner authorizes verification. Every
  rerun must have a specific reason; elapsed time is not a reason.
- Never claim success from a partial, truncated, or stale terminal buffer. The
  final line and exit code must be visible. If the terminal output is ambiguous,
  stop and ask for the current output instead of guessing.
- The Codex executor and the in-app terminal are not guaranteed to share
  environment variables, browser caches, or process state. Diagnose `PATH`,
  `LOCALAPPDATA`, `PLAYWRIGHT_BROWSERS_PATH`, and database URLs before treating
  their results as contradictory.
- `Not implemented: window.scrollTo()` is jsdom noise caused by browser-only
  behavior in a test environment. Keep the shared test setup responsible for a
  harmless no-op mock; do not weaken production scroll behavior and do not
  mistake the warning for a passing verification signal.
- For style repairs, format the exact files named by Prettier with the root
  Windows shim (`.\\node_modules\\.bin\\prettier.cmd <files> --write`). Do not
  format the whole repository to repair a focused change, and do not introduce
  unrelated churn.

## PWA and remote-device review

Development does not register the production worker and removes a stale worker
from its origin. For installability, update, or offline-shell checks, build and
run Vite preview. Load once online and wait for the offline-ready notice before
disconnecting. Only static shell assets are cached; API and user data are not.

For an ordinary phone layout check on trusted private Wi-Fi, run API normally
and expose only Vite:

```powershell
pnpm.cmd --filter @cloud-forest/web dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Use `Get-NetIPAddress -AddressFamily IPv4` to find the workstation address and
open `http://<address>:5173`. Do not use public Wi-Fi, expose the API, broaden
CORS/allowed hosts, or create a persistent firewall rule.

For the private HTTPS installed-PWA and annotated-review path, both devices must
already be signed into Tailscale with tailnet HTTPS enabled:

```powershell
tailscale serve --bg 4173
tailscale serve status
```

Copy the exact printed `*.ts.net` hostname. If Windows reports `Access is
denied`, retry only the Tailscale command in an approved elevated session. Then:

```powershell
$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = "<exact-hostname>.ts.net"
pnpm.cmd build
pnpm.cmd --filter @cloud-forest/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort
```

Never use a wildcard host or Tailscale Funnel. If filtered `vite` is not found,
run `apps/web/node_modules/.bin/vite.cmd` from `apps/web`; if `dist` is absent,
build first. Rebuild and restart preview after changes. In an installed PWA,
choose **Update now** before reviewing so an older worker does not mask the
bundle. Stop only the API/preview processes started for the session. Remove the
private listener when requested:

```powershell
tailscale serve reset
tailscale serve status
```

The expected final status is no Serve configuration.

## Recovery and permission boundaries

Inspect before deleting generated output:

```powershell
pnpm.cmd clean:generated -- --dry-run
pnpm.cmd clean:generated
```

This allowlisted cleanup covers repository `dist`, `dist-ssr`, `coverage`,
`.vite`, and `.tsbuildinfo`, excluding links, `.git`, `.pnpm-store`, backups,
`node_modules`, source, `.env`, volumes, and user data.

For dependency-layout or link errors, record the exact error and inspect Node,
pnpm, and Git state. Retry without deletion:

```powershell
pnpm.cmd install --frozen-lockfile
```

If the same layout error persists, preview and explicitly confirm repository
dependency reconstruction:

```powershell
pnpm.cmd deps:repair
pnpm.cmd deps:repair -- --confirm
```

The confirmed repair removes only repository `node_modules`, reinstalls from
the lockfile, and preserves the shared store and protected data. If pnpm reports
ignored builds, inspect the tracked `esbuild`/`msw` allowlist before changing
it. Store pruning requires separate approval.

Classify failures from evidence. Reproduction in an ordinary terminal or clean
worktree suggests a repository defect. A denial naming `.git` or a path outside
the writable scope that succeeds under narrow approval identifies a sandbox or
workstation boundary. Do not loop on the same blocked command, weaken machine
policy, or hide a repository failure with escalation. Record unresolved command,
output, classification, and next action.

For GitHub credential failures inside the sandbox, verify the same narrow `gh`
operation under approved access; do not repeatedly reauthenticate without
evidence. Keep tokens out of prompts, commands, and tracked files.

Tracked text is LF by `.gitattributes`, `.editorconfig`, and Prettier. Do not
change global `core.autocrlf`. Use `git ls-files --eol` when diagnosing drift;
renormalize only for an approved policy change and review the entire staged diff.
