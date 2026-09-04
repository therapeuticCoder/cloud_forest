# Proposed durable product conversion program

Status: first delivery tranche approved by the product owner on 2026-09-04.
DCP-01 through DCP-06 are active in `BACKLOG.md` as T-034 through T-041, with
collaborative UX checkpoints before authentication implementation and Party UI
conversion. Later tranches remain proposed until explicitly loaded.

## Purpose and recommendation

Cloud Forest should convert accepted prototype behavior through narrow vertical
slices, not a blanket rewrite. “Durable” means that each selected behavior has
an explicit owner, framework-neutral domain rules, authenticated and authorized
API operations, reviewed forward-only storage changes, concurrency guarantees,
recovery behavior, appropriate client caching, and tests at the boundaries that
can fail.

The recommended first tranche is DCP-01 through DCP-06: establish identity and
authorization, then make Party membership and person profiles authoritative.
Pause for product review after that working slice. The second tranche converts
care requests and offers; the third converts lifecycle decisions and Timeline
activity. This ordering gives care a real relationship and authorization model
instead of preserving the fictional perspective harness as architecture.

The approved cadence alternates durable construction with rapid, annotated UX
review. Growing files are improved incrementally only when the active task
naturally exposes a cohesive extraction; this is not a blanket refactor. See
`BACKLOG.md` for the active task boundaries and later-tranche UX gates.

## Current user-visible inventory

“Target class” describes the appropriate durable ownership, not the current
implementation.

| User-visible flow                                         | Current source of truth                                                          | Current lifetime                            | Target class                                                                                     | Evidence and boundary                                                                                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Switch between Timeline and Curator                       | React state                                                                      | Page session                                | Intentionally local UI state                                                                     | `DashboardShell.tsx` owns `activeView`; no routing or account preference exists                                                                 |
| Hide and recover Timeline chrome while scrolling          | React state and DOM scroll                                                       | Page session                                | Intentionally local UI state                                                                     | Presentation behavior only; keyboard recovery is browser-tested                                                                                 |
| Timeline Give/Receive filters                             | `TimelinePanel` React state                                                      | Mounted page session                        | Intentionally local UI state                                                                     | No saved preference is required by accepted behavior                                                                                            |
| Timeline ordinary activity                                | Seven TypeScript fixtures plus one PostgreSQL row fetched by ID                  | Fixtures survive builds; one row is durable | Authoritative shared feed                                                                        | Only Mira's item crosses domain, database, API, OpenAPI, typed-client, and browser boundaries; there is no feed query or audience authorization |
| Curator Party gallery and self tile                       | TypeScript fixtures, except one session-added member                             | Bundle lifetime or page session             | Authoritative private relationship state                                                         | Cardinality is enforced only in the UI; there is no account, ownership, API, or database record                                                 |
| Add a Party member, including optional portrait           | Wizard React state, then `DashboardShell` React state; portrait is an object URL | Page session                                | Authoritative private relationship state; media separately owned                                 | Refresh loses the member; no duplicate/concurrency rule or upload/storage boundary exists                                                       |
| Party person profile destination                          | TypeScript fixture plus derived care selectors                                   | Bundle/device lifetime                      | Authoritative profile plus authorized private care projection                                    | Profile types are web-only and duplicate actor concepts                                                                                         |
| Tribe neighborhoods and people                            | TypeScript fixtures                                                              | Bundle lifetime                             | Eventually authoritative relationship state; neighborhood grouping may remain local presentation | No membership operations, ownership, limits, or API boundary exist                                                                              |
| Guild gallery and detail                                  | TypeScript fixtures                                                              | Bundle lifetime                             | Deferred shared group state                                                                      | No accepted join, leadership, posting, or moderation workflow exists yet                                                                        |
| Signal gallery and detail                                 | TypeScript fixtures                                                              | Bundle lifetime                             | Deferred cached external/public state                                                            | No ingestion, refresh, provenance, or failure policy exists yet                                                                                 |
| Timeline Write action                                     | Visible inert control                                                            | None                                        | Deferred                                                                                         | It has no click behavior and is not accepted posting functionality                                                                              |
| Compose and withdraw a Give meal offer                    | Wizard draft and `DashboardShell` React array                                    | Page session                                | Authoritative shared care state                                                                  | The web-only type lacks an owner identity and durable audience snapshot                                                                         |
| Compose and withdraw a Receive meal request               | Wizard draft and lifecycle React state                                           | Page session                                | Authoritative shared care state                                                                  | Request bodies are deliberately excluded from v2 browser storage                                                                                |
| Seen/minimized request presentation                       | Lifecycle records in `localStorage` v2                                           | Browser profile                             | Private user state, server-authoritative with optional local cache                               | Viewer identity comes from the review harness, not a session                                                                                    |
| Pass and Party-to-Tribe demotion                          | Lifecycle records in `localStorage` plus a fixture audience snapshot             | Browser profile                             | Authoritative shared transition with private per-viewer pass state                               | No transaction verifies membership or quorum against trusted data                                                                               |
| Claim a request                                           | Lifecycle record in `localStorage`                                               | Browser profile                             | Authoritative shared transition                                                                  | First-claim behavior is deterministic in one tab only; no cross-client race protection exists                                                   |
| My Care and care on person profiles                       | Selectors over fixture requests and browser lifecycle records                    | Browser profile                             | Authorized server projection, optionally cached                                                  | UI privacy is demonstrative only and can be bypassed by the perspective switcher                                                                |
| Completed and Not completed outcomes                      | Lifecycle records in `localStorage`                                              | Browser profile                             | Authoritative participant-only transition                                                        | No idempotency, ordering, audit actor, or concurrent-decision guarantee exists                                                                  |
| Close or retry after Not completed                        | Browser lifecycle record; retry request exists only in React state               | Browser record plus current page request    | Authoritative shared transition                                                                  | The predecessor/successor link is not protected by a database transaction                                                                       |
| Private lifecycle history                                 | Derived records in `localStorage`                                                | Browser profile                             | Authoritative participant-private history                                                        | Records are neither account-scoped nor encrypted, synchronized, retained, backed up, or recoverable                                             |
| Receiver gratitude and optional anonymous Tribe card      | `localStorage` record rendered against a fixture request                         | Browser profile                             | Private participant history plus optional authoritative Tribe activity                           | Anonymous rendering retains local IDs, but no server policy separates private provenance from public projection                                 |
| Fictional care perspective switcher                       | React state                                                                      | Page session                                | Prototype-only; remove from production UI                                                        | It is explicitly not authentication or authorization                                                                                            |
| PWA installation, static offline shell, and update notice | Browser service worker and Cache Storage                                         | Browser profile                             | Intentionally device-local infrastructure                                                        | API responses and user data are not cached; there is no offline mutation queue                                                                  |

