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
- T-016: Establish the native Windows development environment
- T-017: Calibrate the Cloud Forest visual direction
- T-025: Establish repository line-ending and name hygiene

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
Make a clean Cloud Forest checkout reproducible for the product owner and Codex
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

### T-017: Calibrate the Cloud Forest visual direction

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

### T-019: Establish safe environment cleanup and dependency recovery

Status: done
Size: small

Goal:
Provide PowerShell-safe, Codex-friendly commands for removing explicitly
disposable generated artifacts and rebuilding a damaged pnpm dependency layout
from the committed lockfile without making purging part of healthy setup.

Acceptance criteria:

- generated cleanup has a dry run and removes only `dist`, `dist-ssr`,
  `coverage`, `.vite`, and TypeScript build-info artifacts outside protected
  state directories
- dependency repair previews its targets, requires explicit confirmation before
  removing workspace `node_modules`, and installs with `--frozen-lockfile`
- neither command removes the pnpm store, Docker volumes, backups, `.env` files,
  source files, or user data
- environment, permission, sandbox, install, and build errors must be
  investigated and may be deferred only with an explicit documented reason
- isolated fixture tests cover target listing, protected state, safe removal,
  and repeated execution
- `pnpm format:check` and `pnpm check` pass

### T-025: Establish repository line-ending and name hygiene

Status: done
Size: small

Goal:
Make LF line endings deterministic across native Windows, Linux, generators,
Codex worktrees, and CI while removing obsolete internal Human Forest names.

Acceptance criteria:

- repository attributes keep tracked text files LF and preserve binary assets
- Prettier enforces the same LF policy
- committed OpenAPI and typed-client artifacts pass byte-for-byte drift checks
  on native Windows
- fictional Garage defaults and internal web identifiers use Cloud Forest names
- the service worker removes shell caches that use the obsolete Human Forest
  prefix without touching unrelated origin caches
- existing Docker containers, volumes, databases, caches, and user data remain
  unchanged
- `pnpm format:check` and `pnpm check` pass

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
T-018A -> T-018B -> T-018L -> T-018C -> T-018D -> T-018E -> T-018F -> T-018G
-> T-018J -> T-018K. T-018I joins the path before T-018J if a later approved
revision adds local caching to the slice. T-018H joins before T-018J only if a
later approved revision adds a durable job.

Can safely wait:
T-018H can wait until a product flow needs asynchronous work. T-018I can wait
until a specific offline/cache behavior is part of the selected slice. T-018G
can wait until T-018E establishes real migration commands, but must finish
before the final E2E gate. T-018L can wait until the web move is verified, but
must finish before T-018K and before the parent milestone is complete. None of
these deferrals changes the approved architecture.

#### Resolved vertical-slice decision

Per D-020, the first product-shaped vertical slice is a read-only Timeline item
loaded from PostgreSQL through the API and typed client while all remaining
Timeline data stays mocked. IndexedDB and durable jobs remain separate tasks and
are not prerequisites for this slice.

### T-018A: Define pnpm workspace and package boundaries

Status: done
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

Status: done
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
- Timeline and Curator remain switchable and mock-backed; Galaxy remains
  preserved as the existing dormant experiment
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

Status: done
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
Requires T-018A. The slice is fixed by D-020. Precedes API, database mapping,
OpenAPI, and typed-client implementation for that slice.

Out of scope:
Exhaustive product models, database schemas, endpoint handlers, generated
clients, authentication, authorization policy, and UI integration.

### T-018D: Create the Fastify API foundation

Status: done
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

Status: done
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
Requires T-018A, T-018C, and a running local PostgreSQL service. The initial
schema is limited by D-020. Precedes T-018J.

Out of scope:
Production hosting, backups beyond existing development guidance, seed systems
beyond the selected slice fixture, authentication tables, broad social schema,
and automatic destructive migration rollback.

### T-018F: Generate OpenAPI and a typed client at explicit boundaries

Status: done
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

Status: done
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
Requires T-018B and T-018C. Per D-020, it can wait until a later product slice
requires cached or offline behavior.

Out of scope:
Full synchronization, conflict resolution, background sync, authentication,
service workers, offline mutation replay, and storing authoritative shared data
only on device.

### T-018J: Implement one thin client/API/PostgreSQL slice

Status: done
Size: medium

Concrete goal:
Replace exactly one mock-backed Timeline-item read path with a database-backed
read through the versioned Fastify endpoint and typed client while leaving all
other prototype data and interactions unchanged.

Likely files or boundaries:
The Timeline-item model in `packages/domain`, its contract in
`packages/api-contracts`, one table/repository in `packages/database`, one
`apps/api` route, one `packages/api-client` operation, and the smallest Timeline
adapter and rendering seam in `apps/web`.

Dependency additions requiring separate human approval:
None beyond dependencies separately approved in T-018C through T-018F. If the
slice includes caching or jobs, T-018I or T-018H owns those approvals.

Acceptance criteria:

- D-020 is preserved: the slice reads one Timeline item and does not require
  IndexedDB or a durable job
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

Completed state:

- the existing fictional Mira soup-offer item is installed by a reviewed
  forward-only migration and read through a narrow database repository
- production API startup injects the PostgreSQL resolver and closes its pool on
  shutdown, while route tests retain an isolated injected-resolver boundary
- the generated typed client loads exactly that first Timeline card through the
  same-origin `/api` path; the other seven visible cards remain mock-backed
