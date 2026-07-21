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