There is currently no user-data cache: the PWA caches only the static shell.
There is also no active worker behavior. `apps/worker` is a reserved package, not
a durable-job implementation.

## Boundary gaps by product area

### Identity, relationships, and profiles

- Domain: `CloudForestActor`, `CuratorPerson`, care requester records, and
  Timeline actors are separate shapes without one canonical person/account ID
  model. Relationship ownership, role, lifecycle, and ordering are absent.
- Contracts/API: only health and get-one-Timeline-item reads exist. There are no
  session, invitation, person, Party, or Tribe operations.
- Authorization: no trusted current actor, account boundary, Party ownership,
  profile visibility rule, or capacity enforcement exists.
- Database: only `timeline_items` exists. There are no accounts, people,
  relationships, invitations, profile fields, ordering, or version columns.
- Concurrency/recovery: simultaneous Party edits, duplicate relationships,
  removal, invitation expiry, and lost-update behavior are undefined.
- Tests: fixture cardinality and UI flows exist; authenticated integration,
  authorization-denial, transaction, migration, and reload tests do not.

### Care requests, offers, and lifecycle

- Domain: the strongest rules live in `apps/web/src/lib/careLifecycle.ts`, not
  the shared domain package. IDs and timestamps are client-created. Give offers
  lack owner identity and a snapshotted audience.
- Contracts/API: there are no care read/write contracts, list projections,
  version tokens, idempotency keys, or typed errors.
- Authorization: requester, eligible viewer, claimer, participant, history
  owner, and Tribe-post permissions are selector rules rather than trusted
  enforcement.
