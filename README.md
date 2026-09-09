# Cloud Forest

Cloud Forest is a calm social network for tending relationships, exchanging care, organizing cooperation, and keeping control of attention.

The current goal is a small trusted-tester alpha for fewer than 100 people.

## Stack

- TypeScript / pnpm monorepo
- React + Vite + Tailwind + shadcn/ui
- Fastify + TypeBox
- PostgreSQL + Drizzle
- Better Auth
- generated OpenAPI + typed client

## Run locally

Use Node `22.23.2` and pnpm `11.1.2`.

```powershell
pnpm.cmd setup
Copy-Item .env.example .env
pnpm.cmd services:up
pnpm.cmd db:migrate
pnpm.cmd db:fixtures:seed:local
```

Then run API and web app in separate terminals:

```powershell
pnpm.cmd dev:api
pnpm.cmd dev
```

The API defaults to `http://127.0.0.1:3001`; Vite proxies `/api` to it.

## Repository map

```text
apps/
  api/          Fastify service
  web/          React PWA
  worker/       reserved boundary
packages/
  api-client/   generated browser-safe client
  api-contracts/runtime transport contracts
  database/     server-only PostgreSQL/Drizzle boundary
  domain/       framework-neutral rules
```

## Project context

- `NOW.md` — current alpha goal, current increment, thin roadmap, known temporary debt
- `docs/product.md` — product purpose and alpha promises
- `docs/relationships.md` — Character, Connection, layers, Holding, Guilds, Signals
- `docs/care.md` — care and aid behavior
- `docs/privacy.md` — authorization and privacy invariants
- `docs/design.md` — visual and interaction language
- `docs/development.md` — environment and command reference
- `AGENTS.md` — permanent agent behavior rules

Git history preserves previous plans, prototypes, implementation context, and retired documentation.
