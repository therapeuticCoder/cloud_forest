# Backlog

This backlog is the repo-local source of truth for agent-sized tasks. Tasks
should be small enough for one focused agent session.

## Completed

- T-001: Refresh project docs for Cloud Forest
- T-002: Rename the relationship layer from pod to party
- T-003: Decouple Galaxy and Timeline into switchable views
- T-004: Add Curator View shell and vertical scroll stack
- T-005: Add Curator mock data
- T-006: Build Party layer cards
- T-007: Build Tribe horizontal neighborhood pager
- T-008: Build Guilds accordion layer
- T-009: Build Signals accordion layer
- T-011: Build the shared Curator gallery foundation
- T-012: Refactor Party into gallery tiles
- T-013: Refactor Tribe into paged gallery tiles
- T-014: Replace Guild accordions with tiles
- T-015: Replace Signal accordions with tiles
- T-016: Establish the native Windows development environment
- T-017: Calibrate the Cloud Forest visual direction
- T-018: Create the application monorepo foundation
- T-018A: Define pnpm workspace and package boundaries
- T-018B: Move the working React prototype into `apps/web`
- T-018C: Establish shared domain and API-contract packages
- T-018D: Create the Fastify API foundation
- T-018E: Establish PostgreSQL and Drizzle with reviewed SQL migrations
- T-018F: Generate OpenAPI and a typed client at explicit boundaries
- T-018G: Add root database-migration and E2E project commands
- T-018J: Implement one thin client/API/PostgreSQL slice
- T-018K: Add vertical-slice E2E coverage and prototype regression gate
- T-018L: Establish the installable React PWA shell
- T-019: Establish safe environment cleanup and dependency recovery
- T-025: Establish repository line-ending and name hygiene
- T-026: Remove the dormant Galaxy prototype boundary
- T-027: Establish the Receive-care lifecycle contract and prototype state engine
- T-028A: Add Receive-care Timeline lifespan and seen presentation
- T-028B: Add Party passing and Tribe demotion
- T-028C: Add the care perspective harness and claim visibility
- T-029: Add care actions and history to person profile destinations
- T-030: Add two-party completion and not-completed dispositions
- T-031: Add the receiver gratitude flow and optional Tribe post
- T-032: Harden and document the accepted Receive-care lifecycle prototype

## Current Milestone

### T-033: Plan the prototype-to-durable product conversion program

Status: planned; begin after the care lifecycle prototype is accepted
Size: medium planning task

Concrete goal:
Audit all previously prototyped Cloud Forest functionality and produce a
sequenced, evidence-backed implementation program for turning selected mock,
React-memory, and device-only behavior into durable product slices. Treat
"durable" as explicit data ownership, domain types, tested database and API
interactions, authorization, recovery behavior, and appropriate client caching,
not as a blanket rewrite.

Likely files or boundaries:
Repository-wide read-only inspection of `apps/web`, `apps/api`, shared domain and
API-contract packages, `packages/database`, migrations, tests, existing
decisions and roadmap documents; backlog and decision updates only after human
review of the proposed sequence.

Acceptance criteria:

- inventory every user-visible prototype flow and identify its present source
  of truth: mock fixture, React memory, localStorage, API, or PostgreSQL
- classify each flow as intentionally local/private, cached server state, or
  authoritative shared state
- identify missing domain classes/types, API contracts, authorization rules,
  database interactions and migrations, concurrency guarantees, recovery
  behavior, and unit/integration/E2E coverage
- explicitly include Party membership, person profiles, care requests and
  offers, care lifecycle records, Timeline activity, and any other previously
  accepted prototype behavior found during inspection
- recommend small dependency-ordered implementation tasks with prerequisites,
  migration boundaries, acceptance criteria, checks, risks, and estimated size
- distinguish functionality that should remain a prototype or local-first from
  functionality that should become authoritative; do not equate durable with
  server-hosted by default
- present the proposed program for product-owner approval before adding its
  implementation tasks or changing application code

Out of scope:
Implementing the conversion, adding dependencies, changing schemas or APIs,
migrating data, adding authentication, or bundling multiple prototype flows into
one broad productionization change.

## Anticipated Future Milestones

### T-018H: Establish the worker and PostgreSQL-backed durable-job boundary

Status: deferred; activate only for a concrete product requirement
Size: medium

Concrete goal:
Create `apps/worker` and the smallest PostgreSQL-backed job lifecycle: enqueue,
claim safely, complete, fail with bounded retry metadata, and recover an
abandoned claim. Keep job payloads versioned and owned by shared boundaries.

Likely files or boundaries:
`apps/worker`, job contracts in a narrowly scoped shared package or domain
module, `packages/database` tables and reviewed SQL migration, root worker
scripts, and integration tests.

Dependency additions requiring separate human approval:
The exact PostgreSQL-backed job library, if one is used. Prefer evaluating the
approved PostgreSQL/Drizzle primitives before adding a queue framework. Any
scheduler or observability package requires separate approval.

Acceptance criteria:

- jobs persist in PostgreSQL and survive worker restart
- concurrent claims cannot execute the same job simultaneously
- failure, bounded retry, and abandoned-claim behavior are tested
- payload versions and idempotency expectations are explicit
- no Redis, microservice, hosted queue, or production scheduler is introduced

Checks:
Worker unit tests and PostgreSQL integration tests covering enqueue, concurrent
claim, completion, failure/retry, and restart recovery; `pnpm check`.

Prerequisites and ordering:
Requires T-018A and T-018E. It may wait until a chosen product operation needs
asynchronous execution; it is not automatically required by T-018J.

Out of scope:
Email delivery, federation, media processing, recurring product reminders,
production operations, dashboards, and unbounded retry policies.

### T-018I: Define the account-scoped IndexedDB/Dexie cache boundary

Status: deferred; activate only for a concrete product requirement
Size: medium

Concrete goal:
Create the smallest `apps/web` local-data adapter for the selected slice,
separating account-scoped cached server reads from private drafts or future
offline mutations and making cache invalidation/versioning explicit.

Likely files or boundaries:
`apps/web/src` local-data modules and tests, shared slice identifiers from
`packages/domain`, and browser storage test fixtures.

Dependency additions requiring separate human approval:
`dexie` and any Dexie-specific test helper. Do not add a second client state or
synchronization framework.

Acceptance criteria:

- cache records are partitioned by account and schema version
- server data remains authoritative and cache reads have an explicit freshness
  or invalidation rule
- clearing one account does not remove another account's records
- storage failures have a tested non-destructive fallback
- private drafts/offline mutations are separate stores or explicitly deferred

Checks:
IndexedDB adapter tests, account isolation and upgrade tests, offline/reload
browser check if integrated, and `pnpm check`.

Prerequisites and ordering:
Requires T-018B and T-018C. Per D-020, it can wait until a later product slice
requires cached or offline behavior.

Out of scope:
Full synchronization, conflict resolution, background sync, authentication,
service workers, offline mutation replay, and storing authoritative shared data
only on device.