- Database: no request, offer, audience snapshot, claim, pass, seen state,
  completion, disposition, history, or gratitude tables exist.
- Concurrency: first claim, pass quorum, dual completion, terminal transitions,
  retries, and gratitude uniqueness need atomic database guarantees.
- Recovery: delivery uncertainty, safe retries, abandoned client requests,
  corrupted cache, retention, deletion, export, backup, and restore are absent.
- Tests: the prototype state engine is well covered in memory and localStorage;
  repository, transaction-contention, API integration, authenticated E2E, and
  multi-client reload tests are absent.

### Timeline and other layers

- Domain/data: the durable Timeline type is a flat actor snapshot and content
  string. It has no audience, activity kind, source record, pagination cursor,
  deletion state, or stable projection contract.
- API/database: one item can be read by opaque ID without authentication. There
  is no feed query, authorization filter, deterministic ordering tie-breaker,
  or projection from care activity.
- Guilds/Signals: current screens are useful visual prototypes, but conversion
  would require product decisions about membership, leadership, provenance,
  ingestion, refresh, moderation, and failure handling. Server-hosting the mock
  shapes now would create accidental architecture.

### Client cache, media, and operations

- Account-scoped cache, freshness, invalidation, logout clearing, schema
  versioning, and separation of private drafts from cached server data are not
  implemented.
- Portrait object URLs are previews only. Upload validation, ownership,
  metadata stripping, storage, deletion, fallback, and abuse boundaries are
  undecided.
- There are no product jobs, notifications, observability events, audit-log
  policy, backup verification, or production restore drills. These should enter
  only with a concrete flow.

## Proposed dependency-ordered implementation tasks

The DCP identifiers remain useful program-level references. The approved first
tranche maps DCP-01 through DCP-06 to backlog tasks T-034 through T-041 because
the two collaborative UX checkpoints are tracked as separate tasks.

### Tranche 1 — identity, Party, and profiles

#### DCP-01: Canonicalize identity and relationship domain concepts — medium

- Prerequisites: approve this tranche and decide whether one account initially
  maps to exactly one person.
- Migration boundary: none.
- Work: add framework-neutral account/person IDs, profile, relationship layer,
  Party membership, ordering, and capacity concepts to `packages/domain`;
  document how existing web-only actor shapes adapt without rewriting UI.
- Acceptance: stable identity vocabulary replaces cross-slice string
  assumptions at new boundaries; five-Party-member invariant and ownership are
  unit-tested; no application behavior changes.
- Checks: domain tests, typecheck, `pnpm check`.
- Risks: prematurely merging account, person, external actor, and source
  identities. Keep explicit adapters where semantics differ.

#### DCP-02: Approve the authorization and privacy matrix — small planning task

- Prerequisites: DCP-01.
- Migration boundary: none.
- Work: record who may read and mutate self profile, Party membership, another
  profile, each care state, private history, and Tribe activity. Include blocked
  and removed relationships as denied cases, even if implementation is later.
- Acceptance: every proposed API operation has allow/deny rules and data-field
  visibility; UI filtering is explicitly non-authoritative.
- Checks: documentation review against product principles and threat cases.
- Risks: implementing auth middleware before object-level rules are settled.

#### DCP-03: Establish invited account sessions — medium, dependency approval required

- Prerequisites: DCP-01, DCP-02, explicit approval of the authentication
  dependency and email-delivery boundary.
- Migration boundary: forward migration for account, person, invitation, and
  session records; no care or relationship data yet.
- Work: implement invite-only local/test sessions, trusted current-person
  resolution, logout, expiry, and typed unauthorized responses.
- Acceptance: protected routes cannot accept a caller-supplied actor ID;
  invitation reuse and expired/revoked sessions fail; no public signup.
- Checks: contract, API, database integration, session-expiry, and E2E tests;
  `pnpm check`.
- Risks: email delivery expands scope. A deterministic local invitation adapter
  should precede any production provider.

#### DCP-04: Persist people and Party membership — medium

- Prerequisites: DCP-01 through DCP-03.
- Migration boundary: reviewed tables for profiles and owned Party membership,
  including unique owner/member pairs, stable ordering, timestamps, and a
  database-enforced maximum strategy.
