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
- T-033: Plan the prototype-to-durable product conversion program

## Current Milestone

### Tranche 1 — Durable identity, Party, and profiles

Status: approved for dependency-ordered delivery. Complete one task, branch,
pull request, review, and merge before starting the next task.

This tranche makes invited identity, Party membership, and person profiles
authoritative while preserving the accepted interface. Care remains the
device-local prototype until a later tranche. Portrait upload remains deferred.

#### T-034: Canonicalize identity and relationship domain concepts

Status: ready
Size: medium

Add framework-neutral account and person identifiers, profiles, relationship
layers, ordered Party membership, ownership, and capacity rules to
`packages/domain`. For the initial pilot, one invited account maps to one
person. Adapt existing web-only shapes at boundaries rather than rewriting the
interface. Unit-test the five-member Party invariant and ownership rules.

Checks: focused domain tests, typecheck, `pnpm check`.

Out of scope: authentication, persistence, API changes, UI changes, generalized
social-graph abstractions, and care conversion.

#### T-035: Approve the authorization and privacy matrix

Status: planned
Size: small planning task
Prerequisite: T-034

Record field-level allow and deny rules for self profiles, Party membership,
other profiles, care states, private history, and Tribe activity. Include
removed and blocked relationships. Map every proposed API operation to a rule
and state explicitly that client-side filtering is not authorization.

Checks: product-principle, privacy, and threat-case documentation review.

#### T-036: Prototype invited-session UX for annotated review

Status: planned collaborative UX checkpoint
Size: small
Prerequisite: T-035

Rapidly prototype the invitation, sign-in, expired or reused invitation,
session-expiry, current-person, and logout experience at desktop and mobile
sizes. Present screenshots or a live prototype for product-owner annotation
before the authentication implementation is selected. Keep the work fictional
and reversible.

Checks: keyboard and focus behavior, reduced motion, overflow, console health,
and direct product-owner review of annotated desktop and mobile states.

Expected stewardship: if the prototype is committed as code, give its styles
and interaction tests a session-specific owner instead of extending
`index.css` and `App.test.tsx` with another full workflow.

Out of scope: authentication dependencies, email delivery, accounts, sessions,
or production behavior.

#### T-037: Establish invited account sessions

Status: planned; dependency approval required before implementation
Size: medium
Prerequisites: T-034 through T-036

Evaluate and, after separate approval, use the roadmap's Better Auth direction
for invite-only sessions. Begin with deterministic local and test invitations;
do not introduce production email delivery. Add trusted current-person
resolution, logout, invitation reuse protection, expiry and revocation, and
typed unauthorized responses. Seed only fictional database-backed account and
person test data.

Checks: contract, API, database integration, session-expiry, and E2E tests;
`pnpm check`.

#### T-038: Persist people and Party membership

Status: planned
Size: medium
Prerequisite: T-037

Add reviewed forward migrations and repositories for profiles and ordered,
owned Party membership. Enforce duplicate, self-membership, ownership, and
sixth-slot failures atomically. Establish deterministic fictional
database-backed person and Party fixtures for integration and browser tests.

Checks: migration drift, repository integration, concurrent-add, rollback, and
database-backed fixture tests against guarded `TEST_DATABASE_URL`; `pnpm check`.

Out of scope: importing browser care records or real user data.

#### T-039: Add versioned Party and profile APIs

Status: planned
Size: medium
Prerequisite: T-038

Add Party-specific TypeBox contracts, generated OpenAPI and client types, and
authorized profile and Party reads, adds, edits, removals, and reordering.
Return explicit duplicate, full, forbidden, not-found, validation, and
stale-write conflict results.

Checks: contract examples, generated-artifact check, API and repository
integration tests, authorization denials, `pnpm check`.

#### T-040: Prototype durable Party and profile states for annotated review

Status: planned collaborative UX checkpoint
Size: small
Prerequisite: T-039

Rapidly prototype loading, empty, add, edit, remove, reorder, full-capacity,
conflict, unavailable, and retry states using the real contract vocabulary.
Review desktop and mobile states with the product owner before connecting the
accepted direction to live APIs.

Checks: keyboard and focus behavior, reduced motion, overflow, console health,
and direct product-owner review of annotated desktop and mobile states.

Expected stewardship: keep the Party-state prototype's cohesive styles and
workflow tests outside `index.css` and `App.test.tsx` so the later API
conversion can reuse those boundaries.

#### T-041: Convert the Party gallery and profiles

Status: planned
Size: medium
Prerequisites: T-039 and accepted T-040 direction

Replace Party and profile fixtures and session-only add-member state with typed
API reads and writes. Preserve the approved responsive layout, focus recovery,
five-slot presentation, and object-URL cleanup. Keep Tribe neighborhoods,
Guilds, Signals, and care behavior at their explicitly documented prototype
boundaries.

Acceptance: additions and ordering survive reload; conflicts and unavailable
states are calm and recoverable; the interface never optimistically exceeds
five Party members; current browser visuals remain accepted.

Checks: focused component tests, authenticated desktop and mobile E2E, offline
and API-failure states, `pnpm check`.

Expected stewardship: extract the Party/profile data orchestration naturally
introduced by this task from `DashboardShell.tsx`; keep Party/profile styles in
the T-040-owned boundary; and add durable Party integration scenarios to a
purpose-specific test file rather than `App.test.tsx`.

### Alternating delivery rhythm after tranche 1

Pause for product-owner review after T-041. Later tranches remain inactive until
they are explicitly loaded, but their delivery should preserve these UX gates:

- before durable care records, review how Party and Tribe audiences, passing,
  demotion, removal, and blocking are communicated;
- before transactional care lifecycle work, prototype claim races, stale data,
  revoked access, network failure, and safe retry behavior;
- before cache and mock retirement, review completed care, private history,
  gratitude, Timeline activity, and privacy explanations with real identities;
- during recovery work, review loading, cached, stale, offline, reconnecting,
  and failed-operation states rather than treating recovery as invisible
  infrastructure.

Each UX checkpoint should use rapid desktop and mobile prototypes, numbered or
otherwise unambiguous product-owner annotations, and one narrow implementation
pass after a direction is selected.

### Incremental code stewardship

Feature tasks should leave a touched pressure point clearer when a natural,
reviewable extraction exists. This is a scope constraint, not permission for a
broad cleanup or a line-count-driven rewrite.

- When touching `DashboardShell.tsx`, move one cohesive orchestration concern
  into a typed hook, adapter, or purpose-named module when that improves the
  active task.
- When touching `TimelinePanel.tsx`, keep remote loading, feed composition, and
  presentation responsibilities from becoming more entangled.
- When adding substantial styles to `index.css`, move the touched feature's
  cohesive styles toward an owned stylesheet or equally clear boundary.
- When extending `App.test.tsx`, prefer a workflow-specific test file and
  shared test helper over adding another large scenario to the root suite.

Every task plan should name any intended extraction and its direct relationship
to the feature. Preserve behavior and reviewed visuals, and skip the extraction
when it would make the task materially broader or riskier.

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
