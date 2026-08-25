# Changelog

Notable changes to Cloud Forest are documented here.

The project loosely follows the spirit of semantic versioning, but early
versions remain informal while the prototype evolves.

## [Unreleased]

### Added

- Approved Cloud Forest design guide covering visual principles, semantic color
  tokens, typography, identity, layout, floating chrome, motion, accessibility,
  content boundaries, and anti-patterns.
- Representative responsive Timeline design with portrait-led identity,
  relationship-layer borders and marks, calm day separation, and detached
  desktop and mobile chrome.
- Scroll-direction chrome behavior that withdraws on downward scrolling and
  returns on upward scrolling or keyboard focus, with reduced-motion handling.
- Fictional portrait artwork for representative Timeline people.
- Native Windows development baseline with pinned Node and pnpm versions, local
  PostgreSQL/email/S3-compatible services, Codex actions, VS Code recommendations,
  and setup and recovery documentation.
- Eight-week working prototype roadmap and initial implementation backlog.
- Expanded product brief covering the intended user, community-building purpose,
  relationship limits, view responsibilities, product principles, data posture,
  and current milestone.
- Codex app-centered repository workflow and product-specific agent guidance.
- Node and pnpm version guidance, including native Windows PowerShell commands.

### Changed

- Reworked Timeline from a density-tiered prototype panel into a wide,
  chronological representative screen using the approved visual direction.
- Updated responsive navigation presentation while preserving the existing
  Timeline and Curator destinations.
- Renamed the package from the inherited starter name to `human-forest`.
- Clarified Cloud Forest's project summary and current Curator direction.
- Recorded canonical layer limits of 5 Party people, 100 Tribe people, 5 Guilds,
  and 10 Signals.
- Reconciled Curator prototype data with the canonical layer limits.

## 2026-07-05

### Added

- Curator view with vertically snapped Party, Tribe, Guilds, and Signals layers.
- Curator-specific typed mock data.
- Party person-card grid.
- Horizontally snapped Tribe neighborhood pager.
- Expandable Guild and Signal layers.

## 2026-06-21

### Added

- Separate, switchable Timeline and Curator views.
- Preserved Galaxy as a separate experimental view.
- Cloud Forest-specific project brief and repository decisions.

### Changed

- Renamed the innermost relationship layer from Pod to Party.
- Replaced inherited starter documentation with Cloud Forest product language.

## 2026-05-30

### Added

- Initial Cloud Forest visual prototype with relationship field, timeline,
  controls, typed domain model, and representative mock data.

## 2026-05-17

### Added

- Initial React repository and agent-ready task structure.