- Work: repositories for current profile and ordered Party reads/mutations.
- Acceptance: duplicate/self membership and sixth-slot writes fail atomically;
  one account cannot read or mutate another account's private Party.
- Checks: migration drift, repository integration, concurrent-add, and rollback
  tests against `TEST_DATABASE_URL`.
- Risks: database enforcement of a count limit needs a transaction/locking
  design; a UI count check is insufficient.

#### DCP-05: Add versioned Party and profile APIs — medium

- Prerequisites: DCP-04.
- Migration boundary: none unless review identifies a missing version column.
- Work: TypeBox contracts, OpenAPI/client generation, authorized reads, add,
  edit, remove, and reorder operations with explicit conflict responses.
- Acceptance: runtime validation and object authorization cover success,
  malformed input, forbidden access, duplicate, full Party, not found, and
  stale-write conflict paths.
- Checks: contract examples, generated-artifact check, API/repository
  integration tests, `pnpm check`.
- Risks: oversized generic relationship APIs. Keep this slice Party-specific.

#### DCP-06: Convert the Party gallery and profiles — medium

- Prerequisites: DCP-05.
- Migration boundary: none.
- Work: replace Party/profile fixtures and session-only add-member state with
  typed API reads/writes while preserving existing responsive, focus, and
  object-URL cleanup behavior. Keep other Curator layers mocked.
- Acceptance: reload retains additions and ordering; conflict and unavailable
  states are calm and recoverable; UI does not optimistically exceed five;
  current browser visuals remain accepted.
- Checks: focused component tests, authenticated desktop/mobile E2E, offline and
  API-failure states, `pnpm check`.
- Risks: portrait upload is not part of this task; retain initials or a
  session-only preview until DCP-M01 is separately approved.

### Optional branch — portrait media

#### DCP-M01: Establish owned portrait upload and deletion — medium

- Prerequisites: DCP-05 and explicit storage/provider approval.
- Migration boundary: profile media metadata and lifecycle state only; object
  bytes live behind a portable adapter.
- Acceptance: type/size validation, metadata policy, authorized read/delete,
  replacement cleanup, fallback, and failed-upload recovery are tested.
- Checks: adapter contract tests, API/database integration, browser upload and
  keyboard tests.
- Risks: sensitive images, orphaned objects, and provider lock-in. Defer if
  initials satisfy the pilot.

### Tranche 2 — care records and basic operations

#### DCP-07: Establish the minimum authoritative Tribe audience boundary — medium

- Prerequisites: DCP-01 through DCP-05 and approval to make Tribe membership,
  but not neighborhood editing, part of the care dependency path.
- Migration boundary: reviewed directed relationship records sufficient to
  identify the current owner's Tribe, enforce the 100-person limit, and snapshot
  a care audience; no neighborhood, feed, Guild, or Signal tables.
- Work: authorized membership reads and the smallest reviewed mutation path
  needed to create trusted audience snapshots. Continue rendering existing
  neighborhood fixtures until their own product behavior is selected.
- Acceptance: another account cannot inspect the private Tribe list; duplicate,
  removed, blocked, and over-capacity memberships cannot enter a new snapshot;
  later membership edits do not rewrite an existing snapshot.
- Checks: domain, repository transaction, authorization, contract, and
  integration tests; `pnpm check`.
- Risks: accidentally treating visual neighborhoods as durable social graph
  concepts. Persist membership semantics only.

#### DCP-08: Move the accepted care model into the shared domain — medium

- Prerequisites: DCP-01, DCP-02, and product confirmation that the accepted meal
  flow remains the first durable care type.
- Migration boundary: none.
- Work: define request, offer, audience snapshot, lifecycle record, and error
  types in `packages/domain`; port the tested transition invariants without UI,
  browser storage, or fixture dependencies.
- Acceptance: current expiration, pass quorum, claim visibility, completion,
  retry, history, and gratitude rules pass framework-neutral tests unchanged.
- Checks: domain tests and `pnpm check`.
- Risks: designing a universal care taxonomy. Preserve the meal-only scope.

#### DCP-09: Persist care requests, offers, and audience snapshots — medium

