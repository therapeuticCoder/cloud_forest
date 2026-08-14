# Human Forest

Human Forest is a React prototype for helping people deliberately cultivate a
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

Install dependencies:

```bash
pnpm install
```

Or run the repeatable environment setup, which verifies tool versions, installs
from the lockfile, and runs the full project check:

```powershell
pnpm.cmd setup
```

Run the app locally:

```bash
pnpm dev
```

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

## Project structure

```text
src/
  app/
  components/
    human-forest/
    layout/
    ui/
  data/
  lib/
  test/
```

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
