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

Status: split; child tasks queued
Size: large; execute only through the child tasks below

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

Planning notes:

- Complete each child task in one focused Codex session and review it before
  starting the next task on the critical path.
- Every dependency listed below requires separate human approval in its owning
  child task. Package names are planning candidates derived from the approved
  architecture, not authorization to install them.
- Keep the current root Vite application runnable until T-018B moves it. After
  that move, `apps/web` must preserve the same prototype behavior and visuals.
- The server remains authoritative for shared application data. IndexedDB is an
  account-scoped cache and private/offline client boundary, not a competing
  server datastore.
- Reviewed SQL files are the migration artifacts. Generated migration metadata
  may accompany them, but schema changes must remain inspectable as SQL.

#### Critical path and deferrable work

Critical path:
T-018A -> T-018B -> human slice decision -> T-018C -> T-018D -> T-018E ->
T-018F -> T-018G -> T-018J -> T-018K. T-018I joins the path before T-018J if
the chosen slice reads through the local cache. T-018H joins before T-018J only
if the chosen slice requires a durable job.

Can safely wait:
T-018H can wait until a product flow needs asynchronous work. T-018I can wait
until a specific offline/cache behavior is part of the selected slice. T-018G
can wait until T-018E establishes real migration commands, but must finish
before the final E2E gate. None of these deferrals changes the approved
architecture.

#### Open human decision before T-018J

Choose the first product-shaped vertical slice before implementation:

- a read-only Timeline item loaded from PostgreSQL through the API and typed
  client, while all remaining Timeline data stays mocked; or
- a read-only Curator relationship loaded through the same path, while all
  remaining Curator data stays mocked.

The choice changes the first domain model, migration, endpoint, cache key, and
browser acceptance path. Do not choose implicitly. Whether the first slice must
also exercise IndexedDB or a durable job is a separate scope decision; default
to neither unless the product owner explicitly includes it.

### T-018A: Define pnpm workspace and package boundaries

Status: queued
Size: small

Concrete goal:
Create the minimal workspace layout and root command conventions without moving
the working prototype yet. Reserve `apps/web`, `apps/api`, `apps/worker`,
`packages/domain`, `packages/api-contracts`, `packages/api-client`, and
`packages/database`; document dependency direction so application packages may
consume shared packages but shared packages do not import applications.

Likely files or boundaries:
`pnpm-workspace.yaml`, root `package.json`, shared TypeScript and lint
configuration files, empty package manifests only where required, `README.md`,
and `.codex/environments/environment.toml` if root commands change.

Dependency additions requiring separate human approval:
None expected. Ask before adding workspace orchestration, task-runner, or
configuration packages.

Acceptance criteria:

- workspace globs include only the approved application and package boundaries
- existing root `pnpm dev` and `pnpm check` behavior remains available
- dependency direction and package naming are documented
- no application source is moved and no runtime framework is introduced

Checks:
`pnpm install --lockfile-only --offline` if no lockfile change is expected,
`pnpm format:check`, `pnpm check`, and inspection of `pnpm --recursive list`.

Prerequisites and ordering:
First child task. T-018B and all package-producing tasks depend on it.

Out of scope:
Moving the React app, API or worker implementation, database schema, caching,
deployment, authentication, and adding a monorepo task runner.

### T-018B: Move the working React prototype into `apps/web`

Status: queued
Size: medium

Concrete goal:
Relocate the existing Vite/React application into `apps/web` with a reversible,
mechanical migration that preserves its current behavior, tests, assets,
responsive layout, and approved visual grammar. Establish the PWA application
boundary without adding installability behavior yet.

Likely files or boundaries:
Current root `src`, `public`, `index.html`, Vite/TypeScript/Tailwind/shadcn
configuration, `apps/web`, root scripts, and path references in documentation.

Dependency additions requiring separate human approval:
None expected. A PWA plugin, service-worker library, or new build tool requires
separate approval and is explicitly deferred.

Acceptance criteria:

- `apps/web` contains the existing application with history preserved by a
  reviewable move
- Curator, Timeline, and Galaxy remain switchable and mock-backed
- root development and check commands still operate on the web app
- no visible or behavioral change is introduced

Checks:
`pnpm check`; browser checks at the approved desktop and mobile viewport sizes
for all three views; keyboard focus, reduced motion, overflow, browser history,
and console-error checks; direct screenshot comparison with the pre-move app.

Prerequisites and ordering:
Requires T-018A. Must finish before feature code is added to the web boundary.

Out of scope:
PWA manifest/service worker, API calls, replacing mock data, visual redesign,
routing, authentication, persistence, and new dependencies.

### T-018C: Establish shared domain and API-contract packages

Status: queued
Size: small

Concrete goal:
Create framework-neutral `packages/domain` and `packages/api-contracts`
boundaries for the single selected vertical-slice concept, with explicit
versioned request/response shapes and runtime validation kept out of UI and
database implementation details.

