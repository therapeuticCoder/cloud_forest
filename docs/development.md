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

The local services are:

| Service             | Endpoint                | Purpose                    |
| ------------------- | ----------------------- | -------------------------- |
| PostgreSQL 17       | `localhost:5432`        | Durable application data   |
| Mailpit             | `http://localhost:8025` | Captured development email |
| Garage S3 API       | `http://localhost:3900` | Local object storage       |
| Garage web endpoint | `http://localhost:3902` | Local stored-object access |

Values in `.env.example` are safe development-only defaults. Never reuse them
outside the local machine.

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
docker compose exec -T postgres pg_dump --clean --if-exists --no-owner --username human_forest human_forest | Set-Content -Encoding utf8 backups\human_forest.sql
```

Restoring replaces current local application data. Confirm the target first,
then run:

```powershell
Get-Content -Raw backups\human_forest.sql | docker compose exec -T postgres psql --username human_forest --dbname human_forest
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
pnpm.cmd --filter @human-forest/web exec vite preview
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
