# Backlog

This backlog is the repo-local source of truth for agent-sized tasks. Tasks
should be small enough for one focused agent session.

## Completed

- T-001: Refresh project docs for Human Forest
- T-002: Rename the relationship layer from pod to party
- T-003: Decouple Galaxy and Timeline into switchable views
- T-004: Add Curator View shell and vertical scroll stack
- T-005: Add Curator mock data
- T-006: Build Party layer cards
- T-007: Build Tribe horizontal neighborhood pager
- T-008: Build Guilds accordion layer
- T-009: Build Signals accordion layer
- T-016: Establish the native Windows development environment
- T-017: Calibrate the Human Forest visual direction

## Gallery Refactor

### T-011: Build the shared Curator gallery foundation

Status: done
Size: medium

Goal:
Replace the framed Curator layer presentation with a reusable, full-viewport
gallery system and a minimal full-screen selection destination.

Acceptance criteria:

- four layers remain full-height vertical snap pages
- persistent layer headings, descriptions, badges, and navigation hints are removed
- a shared accessible tile supports layer accents, initials or icons, responsive sizing, and interaction states
- selecting a tile opens a full-screen destination with one back control
- back, Escape, and browser history restore the layer view, scroll position, and tile focus
- layer transitions are restrained and respect reduced-motion preferences
- no routing, persistence, dependencies, or detail actions are added
- `pnpm check` passes

### T-012: Refactor Party into gallery tiles

Status: done
Size: small

Goal:
Present the Party as five large, quiet relationship tiles plus a tile for the
user.

Acceptance criteria:

- Party contains exactly 5 chosen relationships plus 1 user tile
- tiles show only initials and display name
- Party tiles are the largest Curator tile treatment
- each tile opens the shared destination
- `pnpm check` passes

### T-013: Refactor Tribe into paged gallery tiles

Status: done
Size: medium

Goal:
Preserve Tribe neighborhood pagination while replacing mini-cards with a dense
relationship gallery.

Acceptance criteria:

- Tribe contains 100 people across 5 neighborhoods of 20
- one neighborhood occupies each horizontal snap page
- no persistent neighborhood headings, counters, arrows, or instructions appear
- horizontal touch and trackpad navigation remains contained within Tribe
- tiles show only initials and compact names and open the shared destination
- `pnpm check` passes

### T-014: Replace Guild accordions with tiles

Status: done
Size: small

Goal:
Present the five Guilds as one icon-led gallery.

Acceptance criteria:

- Guilds contains exactly 5 tiles in one viewport
- tiles show only an icon and group name
- descriptions, member counts, and activity remain in the data model
- each tile opens the shared destination
- no Guild accordion remains
- `pnpm check` passes

### T-015: Replace Signal accordions with tiles

Status: done
Size: small

Goal:
Present ten intentionally selected Signals as the quietest Curator gallery.

Acceptance criteria:

- Signals contains exactly 10 icon-led tiles in one viewport
- tiles show only a category icon and source name
- detailed Signal fields remain in the data model
- each tile opens the shared destination
- no Signal accordion remains
- `pnpm check` passes

## Working Prototype Roadmap

### T-016: Establish the native Windows development environment

Status: done
Size: medium

Goal:
Make a clean Human Forest checkout reproducible for the product owner and Codex
before changing the application architecture.

Acceptance criteria:

- Node 22.23.2 and pnpm 11.1.2 are pinned and verified
- Docker Desktop, Compose, Python, Git, GitHub CLI, VS Code, and Codex tooling are
  installed or have an explicit human-only authentication step
- PostgreSQL, local email capture, and S3-compatible storage start through one
  documented command
- a shared Codex environment and VS Code recommendations expose working project
  actions
- a clean worktree completes setup and `pnpm check`
- backup and restore instructions are verified

### T-017: Calibrate the Human Forest visual direction

Status: done
Size: medium

Goal:
Create and approve a visual source of truth before further broad UI work.

Acceptance criteria:

- the product owner supplies annotated references, anti-references, and a current
  UI critique
- three distinct static directions are reviewed for one representative screen
- one selected direction is implemented and approved at mobile and desktop sizes
- accessibility, keyboard, motion, overflow, and content variation are reviewed
- approved principles, tokens, patterns, and anti-patterns are recorded in the
  repository

Completed state:

- a selected direction has been implemented on the representative Timeline at
  desktop and mobile sizes
- browser review covered responsive layout, scrolling chrome, keyboard focus,
  reduced-motion behavior, overflow, screenshots, and console health
- the product owner approved the implemented direction
- the reusable principles, tokens, component patterns, responsive behavior, and
  anti-patterns are recorded in `docs/design-guide.md`

### T-018: Create the application monorepo foundation

Status: queued
Size: large; split before implementation

Goal:
Establish the React PWA, Fastify API, worker, contracts, domain, database, local
cache, and test boundaries through one thin client-to-database vertical slice.

Acceptance criteria:

- work is divided into small reviewable child tasks before editing
- new dependencies are approved and introduced only with their owning child task
- PostgreSQL migrations are reviewed SQL and run locally
- the versioned API validates requests and responses and generates OpenAPI
- database migration and E2E commands become working Codex actions
- the existing visual prototype remains usable while mock-only data is replaced
  incrementally