- Prerequisites: DCP-04, DCP-07, and DCP-08.
- Migration boundary: reviewed request, offer, and immutable audience-snapshot
  tables with owner, lifecycle status, expiry, timestamps, and version fields.
- Acceptance: owner and audience references are valid; request bodies survive
  restart; expiry queries use database time consistently; no lifecycle event
  tables are bundled into this migration.
- Checks: migration, repository integration, time-boundary, and restart tests.
- Risks: snapshots containing later-removed people require an explicit access
  revocation rule from DCP-02.

#### DCP-10: Add authorized care create/list/withdraw APIs — medium

- Prerequisites: DCP-03, DCP-09.
- Migration boundary: none.
- Work: versioned contracts and client methods for Party-scoped meal request and
  offer creation, participant-specific lists, and owner withdrawal.
- Acceptance: server derives owner and audience; list results expose only
  authorized fields; validation, expiry, withdrawal, and retry/idempotency
  behavior are explicit.
- Checks: contract generation, API/database integration, authorization-denial,
  and E2E reload tests.
- Risks: trusting client snapshots or clocks. The service must create both.

#### DCP-11: Convert Receive, Give, Timeline care cards, and My Care reads — medium

- Prerequisites: DCP-10.
- Migration boundary: none.
- Work: replace session-created request/offer arrays and fixture-dependent My
  Care reads with typed API projections. Keep lifecycle mutations disabled or
  clearly prototyped until tranche 3.
- Acceptance: request/offer creation and withdrawal survive reload; private
  lists are account-bound; loading, empty, stale, and failure states preserve
  current accessibility and layout.
- Checks: focused tests, desktop/mobile authenticated E2E, `pnpm check`.
- Risks: a mixed durable/prototype lifecycle can confuse testers; label the
  temporary boundary or deliver DCP-11 and DCP-14 in a tight sequence.

### Tranche 3 — transactional care lifecycle and activity

#### DCP-12: Persist lifecycle events and private projections — medium

- Prerequisites: DCP-08 through DCP-10.
- Migration boundary: separate reviewed tables for claim, pass, seen state,
  completion, disposition, retry link, gratitude, and participant-private
  history; constraints encode uniqueness and terminal-state rules where
  practical.
- Acceptance: actor/time provenance is server-owned; private reason and
  attributed gratitude are separable from public projection; retention and
  deletion semantics are documented.
- Checks: migrations, repository integration, malformed legacy fixture audit,
  and backup/restore shape review.
- Risks: storing redundant derived history can drift. Choose event derivation or
  transactional projection explicitly.

#### DCP-13: Implement atomic claim, pass, and seen transitions — medium

- Prerequisites: DCP-12.
- Migration boundary: only indexes or constraints proven missing by contention
  tests.
- Work: authorized mutation APIs with idempotency keys and transaction-level
  first-claim, pass quorum, demotion, and per-viewer seen guarantees.
- Acceptance: concurrent eligible claims yield exactly one winner; retries do
  not duplicate records; denied viewers learn no private state; demotion occurs
  once from the immutable audience snapshot.
- Checks: multi-connection contention, API integration, authorization, and E2E
  tests.
- Risks: process-local locks or read-then-write checks will fail across hosts.

#### DCP-14: Implement atomic outcomes, retry, history, and gratitude — medium

- Prerequisites: DCP-13.
- Migration boundary: only reviewed corrections from exercised constraints.
- Work: participant-only completion and Not-completed operations, atomic linked
  retry creation, private history reads, and optional anonymized Tribe gratitude
  projection.
- Acceptance: two completion calls close once in either order; Not completed is
  terminal and idempotent; predecessor and successor commit together; anonymous
  activity never exposes private provenance; gratitude timing follows D-030.
- Checks: permutation/concurrency tests, API/database integration, privacy-field
  assertions, and multi-session E2E.
- Risks: leaking private reason or identity through a shared response, logs, or
  Timeline projection.

#### DCP-15: Replace browser lifecycle authority — medium

- Prerequisites: DCP-14.
- Migration boundary: none for server state. Any IndexedDB cache requires its
  own approved schema task.
- Work: connect the accepted care UI to typed lifecycle operations, remove the
  perspective harness from production builds, and retire v1/v2 `localStorage`
  authority with a non-importing cleanup policy unless a real migration is
  separately approved.