Likely files or boundaries:
`packages/domain`, `packages/api-contracts`, their package manifests and tests,
shared TypeScript configuration, and minimal imports from `apps/web` only if
needed to prove the boundary.

Dependency additions requiring separate human approval:
The runtime schema-validation library selected for API contracts. Do not add or
replace a validator until the product owner approves the exact package.

Acceptance criteria:

- domain types contain no React, Fastify, Drizzle, or transport imports
- contracts describe only the selected slice and include success and error
  responses under a versioned API boundary
- request and response examples validate at runtime
- invalid examples fail focused tests

Checks:
Package typecheck/tests plus `pnpm check`.

Prerequisites and ordering:
Requires T-018A and the T-018J slice decision. Precedes API, database mapping,
OpenAPI, and typed-client implementation for that slice.

Out of scope:
Exhaustive product models, database schemas, endpoint handlers, generated
clients, authentication, authorization policy, and UI integration.

### T-018D: Create the Fastify API foundation

Status: queued
Size: small

Concrete goal:
Create `apps/api` as a versioned Fastify service with configuration validation,
structured startup/shutdown, a health endpoint, and request/response validation
using the approved contract boundary.

Likely files or boundaries:
`apps/api`, root and API package scripts, environment examples, API tests, and
development documentation.

Dependency additions requiring separate human approval:
`fastify`, its approved schema/type-provider integration, and any environment
validation or test-only HTTP injection packages not already available.

Acceptance criteria:

- the API starts locally through a documented root command
- `/api/v1/health` returns a validated response without database access
- invalid configuration fails clearly before listening
- the server can be constructed without opening a port for tests
- no product endpoint or production integration is added

Checks:
API unit/injection tests, startup smoke test, clean shutdown test, and
`pnpm check`.

Prerequisites and ordering:
Requires T-018A and T-018C. Precedes T-018F and T-018J.

Out of scope:
Authentication, product CRUD, database access, deployment, rate limiting,
production logging services, and background work.

### T-018E: Establish PostgreSQL and Drizzle with reviewed SQL migrations

Status: queued
Size: medium

Concrete goal:
Create `packages/database`, connect only to the existing local PostgreSQL
service, and prove a reviewed SQL migration lifecycle for the selected slice's
minimal table and constraints.

Likely files or boundaries:
`packages/database`, Drizzle configuration and schema, committed SQL migration
files and metadata, root database scripts, `.env.example`, and database tests.

Dependency additions requiring separate human approval:
`drizzle-orm`, `drizzle-kit`, the selected PostgreSQL driver, and any isolated
database-test helper. No managed database SDK is implied.

Acceptance criteria:

- the minimal schema maps to the selected domain concept and no speculative
  tables are added
- every schema change is represented by human-readable, reviewed SQL
- migrations apply from empty, report current status, and roll forward
  repeatably against local PostgreSQL
- database connections are configured outside domain and API-contract packages
- test data is fictional and contains no sensitive information

Checks:
Database package typecheck/tests; migration apply/status from a clean local test
database; schema inspection; `pnpm check`. Any destructive database reset must
be an explicit, separately confirmed test action.

Prerequisites and ordering:
Requires T-018A, T-018C, the T-018J slice decision, and a running local
PostgreSQL service. Precedes T-018J.

Out of scope:
Production hosting, backups beyond existing development guidance, seed systems
beyond the selected slice fixture, authentication tables, broad social schema,
and automatic destructive migration rollback.

### T-018F: Generate OpenAPI and a typed client at explicit boundaries

Status: queued
Size: medium

Concrete goal:
Generate an OpenAPI document from the validated versioned API and generate or
derive `packages/api-client` from that document so `apps/web` never imports API
server implementation or database code.

Likely files or boundaries:
`apps/api` schema registration, generated OpenAPI artifact, generation scripts,
`packages/api-client`, package exports, and contract/client tests.

Dependency additions requiring separate human approval:
Fastify OpenAPI integration and the exact typed-client generator or derivation
library. Generator choice remains open until its output, maintenance cost, and
runtime footprint are reviewed.

Acceptance criteria:

- OpenAPI is reproducibly generated from registered runtime schemas
- generated artifacts are deterministic and drift is detected by a check
- the client exposes only versioned transport operations and typed errors
- `apps/web` can depend on the client without importing Fastify or database code
- no hand-maintained duplicate transport types are introduced

Checks:
OpenAPI generation and clean-diff/drift check, client typecheck/tests, API
contract tests, and `pnpm check`.

Prerequisites and ordering:
Requires T-018C and T-018D. The product operation can be added alongside or
immediately before T-018J after T-018E exists.

Out of scope:
Publishing packages, supporting external consumers, API documentation hosting,
authentication, retries, offline queues, and broad endpoint generation.

### T-018G: Add root database-migration and E2E project commands

