# Durable Product Conversion Program

Status: tranche 1 completed through T-042 on 2026-09-07. T-043's product policy
was approved on 2026-09-08, T-044's review was completed on 2026-09-08, and
T-046's protocol was approved on 2026-09-09. Tranche 2 implementation remains
inactive until the product owner explicitly loads an implementation task; T-045
and T-047 through T-052 remain proposed.

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
| Curator people and layers        | Party/profile APIs; other layers remain fixtures           | Authorized profiles and owned relationship records                             |
| Ordinary Timeline                | Seven fixtures plus one PostgreSQL/API item                | Authorized, ordered activity projections                                       |
| Give/Receive composition         | React state                                                | Owned care records with a current layer and dynamic Connection eligibility     |
| Care lifecycle/history/gratitude | Versioned browser `localStorage` and fictional perspective | Atomic service transitions and separate participant/private/shared projections |
| PWA shell                        | Browser Cache Storage                                      | Remain static-shell-only unless measured needs justify account-scoped cache    |
| Portraits                        | Fixture assets and object-URL previews                     | Separately selected owned media boundary                                       |
| Guilds/Signals/Write             | Visual fixtures or inert control                           | Deferred until behavior, moderation, provenance, and failure rules exist       |

The browser care model is a behavior specification, not migratable user data.
There is no active worker or user-data cache.

## Required gaps

- **Identity and relationships:** Party/profile authority is complete for the
  current pilot; minimum authoritative Tribe eligibility and durable mutual
  connection behavior remain separate work.
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
| DCP-06  | UX-02                              | Party gallery and profiles converted to APIs; implemented as T-041                                  |
| UX-03   | DCP-06, product-owner review       | Mutual-connection QR handshake reviewed before durable identity-linking work; T-042                 |
| DCP-M01 | DCP-03, separate approval          | Owned portrait upload/deletion with validation and metadata stripping                               |
| PD-01   | DCP-06, UX-03                      | Care audience and relationship-change policy approved through T-043                                 |
| UX-04   | PD-01                              | Audience, demotion, removal, blocking, and stale-authorization states reviewed; proposed T-044      |
| PD-02   | UX-03, PD-01                       | Durable mutual-connection protocol approved through a ChatGPT interview; completed T-046            |
| DCP-B01 | PD-01, UX-04, PD-02                | Minimum durable block authority for relationship and care eligibility; proposed T-045               |
| DCP-I01 | DCP-B01, PD-02                     | Private curated Person linked to an invited user through the approved handshake; proposed T-047     |
| DCP-07  | DCP-I01                            | Minimum authoritative Tribe eligibility for care; no neighborhood semantics; proposed T-048         |
| DCP-08  | DCP-07                             | Accepted meal-care rules moved from web code into shared domain; proposed T-049                     |
| DCP-09  | DCP-08                             | Owned request/offer records with current-layer state and dynamic eligibility; proposed T-050        |
| DCP-10  | DCP-09                             | Authorized create/list/read/withdraw APIs with idempotency and explicit errors; proposed T-051      |
| DCP-11  | DCP-10, UX-04                      | Receive/Give/Timeline/My Care reads converted with loading and recovery states; proposed T-052      |
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
- The service owns clocks and Care's current Party-or-Tribe layer. It computes
  eligibility from current Connection, relationship, pass, block, revocation,
  and lifecycle state for every operation; publication-time membership is not
  an authorization snapshot.
- Keep request/offer storage separate from lifecycle-event migrations; keep
  private participant history separate from shared activity projections.
- Use explicit Timeline activity kinds and source adapters, not a generic event
  bus. Stable pagination orders by `(published_at, id)`.
- Any client cache is versioned and account-scoped, separates server reads from
  drafts/offline mutations, clears only the current account, and never becomes
  authoritative.

## Product-decision and UX checkpoints

- Before care persistence, use a ChatGPT-side, one-question-at-a-time interview
  to settle audience, passing, demotion, removal, blocking, relationship-change,
  and mutual-connection implications; then review those states in an annotated
  desktop/mobile prototype before Luna implements durable behavior.
- Before durable identity linking, use a separate ChatGPT-side interview to
  settle the mutual-connection consent, token, disclosure, conflict, replay,
  blocking, and unlinking protocol accepted by T-042's visual prototype.
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

## Delivery guidance

Implementation work is expected to use Luna, one backlog item per fresh
`codex/` branch and pull request. Because later slices cross multiple package
boundaries, each Luna handoff should name likely files, invariants, exclusions,
the verification plan, and explicit stop conditions rather than relying on a
short task title alone. Luna should inspect only sources relevant to the active
item, batch compatible reads, and ask before pursuing cleanup, speculative
hardening, or adjacent product work.

Significant unresolved product or architecture choices are not implementation
questions. Move them to the ChatGPT side for an interview-format conversation,
record the approved outcome, and only then revise or hand off the dependent
Luna task. The explicitly selected workflow assigns responsibility for tests,
proportional gates, GitHub delivery, review, and merge.

Known permission boundaries should receive a direct narrow escalation request;
do not spend tokens repeating an unprivileged operation or inventing workaround
sequences.

## Approved product-owner decisions

On 2026-09-04 the product owner approved:

1. DCP-01 through DCP-06 as tranche 1, split into T-034 through T-041 with two
   UX checkpoints; the accepted mutual-connection UX checkpoint was added as
   T-042 before the completed tranche closed.
2. Portrait upload deferred; initials and session preview suffice.
3. Only minimum authoritative Tribe membership enters the care dependency path;
   visual neighborhoods remain prototype presentation.
4. Browser care v1/v2 records are fictional and must not be imported as users'
   durable data.
5. Better Auth invite-only magic links remain the preferred candidate, subject
   to dependency approval; local/test invitations precede production email.

On 2026-09-08 the product owner approved T-043's durable Care policy:

1. Only mutual Connections may participate in Care; Holding, Party, and Tribe
   are exclusive home layers, while Guild Care remains deferred.
2. Party and Tribe Care use current dynamic eligibility, not immutable
   publication-time membership snapshots.
3. Party quorum and demotion respond to current relationships and passes;
   automatic demotion never automatically reverses.
4. Moving, removing, breaking, and blocking Connections revoke access as
   specified in `docs/durable-care-audience-policy.md`; current mutual consent
   outranks claimed-Care participation.
5. Give and Receive share these rules. Claimed-Care UX, terminal-history
   presentation, notifications, generalized taxonomy, and production identity
   linking remain in their named later tasks.

Tranche 1, T-043, T-044, and T-046 are complete. T-045 and T-047 through
T-052 remain proposed and are not approved for implementation until the product
owner explicitly loads the tranche.
