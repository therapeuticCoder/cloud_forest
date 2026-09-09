# Development

Cloud Forest is developed on Windows 11 with PowerShell, Node `22.23.2`, pnpm `11.1.2`, and Docker Desktop.

Use `.cmd` shims when PowerShell blocks script wrappers.

## Local setup

```powershell
nvm use 22.23.2
corepack.cmd enable
corepack.cmd prepare pnpm@11.1.2 --activate
pnpm.cmd setup
Copy-Item .env.example .env
pnpm.cmd services:up
pnpm.cmd db:migrate
```

Run API and web app in separate terminals:

```powershell
pnpm.cmd dev:api
pnpm.cmd dev
```

Fastify defaults to `127.0.0.1:3001`; Vite proxies same-origin `/api` requests there.

## Services

Local Compose provides PostgreSQL. Stop services without deleting volumes:

```powershell
pnpm.cmd services:status
pnpm.cmd services:down
```

Do not add destructive volume/database flags without explicit product-owner approval.

## Database

Schema work uses forward Drizzle migrations:

```powershell
pnpm.cmd db:generate
pnpm.cmd db:status
pnpm.cmd db:migrate
pnpm.cmd db:inspect
```

Normal commands use `DATABASE_URL`. Test/integration commands use a distinct `TEST_DATABASE_URL` whose database name contains `test`.

No project command should silently drop, reset, truncate, or replace user data.

## API contracts

After an approved route/contract change:

```powershell
pnpm.cmd openapi:generate
```

Generated OpenAPI/client files are generated artifacts; do not hand-edit them.

## Verification commands

Verification is run only when the product owner asks for it. Useful commands include:

```powershell
pnpm.cmd check
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
pnpm.cmd openapi:check
pnpm.cmd db:migrations:check
pnpm.cmd test:database
pnpm.cmd test:e2e
```

Use the smallest relevant check for the question being answered. A failed permission boundary should be surfaced rather than repeatedly retried.

## PWA review

For production-PWA behavior:

```powershell
pnpm.cmd build
pnpm.cmd --filter @cloud-forest/web exec vite preview
```

The service worker should cache only the static shell unless a later measured requirement changes that boundary.

## Repository boundaries

- `apps/web` must remain browser-safe and must not import server/database implementation.
- `apps/api` owns trusted HTTP/session boundaries.
- `packages/database` is server-only.
- `packages/domain` contains framework-neutral rules when a rule genuinely benefits from shared ownership.
- Add dependencies or external services only with explicit approval.

## Cleanup

Git history is the archive. Remove temporary prototype code once its accepted behavior is represented in the working product or durable product documentation.

When a feature story touches an oversized coordinator, test file, or stylesheet, a cohesive extraction is welcome if it makes that story simpler. Avoid unrelated cleanup campaigns unless explicitly requested.
