# Backlog

This backlog is the repo-local source of truth for agent-sized tasks.

Tasks should be small enough for one focused agent session.

## Ready for Agent

### T-001: Refresh project docs for Human Forest

Status: done
Size: small

Goal:
Replace inherited Calm React Starter language with Human Forest-specific project language.

Acceptance criteria:

- `README.md` describes Human Forest, the current prototype, and local development commands
- `docs/project-brief.md` describes the Human Forest product concept and current prototype scope
- `DECISIONS.md` records that Curator, Galaxy, and Timeline are separate views
- Starter-only wording is removed where it would confuse future agents
- `pnpm check` passes

Notes:
This should be its own documentation-only PR before feature work continues.

### T-002: Rename the relationship layer from pod to party

Status: done
Size: small

Goal:
Update the domain language so the innermost relationship layer is called `party` instead of `pod`.

Acceptance criteria:

- `HumanForestLayer` uses `"party"` instead of `"pod"`
- Mock actors that currently use `layer: "pod"` use `layer: "party"`
- UI labels, helper names, variable names, tests, and copy say Party where they refer to the innermost relationship layer
- Existing Galaxy and Timeline behavior is preserved after the rename
- No unrelated visual redesign is included
- `pnpm check` passes

Notes:
Keep this as a focused rename PR. Do not build Curator View in this PR.

### T-003: Decouple Galaxy and Timeline into switchable views

Status: done
Size: medium

Goal:
Separate the current side-by-side dashboard into distinct views and add a simple switcher for Timeline and Curator-ready navigation.

Acceptance criteria:

- Existing `RelationshipField` is wrapped or renamed into a `GalaxyView` component
- Existing `TimelinePanel` is wrapped or adapted into a standalone `TimelineView`
- `DashboardShell` or a new top-level shell renders one active view at a time
- A simple shadcn-style button group or local `ViewSwitcher` lets the user switch between `timeline` and `curator`
- Galaxy may remain present in code but does not need to be exposed in the switcher yet
- The default active view can remain Timeline until Curator exists, or use a temporary Curator placeholder
- Tests cover the view switcher and standalone Timeline rendering
- `pnpm check` passes

Notes:
Let the Galaxy view languish. Preserve it, but do not polish it.

### T-004: Add Curator View shell and vertical scroll stack

Status: done
Size: medium

Goal:
Create the basic Curator View scaffold with four fixed viewport slices arranged by relational depth.

Acceptance criteria:

- `CuratorView` exists under `src/components/human-forest`
- Curator View has four vertical sections in order: Party, Tribe, Guilds, Signals
- The vertical axis uses fixed viewport slices with CSS scroll snap
- The view works on mobile and desktop without relying on the old Galaxy absolute-position map layout
- Styling uses Tailwind classes and shadcn components where useful, not ad hoc inline CSS
- Curator View is reachable from the view switcher
- Tests assert that the Curator View and all four layer headings render
- `pnpm check` passes

Notes:
Keep this PR mostly structural. Placeholder content is acceptable.

### T-005: Add Curator mock data

Status: done
Size: small

Goal:
Add dummy data shaped for the Curator View without overfitting to the Galaxy map data.

Acceptance criteria:

- Curator data lives in a clear data file such as `src/data/curatorMockData.ts`
- Data includes 6 party people
- Data includes up to 150 tribe people grouped into 5 neighborhoods
- Data includes 5 guild rows with description, member count, and recent status/activity
- Data includes 5 signal rows with domain/category metadata and recent status/activity
- Data uses fake names/content only; no real personal or sensitive data
- TypeScript types are explicit and colocated in the appropriate existing type file or a small Curator-specific type file
- `pnpm check` passes

Notes:
This can happen before or after the Curator shell PR. If done before, do not wire up a large UI yet.

### T-006: Build Party layer cards

Status: done
Size: small

Goal:
Implement the Curator Party layer as a calm 2x3 grid of large person cards.

Acceptance criteria:

- Party layer renders exactly 6 large person cards
- Cards use shadcn `Card` and `Badge` where helpful
- Cards use initials or simple placeholder avatar treatment
- Cards leave room for future lightweight relational state, but do not overbuild presence logic
- Layout is 2 columns on narrow screens and 3 columns where space allows
- Tests assert representative party people render
- `pnpm check` passes

Notes:
Party should feel intimate and spacious, not like a notification dashboard.

### T-007: Build Tribe horizontal neighborhood pager

Status: done
Size: medium

Goal:
Implement the Curator Tribe layer as horizontally paginated neighborhoods of smaller person cards.

Acceptance criteria:

- Tribe renders up to 5 horizontal pages/neighborhoods
- Each page supports up to 30 visible people in a compact grid
- Horizontal movement uses CSS scroll snap
- Cards are visibly less prominent than Party cards
- Neighborhood labels or lightweight page indicators are included
- Layout remains usable on mobile and desktop
- Tests assert multiple neighborhoods and representative tribe people render
- `pnpm check` passes

Notes:
Horizontal movement is only within the Tribe layer. Avoid making the whole app feel like an infinite feed.

### T-008: Build Guilds accordion layer

Status: ready
Size: small

Goal:
Implement the Curator Guilds layer as five accordion rows for people containers.

Acceptance criteria:

- Guilds layer renders 5 accordion rows/cards
- Rows use shadcn Accordion or the repo's local shadcn-compatible Accordion component
- Each open row reveals description, member count, and recent status/activity
- Guilds use icons or container-like treatment, not portrait-forward person cards
- Tests assert at least one guild expands and reveals details
- `pnpm check` passes

Notes:
Guilds are communities/contexts, not individual relationships.

### T-009: Build Signals accordion layer

Status: ready
Size: small

Goal:
Implement the Curator Signals layer as five ambient outer-world accordion rows.

Acceptance criteria:

- Signals layer renders 5 accordion rows/cards
- Rows use domain/category icons, not celebrity-style portrait cards
- Example domains can include politics, music, film, local civic, technology, art, or science
- Open rows reveal description and recent status/activity
- Visual treatment is clearly less intimate than Party and Tribe
- Tests assert at least one signal expands and reveals details
- `pnpm check` passes

Notes:
Avoid envy/celebrity-worship visual patterns. Signals should feel ambient and lower-priority.

### T-010: Polish Curator View responsiveness and calm interaction

Status: ready
Size: medium

Goal:
Tighten the Curator View so the prototype feels complete enough for review on mobile and desktop.

Acceptance criteria:

- Curator View has stable spacing, no obvious clipping, and no accidental overlap
- Scroll snap works vertically for the main layers and horizontally for Tribe
- Layer headers and content remain legible on mobile and desktop
- The view switcher clearly indicates the active view
- Focus states and accessible labels are reasonable for buttons and accordion controls
- The visual hierarchy communicates relational depth without attention-panic styling
- `pnpm check` passes

Notes:
This is the first polish PR after all four Curator layers exist. Avoid broad redesign.

## Draft Tasks

### T-011: Reconsider exposing Galaxy View

Status: draft
Size: medium

Goal:
Decide later whether the old Galaxy view should be exposed in the switcher, redesigned, or kept as an internal experiment.

Acceptance criteria:

- Product owner confirms whether Galaxy belongs in the main prototype
- If exposed, the switcher supports Curator, Timeline, and Galaxy as separate views
- If not exposed, code remains tidy enough that it does not confuse the active Curator/Timeline prototype

Notes:
Do not start this until Curator View is working.
