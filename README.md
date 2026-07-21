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

Use Node.js `20.19` or newer in the Node 20 line, or Node.js `22.12` or
newer. This project pins pnpm `11.1.2` through the `packageManager` field.

Install dependencies:

```bash
pnpm install
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
- `docs/workflow.md`

The human remains the product owner and reviewer. Keep changes small,
reviewable, and scoped to the active backlog task.