- Acceptance: two authenticated browser contexts observe correct visibility and
  transitions after reload; stale writes recover; local malformed/future bytes
  are not silently uploaded or destroyed.
- Checks: component, API failure, two-context E2E, mobile focus/overflow, and
  `pnpm check`.
- Risks: treating fictional browser records as real data. Default to no import.

#### DCP-16: Add an authorized Timeline feed and care activity projection — medium

- Prerequisites: DCP-05 and DCP-14.
- Migration boundary: add activity kind, source reference, audience/projection
  metadata, deletion state, and deterministic `(published_at, id)` ordering to
  the Timeline schema through reviewed forward SQL.
- Work: cursor-paginated feed contract and repository query; project authorized
  profile and care activity, including anonymous gratitude, without embedding
  private lifecycle fields.
- Acceptance: Party/Tribe authorization is enforced in the query path;
  pagination is stable under inserts; deleted/blocked content disappears;
  existing Mira read remains compatible until intentionally retired.
- Checks: pagination and authorization integration, OpenAPI drift, query-plan
  inspection, E2E mixed feed, `pnpm check`.
- Risks: building a generic event bus. Use explicit activity kinds and source
  adapters owned by the contributing slice.

### Tranche 4 — cache, recovery, and mock retirement

#### DCP-17: Add account-scoped read caching only where measured — medium, optional

- Prerequisites: at least one accepted authoritative read path with a concrete
  offline or latency need; explicit Dexie dependency approval if used.
- Migration boundary: client cache schema only, versioned and account-scoped.
- Acceptance: freshness/invalidation is explicit; logout clears only the
  current account; cached server data, private drafts, and offline mutations are
  separate; corruption falls back without mutating server state.
- Checks: cache migration, multi-account isolation, offline/reconnect, and E2E.
- Risks: accidentally making a cache authoritative. Defer offline writes.

#### DCP-18: Prove recovery and retire only replaced mocks — medium

- Prerequisites: the approved conversion tranche is complete.
- Migration boundary: none unless restoration testing finds a schema defect.
- Work: run backup/restore and failed-operation drills for converted records;
  document retention/deletion; remove only fixtures and adapters whose durable
  replacements pass parity review. Leave Guilds, Signals, and unselected
  prototypes intact and labeled.
- Acceptance: restored data preserves ownership and visibility; interrupted
  writes are safe to retry; repository docs and tests name every remaining mock;
  browser screenshots remain approved.
- Checks: restoration drill, migration-from-empty, full integration/E2E,
  security/privacy review, `pnpm check`.
- Risks: equating code cleanup with product completion or deleting useful
  prototype references too early.

## Deferred until separately selected

- Tribe neighborhood editing beyond the minimum authoritative audience
  membership needed by care
- Guild membership, leadership, posting, and moderation
- Signal ingestion, provenance, refresh, and federation
- general posting/replies behind the inert Write control
- notifications and PostgreSQL-backed durable jobs
- offline mutation replay or cross-device conflict resolution
- production hosting, mail, object storage, analytics, and external federation

These are not omissions from durability. They are product choices whose missing
requirements make implementation premature.

## Recorded product-owner decisions

On 2026-09-04, the product owner approved:

1. DCP-01 through DCP-06 as the first delivery tranche. `BACKLOG.md` maps the
   work to T-034 through T-041 so the two UX review checkpoints remain separate
   from their implementation tasks.
2. Deferring portrait upload. Initials and session-only preview behavior are
   sufficient until DCP-M01 is separately selected.
3. Establishing only the minimum authoritative Tribe membership needed for
   care audiences before converting care. Visual neighborhood editing remains
   a prototype and is not pulled into the dependency path.
4. Treating v1/v2 browser care records as non-importable fictional test data.
   Tranche 1 may introduce deterministic database-backed account, person, and
   Party fixtures; it must not convert browser lifecycle records into user data.
5. Retaining Better Auth with invite-only email magic links as the preferred
   direction for evaluation. The dependency still requires separate approval,
   and deterministic local and test invitations come before production email
   delivery.

Complete one task, branch, pull request, review, and merge at a time. Pause for
product-owner review after T-041 before loading another implementation tranche.
