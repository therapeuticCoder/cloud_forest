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

Status: completed through T-042 on 2026-09-07. T-034 through T-042 were
delivered as separate reviewed increments.

This tranche makes invited identity, Party membership, and person profiles
authoritative while preserving the accepted interface. Care remains the
device-local prototype until a later tranche. Portrait upload remains deferred.

#### Completed through T-039

- T-034: Canonicalize identity and relationship domain concepts — completed by PR #51 as `0c93669`; shared account/person/layer/Party domain rules established.
- T-035: Approve the authorization and privacy matrix — product-approved 2026-09-05; field-level access and denial rules recorded.
- T-036: Prototype invited-session UX for annotated review — completed by PR #53 as `926fa5e`; fictional review artifact retained as disconnected history.
- T-037: Establish invited account sessions — completed by PR #55; trusted local/test sessions, current-person resolution, expiry, revocation, and unauthorized responses established.
- T-038: Persist people and Party membership — completed by PR #56; owned profiles, ordered Party membership, capacity, and guarded persistence established.
- T-039: Add versioned Party and profile APIs — completed by PR #57; authorized contracts, generated client, CRUD, reorder, and stale-write responses established.

#### Completed through T-042

- T-040: Prototype durable Party and profile states for annotated review — completed by PR #58 as `b89707b`; accepted loading, empty, add, conflict, unavailable, retry, and five-slot direction retained as disconnected history.
- T-041: Convert the Party gallery and profiles — completed by PR #59 as `b0ff360`; normal app uses typed backend reads/writes with accepted Party/profile behavior.
- T-041A: Connect the authenticated local app shell and retire review wiring — in progress; local session shim, trusted current-person resolution, refresh-safe view state, and disconnected historical review artifacts.
- T-042: Prototype the mutual connection QR handshake — completed by PR #60 as `136b38c`; fictional two-party consent and recovery direction retained as disconnected history.

### Tranche 2 — Durable care records and basic operations

Status: T-043, T-044, and T-046 completed; T-045 and T-047 through T-052 remain proposed. Do not
begin implementation until the product owner explicitly loads the next task.

This tranche gives accepted mutual connections durable identity links, then
gives the accepted meal request and offer flows authoritative relationship
eligibility, shared domain rules, durable records, authorized API operations,
and reload-safe reads. It deliberately stops before durable claim, pass,
completion, retry, gratitude, or private-history mutations; those transactional
lifecycle operations belong to a later tranche.

#### Completed through T-044

- T-043: Decide durable care audiences and relationship-change behavior — product-approved 2026-09-08; authoritative eligibility and relationship-change policy recorded in `docs/durable-care-audience-policy.md`.
- T-044: Prototype durable care audience and boundary states — completed by product-owner review 2026-09-08; accepted silent/background behavior, wizard fallback, layer/count-only active Care, Timeline suppression, and neutral private-history reasons recorded in `docs/durable-care-audience-policy.md`; temporary fixture removed before publication.
- T-046: Decide the durable mutual-connection protocol — product-approved 2026-09-09; consent, pairing-token, identity-disclosure, linking-authority, cancellation, blocking, duplicate, reconnection, and non-disclosing threat-case behavior recorded in `docs/durable-mutual-connection-protocol.md`.

#### T-046: Decide the durable mutual-connection protocol

Status: completed product-approved decision 2026-09-09
Size: small planning task
Prerequisites: completed T-042 and accepted T-043 relationship policy

Conduct a ChatGPT-side interview, one question at a time, before Luna plans
identity-link implementation. Decide the pairing-token lifetime and transport,
which participant presents and confirms, how both already-invited users express
consent, when `linkedUserId` becomes authoritative, and how duplicate scans,
wrong-account use, cancellation, expiry, blocking, concurrent attempts, and
safe retry behave. Define the protocol mechanics and implementation owner for
breaking, reconnecting, preserving or destroying a Character, and rebinding a
preserved Character without transferring prior shared Care history.

The approved outcome is recorded in `docs/durable-mutual-connection-protocol.md`.
It preserves the accepted distinction between an owner's private curated
Person fields and the linked user's account identity; neither side may receive
the other's private curation through the handshake.

Acceptance: T-047 can be implemented without inventing consent, token,
identity-disclosure, conflict, or unlinking behavior, and every deferred choice
has an owning later task.

Checks: documentation review against T-042, the authorization/privacy matrix,
account-enumeration constraints, and the accepted mutual-connection states.

Out of scope: schemas, pairing APIs, QR dependencies, or production behavior.

#### T-045: Establish minimum durable block authority

Status: proposed
Size: medium
Prerequisites: accepted T-043 policy, T-044 direction, and T-046 protocol