Status: queued
Size: small

Concrete goal:
Expose PowerShell-safe, Codex-friendly root commands for migration generation,
review/apply/status, and end-to-end execution using the boundaries established
by earlier tasks.

Likely files or boundaries:
Root `package.json`, `scripts`, `.codex/environments/environment.toml`, `README.md`,
and `docs/development.md`.

Dependency additions requiring separate human approval:
None expected beyond the migration and E2E tools approved in their owning
tasks. Ask before adding a command runner or environment loader.

Acceptance criteria:

- command names and prerequisites are documented and work in native Windows
  PowerShell
- migration generation never silently applies SQL
- migration apply/status target the configured local database explicitly
- an E2E command shell starts or clearly documents required services and is
  ready for T-018K to supply the first test
- Codex actions call the same root commands humans use

Checks:
Run each non-destructive command, apply reviewed migrations to a disposable
local test database, smoke-test the E2E command shell without a product test,
and run `pnpm format:check` plus `pnpm check`.

Prerequisites and ordering:
Requires T-018E for migration commands. T-018K supplies the first product E2E
test and verifies the completed command. Must finish before T-018K.

Out of scope:
CI/CD, production migration execution, automatic database deletion, deployment,
and replacing existing service commands.

### T-018H: Establish the worker and PostgreSQL-backed durable-job boundary

Status: queued
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

Status: queued
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
Requires T-018B, T-018C, and the T-018J slice decision. May wait unless the
product owner includes cached/offline behavior in the first slice.

Out of scope:
Full synchronization, conflict resolution, background sync, authentication,
service workers, offline mutation replay, and storing authoritative shared data
only on device.

### T-018J: Implement one thin client/API/PostgreSQL slice

Status: blocked on human slice selection
Size: medium

Concrete goal:
Replace exactly one mock-backed read path with a database-backed read through
the versioned Fastify endpoint and typed client while leaving all other
prototype data and interactions unchanged.

Likely files or boundaries:
The selected model in `packages/domain`, its contract in
`packages/api-contracts`, one table/repository in `packages/database`, one
`apps/api` route, one `packages/api-client` operation, and the smallest adapter
and rendering seam in `apps/web`.

Dependency additions requiring separate human approval:
None beyond dependencies separately approved in T-018C through T-018F. If the
slice includes caching or jobs, T-018I or T-018H owns those approvals.

Acceptance criteria:

- the product owner has selected the Timeline-item or Curator-relationship path
- one fictional record is created by reviewed SQL migration/fixture and read
  from PostgreSQL through the API and typed client
- loading, empty, success, and recoverable error behavior are explicit and
  accessible
- the selected screen preserves its approved visual treatment
- all non-selected content remains mock-backed with a clear temporary seam
- no write path, authentication, or speculative domain expansion is added

Checks:
Focused domain, contract, repository, route, and client tests; API/database
integration test; browser verification of loading, success, empty, and API-down
states at mobile and desktop sizes; keyboard, overflow, console, and screenshot
comparison checks; `pnpm check`.

Prerequisites and ordering:
Requires human slice selection and T-018B through T-018F. Requires T-018I only
if cache behavior is selected and T-018H only if a durable job is selected.
Precedes T-018K.

Out of scope:
Writes, authentication, authorization, broad mock replacement, synchronization,
optimistic UI, notifications, production data, deployment, and visual redesign.

### T-018K: Add vertical-slice E2E coverage and prototype regression gate

Status: queued
Size: medium

Concrete goal:
Add one deterministic E2E path for the selected database-backed slice and make
preservation of the existing prototype an explicit migration gate.

Likely files or boundaries:
E2E configuration and tests, fictional test fixtures, root E2E scripts,
`apps/web` and `apps/api` test configuration, documentation, and Codex actions.

Dependency additions requiring separate human approval:
The selected browser E2E runner and any service-start helper. Reuse an already
approved/installed tool if available; do not add visual-regression hosting or a
cloud test service.

Acceptance criteria:

- one command prepares a disposable test database, applies reviewed migrations,
  starts required local processes, and exercises the selected browser path
- test setup is isolated from the developer's normal local data
- the test proves the browser received database-backed data through the API
- Curator, Timeline, and Galaxy smoke checks preserve current navigation and
  representative behavior
- approved mobile and desktop visual comparisons show no unintended regression
- failures leave actionable logs and processes shut down cleanly

Checks:
Run the E2E command from a clean process state; repeat it to prove isolation;
run desktop and mobile browser smoke/visual checks; inspect browser console;
run `pnpm check` and `pnpm format:check`.

Prerequisites and ordering:
Requires T-018J and the relevant command portion of T-018G. Final critical-path
task for the monorepo foundation milestone.

Out of scope:
Complete product E2E coverage, hosted browsers, production smoke tests,
cross-browser matrix expansion, broad screenshot baselines, load testing, and
CI/CD deployment gates.
