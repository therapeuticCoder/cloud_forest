# Durable Product Conversion Program

Status: tranche 1 approved on 2026-09-04 and active as T-034 through T-041 in
`BACKLOG.md`; later tranches remain proposals until explicitly loaded.

## Strategy

Convert accepted behavior through narrow vertical slices, not a blanket rewrite.
A durable slice has explicit ownership, framework-neutral rules, authenticated
and field-authorized operations, reviewed forward storage changes, concurrency
and recovery behavior, and tests at boundaries that can fail.

Identity and relationship authority precede care. Care records precede lifecycle
transactions. Transactions precede shared Timeline activity. Measured cache and
mock retirement come last. Alternate construction with annotated desktop/mobile
UX review before major boundaries; improve growing files only through cohesive
extractions directly serving the active task.

## Current boundary inventory

| Area                             | Current authority                                          | Durable target                                                                 |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| View/chrome/filter state         | React session state                                        | Remain local unless a requirement changes it                                   |
| Curator people and layers        | Fixtures plus one session-added Party member               | Authorized profiles and owned relationship records                             |
| Ordinary Timeline                | Seven fixtures plus one PostgreSQL/API item                | Authorized, ordered activity projections                                       |
| Give/Receive composition         | React state                                                | Owned care records with immutable audience snapshots                           |
| Care lifecycle/history/gratitude | Versioned browser `localStorage` and fictional perspective | Atomic service transitions and separate participant/private/shared projections |
| PWA shell                        | Browser Cache Storage                                      | Remain static-shell-only unless measured needs justify account-scoped cache    |
| Portraits                        | Fixture assets and object-URL previews                     | Separately selected owned media boundary                                       |
| Guilds/Signals/Write             | Visual fixtures or inert control                           | Deferred until behavior, moderation, provenance, and failure rules exist       |

The browser care model is a behavior specification, not migratable user data.
There is no active worker or user-data cache.

## Required gaps

- **Identity:** canonical account/person/source identities; trusted current
  person; directed relationship ownership, ordering, capacity, and profile
  projections.
- **Care:** shared domain rules; owned requests/offers; authoritative audiences;
  versioned contracts; atomic claims, quorum, outcomes, retry, and gratitude;
  retention and recovery.
- **Timeline:** explicit activity kinds, source records, audience projection,
  stable cursor ordering, deletion/block filtering, and no private-field leaks.
- **Operations:** account-scoped cache only when measured; separately approved
  media; concrete jobs/notifications; verified backup, restoration, and deletion.

## Dependency-ordered program

Active task acceptance criteria and checks belong only in `BACKLOG.md`.

| ID      | Depends on                         | Outcome                                                                                             |
| ------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| DCP-01  | approval                           | Canonical account/person/profile/Party domain concepts; implemented as T-034                        |
| DCP-02  | DCP-01                             | Authorization/privacy matrix; implemented as T-035                                                  |
| UX-01   | DCP-02                             | Invited-session states reviewed before selecting auth implementation; T-036                         |
| DCP-03  | UX-01, dependency approval         | Invite-only local/test sessions and trusted current-person resolution; T-037                        |
| DCP-04  | DCP-03                             | Reviewed profile and ordered owned-Party persistence; T-038                                         |
| DCP-05  | DCP-04                             | Authorized versioned Party/profile APIs and generated client; T-039                                 |
| UX-02   | DCP-05                             | Durable Party/profile states reviewed; T-040                                                        |
| DCP-06  | UX-02                              | Party gallery and profiles converted to APIs; T-041                                                 |
| DCP-M01 | DCP-03, separate approval          | Owned portrait upload/deletion with validation and metadata stripping                               |
| DCP-07  | DCP-06                             | Minimum authoritative Tribe membership for care audiences; no neighborhood semantics                |
| DCP-08  | DCP-07                             | Accepted care rules moved from web code into shared domain                                          |
| DCP-09  | DCP-08                             | Owned request/offer records and immutable audience snapshots                                        |
| DCP-10  | DCP-09                             | Authorized create/list/read/withdraw APIs with idempotency and explicit errors                      |
| DCP-11  | DCP-10                             | Receive/Give/Timeline/My Care reads converted with loading and recovery states                      |
| DCP-12  | DCP-09                             | Lifecycle events and separate private/shared projections persisted                                  |
| DCP-13  | DCP-12                             | Atomic, authorized claim/pass/seen transitions and contention guarantees                            |
| DCP-14  | DCP-13                             | Atomic outcomes, linked retry, history, and gratitude following D-030                               |
| DCP-15  | DCP-14                             | UI connected to service lifecycle; perspective harness and browser authority retired without import |
| DCP-16  | DCP-05, DCP-14                     | Authorized cursor-paginated Timeline and explicit care activity kinds                               |
| DCP-17  | measured need, dependency approval | Optional versioned account-scoped read cache; server remains authoritative                          |
| DCP-18  | selected tranche complete          | Restoration/failure drills and removal only of mocks with proven replacements                       |

Every mutation derives actor/owner identity and timestamps from trusted service
state, rechecks current authorization, and supplies transaction or idempotency
behavior appropriate to races. List and object reads must apply identical field
projection rules. Private reasons and participant provenance never enter Tribe
activity, shared logs, or error details.

Cross-tranche constraints:

- Keep account, canonical person, external actor, and source identities
  distinct; adapt rather than collapsing them into one generic graph type.
- Enforce Party/Tribe capacity and uniqueness transactionally. Client counts and
  process-local locks are not concurrency controls.
- Use the accepted meal flow as the first durable care type; do not invent a
  universal care taxonomy.
- The service owns clocks and immutable audience snapshots. Later membership
  changes do not rewrite snapshots, but current removal/block rules still
  govern access.
- Keep request/offer storage separate from lifecycle-event migrations; keep
  private participant history separate from shared activity projections.
- Use explicit Timeline activity kinds and source adapters, not a generic event
  bus. Stable pagination orders by `(published_at, id)`.
- Any client cache is versioned and account-scoped, separates server reads from
  drafts/offline mutations, clears only the current account, and never becomes
  authoritative.

## UX checkpoints after tranche 1

- Before care persistence: audience, passing, demotion, removal, and blocking.
- Before lifecycle transactions: claim races, stale data, revoked access,
  network failure, and safe retry.
- Before mock retirement: completed care, private history, gratitude, Timeline
  activity, and privacy explanations with real identities.
- During recovery: loading, cached, stale, offline, reconnecting, and failed
  operation states.

## Deferred product choices

Full Tribe neighborhood editing, Guild membership/leadership/moderation, Signal
ingestion/federation, Write/posts/replies, notifications/jobs, offline mutation
replay, cross-device conflicts, production hosting/mail/storage, analytics, and
external federation remain out of scope until separately selected.

## Approved product-owner decisions

On 2026-09-04 the product owner approved:

1. DCP-01 through DCP-06 as tranche 1, split into T-034 through T-041 so UX
   checkpoints remain explicit.
2. Portrait upload deferred; initials and session preview suffice.
3. Only minimum authoritative Tribe membership enters the care dependency path;
   visual neighborhoods remain prototype presentation.
4. Browser care v1/v2 records are fictional and must not be imported as users'
   durable data.
5. Better Auth invite-only magic links remain the preferred candidate, subject
   to dependency approval; local/test invitations precede production email.

Pause after T-041 for product-owner review before activating another tranche.