Add the smallest trusted block representation and service enforcement required
by the approved authorization matrix and T-043 decisions. Derive the blocker
from the current session, prevent caller-selected authority, and make an active
block immediately revoke Party/Tribe profile access, relationship-derived
access, and later Care eligibility. Define the exact permitted self-read and
unblock behavior without exposing whether a private relationship or Care object
exists.

Luna guidance: keep this a safety/authorization boundary, not a moderation
platform. Ask before adding reporting, muting, reasons, audit dashboards,
notifications, broad history deletion, Connection persistence, or claimed-Care
terminal behavior. T-047 implements the approved Connection-breaking side
effect when durable Connections exist; the later claimed-Care lifecycle task
implements atomic orphaned closure.

Acceptance: current profile and relationship reads consistently deny blocked
pairs; later audience calculation has one trusted eligibility check to reuse;
block and unblock operations are idempotent and do not disclose private graph
state. This task does not claim to mutate a not-yet-durable Connection or Care
lifecycle.

Checks: domain and contract checks, reviewed migration and database
integration, bidirectional authorization denials, idempotency cases,
generated-artifact check, and `pnpm check`.

#### T-047: Implement durable mutual-connection identity linking

Status: proposed
Size: medium
Prerequisites: accepted T-045 block authority and T-046 protocol

Implement the approved existing-Person mutual-connection handshake for two
already-invited users. Add the minimum reviewed persistence, repository rules,
versioned contracts, generated client, and authorized API operations needed to
issue and consume single-purpose pairing tokens, require the approved consent
and confirmation sequence, and set the owner's private curated Person
`linkedUserId` to the authenticated counterpart. Use the T-042 interaction and
recovery states without exposing private curated fields or account existence.
Integrate T-045 block authority so blocking breaks an existing Connection and
unblocking alone cannot reconnect it.

Luna guidance: treat `linkedUserId` as an authorization-sensitive server write,
not a normal curated-Person edit field. Reuse established session, contract,
repository, and error patterns. Ask before adding QR libraries, production
camera behavior, notifications, public discovery, heuristic matching, account
merge, history merge, or generalized connection graphs.

Acceptance: a private curated Person can become linked only through the
approved two-user protocol; expired, reused, blocked, wrong-account,
duplicate-link, concurrent, and replay attempts have explicit non-disclosing
results; retries cannot create multiple links; private nicknames, relationship
meaning, notes, placement, and portraits remain owner-only.

Checks: protocol/domain tests, reviewed migration and database integration,
contract and generated-artifact checks, authorization and concurrency denials,
authenticated desktop/mobile handshake E2E, and `pnpm check`.

#### T-048: Establish minimum authoritative Tribe eligibility

Status: proposed
Size: medium
Prerequisite: T-047

Add only the domain, reviewed forward storage, repository, Party-adjacent
authorization, versioned contracts, generated client, and API behavior needed
for a person to curate and read their own directed Tribe Connections and for
the service to calculate Care eligibility. Enforce mutually exclusive Holding,
Party, and Tribe home layers, the 100-person capacity, ownership,
self/duplicate rejection, current removal and block exclusions, and minimal
authorized profile projection transactionally. Keep visual neighborhood
groupings as presentation-only fixtures.

Luna guidance: reuse the T-045 block eligibility boundary, T-047 durable
identity links, and existing Party/session patterns. Stop and ask before
introducing a generalized social graph, converting the Tribe gallery, making
neighborhoods authoritative, or adding suggestions, discovery, or imports.

Acceptance: the trusted service can calculate current eligible Party and Tribe
Connections without caller-supplied authority; members cannot enumerate
another person's Tribe; home-layer movement, capacity, duplicate, removal, and
block cases have explicit results.

Checks: domain and contract checks, reviewed migration and database
integration, authorization denials, generated-artifact check, and `pnpm check`.

#### T-049: Move the accepted meal-care rules into the shared domain

Status: proposed
Size: medium
Prerequisite: T-048

Move the accepted meal request, offer, current audience layer, dynamic
Connection eligibility, expiry, and lifecycle vocabulary from web-only code
into framework-neutral domain types and rules. Preserve the accepted
expiration, Party-pass quorum, Tribe demotion, claim visibility, two-party
completion, claim release, cancellation, orphaned and expired-after-claim
closure, retry, private-history, and gratitude semantics without importing
browser storage or UI assumptions. Apply T-043 where its durable policy
intentionally differs from the fixed-audience prototype.

Luna guidance: port one proven rule boundary rather than redesigning a generic
care platform. Identify exact source tests and adapters before editing, retain
the meal-only vocabulary, and ask before changing accepted behavior or
refactoring neighboring frontend flows.