- loading, typed-empty, recoverable-error with retry, and success states are
  accessible and preserve the approved desktop and mobile Timeline treatment
- guarded repository and API integration tests pass against the separate
  `cloud_forest_t018j_test` database with two migrations applied and none pending

### T-018K: Add vertical-slice E2E coverage and prototype regression gate

Status: done
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
- Curator and Timeline smoke checks preserve current navigation and
  representative behavior
- approved mobile and desktop visual comparisons show no unintended regression
- failures leave actionable logs and processes shut down cleanly

Checks:
Run the E2E command from a clean process state; repeat it to prove isolation;
run desktop and mobile browser smoke/visual checks; inspect browser console;
run `pnpm check` and `pnpm format:check`.

Prerequisites and ordering:
Requires T-018J, T-018L, and the relevant command portion of T-018G. Final
critical-path task for the monorepo foundation milestone.

Out of scope:
Complete product E2E coverage, hosted browsers, production smoke tests,
cross-browser matrix expansion, broad screenshot baselines, load testing, and
CI/CD deployment gates.

Completed state:

- `pnpm.cmd test:e2e` fails closed through the existing guarded test-database
  commands, applies only reviewed forward migrations, and starts the API with
  `DATABASE_URL` scoped to `TEST_DATABASE_URL`
- pinned Playwright Chromium runs one deterministic Timeline and Curator path at
  1440 by 900 and 390 by 844 through Vite's same-origin `/api` proxy
- the browser asserts the exact migrated Mira response and rendered card,
  representative mock content, keyboard focus recovery, Curator detail return,
  page overflow, development service-worker cleanup, and console health
- two committed Timeline baselines protect the approved desktop and mobile
  visual treatment; failure-only screenshots and traces remain ignored
- API, Vite, and browser output is actionable, startup and total runtime are
  bounded, and the root runner handles interruption and owns complete
  process-tree cleanup on success, failure, timeout, and repeated execution

### T-026: Remove the dormant Galaxy prototype boundary

Status: done
Size: small

Concrete goal:
Remove the dormant Galaxy view and its remaining app and documentation
references so the prototype reflects the product's current functional
priorities without preserving an unused visual experiment.

Likely files or boundaries:
The Galaxy and relationship-field components in `apps/web`, Galaxy-only mock
data and styles, focused web tests, and repository documentation that still
describes Galaxy as a preserved view.

Dependency additions requiring separate human approval:
None expected.

Acceptance criteria:

- Galaxy view, relationship-field presentation, and Galaxy-only controls are
  removed from the web application
- mock data, styles, assets, and exports used only by Galaxy are removed after
  their ownership is verified
- Timeline and Curator behavior, responsive treatment, and navigation remain
  unchanged
- current documentation no longer presents Galaxy as an available or preserved
  product view
- the change does not replace Galaxy with a new view or expand product scope

Checks:
Focused web tests; repository search for remaining Galaxy references; desktop
and mobile Timeline and Curator smoke checks; `pnpm check`.

Prerequisites and ordering:
Run immediately after T-018K so the E2E gate is established without adding
temporary Galaxy coverage that would be deleted in the next task.

Out of scope:
New views, product redesign, new navigation, broader mock-data replacement, and
unrelated visual cleanup.

Completed state:

- the unreachable Galaxy view and its relationship-field controls, nodes, guild
  planes, map connections, layout data, and exclusive styles are removed
- Timeline and Curator remain the only application views, with their existing
  navigation, responsive behavior, keyboard interactions, and E2E path intact
- current product documentation describes Timeline and Curator, while D-009 and
  earlier backlog and changelog statements remain as honest historical records
- no replacement view, dependency, API, database, generated artifact, or visual
  baseline change is introduced

### T-018L: Establish the installable React PWA shell

Status: done
Size: small

Concrete goal:
Make `apps/web` an installable current-evergreen PWA with a valid web app
manifest, an application-shell service worker, explicit update behavior, and
Cloud Forest-owned install icons while preserving the existing prototype.

Likely files or boundaries:
`apps/web` Vite configuration and entry point, `apps/web/public` manifest and
icon assets, focused PWA tests, root web build scripts, and development
documentation.

Dependency additions requiring separate human approval:
The exact Vite PWA/service-worker integration and any Workbox packages it uses.
Review the generated output, maintenance model, and runtime behavior before
approving a package; do not silently add a PWA plugin.

Acceptance criteria:

- the production web build emits a valid manifest with approved Cloud Forest
  name, colors, display mode, start URL, and original local icons
- the installed app launches the existing prototype through the `apps/web`
  boundary without changing Curator, Timeline, or Galaxy behavior
- the service worker caches only the static application shell; API responses,
  account data, and user content are excluded
- first load, offline shell reload, update discovery, and activation behavior
  are explicit and recover without trapping users on a stale build
- development mode does not leave a production service worker registered
- installability does not depend on production hosting or a third-party service

Checks:
`pnpm check`; production web build and manifest inspection; browser
installability audit on a secure local origin; online first-load, offline shell
reload, and new-build update checks; mobile and desktop smoke checks for all
three views; keyboard, reduced-motion, overflow, and console-error checks.

Prerequisites and ordering:
Requires T-018B. May run independently of the API and database tasks after the
web move, but must finish before T-018K and before T-018 is complete.

Out of scope:
Offline API-response caching, IndexedDB data synchronization, offline mutation
replay, background sync, push notifications, authentication, analytics,
production hosting, and changes to the approved visual direction.