Acceptance: web code can adapt to the shared model without making the shared
domain depend on React, `localStorage`, fixtures, API contracts, or database
types. Existing browser records remain fictional and non-importable.

Checks: focused domain tests, affected typecheck, and `pnpm check`.

#### T-050: Persist care requests, offers, and current audience layer

Status: proposed
Size: medium
Prerequisite: T-049

Add reviewed forward migrations and repositories for owned meal requests and
offers with their current Party-or-Tribe layer. Persist request content,
lifecycle starting state, expiry, timestamps, and version data. Do not persist
a publication-time membership audience as authorization. Use trusted current
Connection, layer, pass, block, revocation, and lifecycle state when evaluating
each read or mutation.

Luna guidance: keep request/offer storage separate from lifecycle-event,
private-history, gratitude, notification, and Timeline-activity storage. Ask
before adding a table or column not required by the accepted T-043 and T-049
contracts; do not add jobs, caching, or cleanup architecture.

Acceptance: records and current-layer state survive restart; owners and layer
values are valid; service time owns expiry; current eligibility
responds to relationship changes without a membership snapshot; lifecycle
event persistence is absent.

Checks: migration review and drift check, repository integration,
time-boundary, rollback, restart, and guarded database tests; `pnpm check`.

#### T-051: Add authorized care record APIs

Status: proposed
Size: medium
Prerequisite: T-050

Add versioned TypeBox contracts, generated client types, and authorized
create, list, read, and withdraw operations for meal requests and offers. The
service derives owner, audience, timestamps, and starting state. Return
role-specific projections and explicit validation, expiry, withdrawal,
forbidden/not-found, conflict, and idempotency results without leaking private
object existence or fields.

Luna guidance: keep transport types purpose-specific and browser-safe. Reuse
the established session, error, OpenAPI, and client patterns; ask before
introducing generic care endpoints, caller-selected audiences, lifecycle
mutations, or new dependencies.

Acceptance: list and object reads apply the same authorization; request/offer
creation and safe retry cannot duplicate records; stale or unauthorized
withdrawal fails without changing state.

Checks: contract examples, OpenAPI generation check, API/database
integration, authorization denials, idempotency cases, and `pnpm check`.

#### T-052: Connect durable Give, Receive, Timeline care cards, and My Care reads

Status: proposed
Size: medium
Prerequisites: T-051 and accepted T-044 direction

Replace session-created meal request/offer arrays and fixture-dependent care
reads with the typed API projections. Preserve the accepted responsive flows,
focus behavior, and privacy distinctions while adding calm loading, empty,
unavailable, stale-authorization, retry, and withdrawal-conflict states.
Durable lifecycle mutations remain unavailable or clearly identified as the
still-fictional prototype boundary until tranche 3.

Luna guidance: isolate remote care orchestration from `DashboardShell.tsx` and
`TimelinePanel.tsx` through the smallest purpose-named adapter or hook that the
story actually needs. Add a purpose-specific integration test rather than
expanding `App.test.tsx`; ask before broader feed composition, state-management,
routing, cache, or style refactors.

Acceptance: request and offer creation, reads, and withdrawal survive reload;
private lists remain account-bound; durable records are not written to the
browser lifecycle envelope; the UI does not imply that prototype lifecycle
actions are server-authoritative.

Checks: focused component and integration tests, authenticated
desktop/mobile E2E, API/offline/revoked-access states, and `pnpm check`.

### Tranche 2 delivery discipline

- Use one task, fresh `codex/` branch, pull request, review, and merge at a
  time. Do not begin a dependent task until its prerequisite is accepted.
- T-043 is intentionally a ChatGPT-side interview. If a later story exposes a
  significant unresolved product or architecture decision, stop coding and
  return that question to ChatGPT for the same one-question-at-a-time interview
  process before revising the plan.
- Luna is the implementation agent. Each handoff prompt should state the exact
  task, likely files, assumptions, exclusions, invariants, verification plan,
  and the first decision that requires a stop. Give extra repository context
  where the task crosses domain, database, API, and web boundaries.
- Optimize for token efficiency: inspect only task-relevant sources, batch
  compatible reads, follow the selected workflow's responsibility split for
  checks, and ask before pursuing cleanup, speculative hardening, or another
  side quest. Never rerun a broad gate without a named reason.
- Do not use retries or workaround sequences for known permission boundaries.
  Request the necessary narrow escalation directly, then report the result.

Pause for product-owner review after T-052. Tranche 3 remains inactive until
that review is complete and the product owner explicitly loads it.

### Alternating delivery rhythm after tranche 2

Later tranches remain inactive until they are explicitly loaded, but their
delivery should preserve these UX gates:

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
