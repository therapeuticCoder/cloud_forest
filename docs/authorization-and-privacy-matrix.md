# Authorization and privacy matrix

Status: approved policy for future durable identity, Party, profile, and care
boundaries. This document records authorization requirements; it does not
implement them.

## Purpose

Cloud Forest's trusted service must enforce every read and mutation against an
authenticated current person, the requested object, its current audience, and
the fields returned. A successful authentication is necessary but is never, by
itself, permission to access another person's data.

For the initial invited pilot, one account maps to exactly one person. Party is
private, directed, owned curation with five relationship slots. The owner's
self tile is separate from those memberships and does not consume a slot.

Client-side filtering, lifecycle selectors, hidden or disabled controls,
browser storage, and the fictional care perspective switcher are not
authorization. They may present an already-authorized projection, but they
must never decide which records or private fields the caller receives.

## Trust boundaries and actors

| Boundary or actor        | Meaning                                                                                                    | Trust rule                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trusted session boundary | Validates an invitation-derived account session                                                            | The service rejects a missing, expired, revoked, or otherwise invalid session before protected object lookup or mutation.                            |
| Current account          | The authenticated account selected by the trusted session                                                  | The initial pilot maps it to exactly one person. A request cannot select a different current account.                                                |
| Current person           | The person resolved by the service from the current account                                                | This trusted person ID supplies the actor, owner, viewer, requester, participant, and history-owner identity whenever the caller acts as themselves. |
| Party owner              | A person curating their own directed Party                                                                 | The owner alone may inspect or mutate their Party membership records and owner-private metadata.                                                     |
| Party member             | A person placed in somebody else's Party                                                                   | Membership does not grant access to the owner's Party list or imply a reciprocal relationship.                                                       |
| Eligible Tribe viewer    | A person in the requester's current authoritative Tribe and the request's original audience snapshot       | Eligibility is object-specific and current. It grants only the relevant activity or unclaimed-care projection.                                       |
| Care requester           | The trusted person who owns a Receive request                                                              | The requester may see and mutate only the requester operations allowed by the lifecycle.                                                             |
| Care giver               | The one trusted person whose eligible claim succeeded                                                      | After claim, the giver and requester are the only active-care viewers and lifecycle participants, subject to a block rule.                           |
| Unrelated person         | An authenticated person with no current relationship, care-participant role, or other rule granting access | Authentication alone grants no access to another person's private profile projection, relationships, care, or history.                               |
| Removed relationship     | A former Party or Tribe relationship no longer current                                                     | Removal revokes access derived from that relationship. Historical participation may still authorize the person's own private history.                |
| Blocked relationship     | A current block exists between the caller and the target person or object owner                            | A block overrides relationship- and participant-based shared-object access. Each person retains only their own private history projection.           |
| Unauthenticated caller   | No valid trusted session and current person                                                                | All operations in this document are denied. Public discovery, signup, and public profile access are not established by this matrix.                  |

The service may accept a target person ID or object ID to identify the resource
being requested. Such an ID is only a lookup key; it is never proof that the
caller owns, participates in, or may view that resource.

## Rule categories and evaluation order

Each operation is evaluated in this order:

1. **Authentication:** resolve one valid current account and its one current
   person from trusted server-side state.
2. **Block rule:** deny access when a block applies, except for the caller's own
   private-history projection and a separately approved safety operation.
3. **Object authorization:** establish an owner, participant, or current
   relationship role for the specific target object.
4. **Audience visibility:** for relationship-scoped activity, intersect the
   object's recorded audience with the caller's current eligible relationship.
5. **Mutation authority:** verify that the trusted current person may perform
   this transition in the object's current state.
6. **Private-field projection:** return only the fields authorized for that
   caller and role.

An allow in one category does not bypass a denial in another. In particular,
being authenticated, knowing an object ID, appearing in an old audience
snapshot, or receiving a field in an earlier response does not create ongoing
authority.

## Field-level rules

### Profiles

The canonical profile currently contains only `displayName`. `personId` is a
stable identifier returned when needed to identify an authorized person; it is
not a mutable profile field. Portraits and additional profile fields remain
deferred.

| Caller and target                                                       | `personId`                                                                             | `displayName` | Account or session fields        | Party label, note, position, or list                                               | Mutation                                                              |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- | -------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Current person reading self                                             | Allow                                                                                  | Allow         | Deny from the profile projection | Deny from the profile projection; available only through the owned-Party operation | May update `displayName`; may not replace identity or account mapping |
| Current person reading someone in their current directed Party or Tribe | Allow                                                                                  | Allow         | Deny                             | Deny                                                                               | Deny                                                                  |
| Active requester reading giver, or active giver reading requester       | Allow                                                                                  | Allow         | Deny                             | Deny                                                                               | Deny                                                                  |
| Person who merely appears in the target's Party                         | Deny unless the caller independently has a current directed relationship to the target | Same          | Deny                             | Deny                                                                               | Deny                                                                  |
| Unrelated, removed, or blocked person                                   | Deny                                                                                   | Deny          | Deny                             | Deny                                                                               | Deny                                                                  |
| Unauthenticated caller                                                  | Deny                                                                                   | Deny          | Deny                             | Deny                                                                               | Deny                                                                  |

Relationship-derived access is directed from the current person's curation to
the target. Another person's decision to include the caller does not disclose
that person's profile, Party, or relationship metadata by itself.

### Owned Party membership

| Field or action                                 | Party owner                                      | Party member            | Other authenticated person | Removed or blocked person | Unauthenticated caller |
| ----------------------------------------------- | ------------------------------------------------ | ----------------------- | -------------------------- | ------------------------- | ---------------------- |
| Owner person ID                                 | Allow in the owner's own Party response          | Deny                    | Deny                       | Deny                      | Deny                   |
| Member person ID and minimal profile projection | Allow                                            | Deny as membership data | Deny                       | Deny                      | Deny                   |
| Position                                        | Allow                                            | Deny                    | Deny                       | Deny                      | Deny                   |
| `relationshipLabel`                             | Allow                                            | Deny                    | Deny                       | Deny                      | Deny                   |
| `privateNote`                                   | Allow                                            | Deny                    | Deny                       | Deny                      | Deny                   |
| Full membership list                            | Allow                                            | Deny                    | Deny                       | Deny                      | Deny                   |
| Add, edit, remove, or reorder                   | Allow for the trusted current person's own Party | Deny                    | Deny                       | Deny                      | Deny                   |

Party writes must also reject self-membership, duplicates, a sixth relationship
slot, invalid or noncontiguous ordering, an owner mismatch, and adding a
removed or blocked relationship without a separately approved restoration
flow. The service derives the owner from the current person; a caller-supplied
owner ID cannot redirect a Party operation.

### Owned Tribe membership

The minimum authoritative Tribe membership needed for care is also private,
directed, and owned curation. It does not make visual neighborhoods
authoritative or establish a generalized social graph.

| Field or action                                 | Tribe owner                                      | Tribe member            | Other authenticated person | Removed or blocked person | Unauthenticated caller |
| ----------------------------------------------- | ------------------------------------------------ | ----------------------- | -------------------------- | ------------------------- | ---------------------- |
| Owner person ID                                 | Allow in the owner's own Tribe response          | Deny                    | Deny                       | Deny                      | Deny                   |
| Member person ID and minimal profile projection | Allow                                            | Deny as membership data | Deny                       | Deny                      | Deny                   |
| Full membership list                            | Allow                                            | Deny                    | Deny                       | Deny                      | Deny                   |
| Add or remove membership                        | Allow for the trusted current person's own Tribe | Deny                    | Deny                       | Deny                      | Deny                   |

Tribe writes must reject self-membership, duplicates, a relationship beyond
the 100-person limit, an owner mismatch, and adding a removed or blocked
relationship without a separately approved restoration flow. The service
derives the owner from the current person and does not expose another owner's
membership list. Exact storage overlap between Party and Tribe and visual
neighborhood editing remain outside this authorization policy.

### Care fields and states

The accepted Receive-care lifecycle supplies product semantics, not an
authorization implementation. The durable service must construct the audience
snapshot, actor provenance, timestamps, and lifecycle state from trusted data.

For Party-pass quorum, the service starts with the immutable original Party
snapshot and intersects it with the requester's current eligible, non-blocked
Party relationships. A removed or blocked snapshot member is no longer
authorized to pass and is no longer required for quorum; the service does not
invent a pass on that person's behalf. When every remaining eligible snapshot
member has passed, including when none remain, the service performs the single
Party-to-Tribe demotion and applies the same original-snapshot-plus-current-
eligibility rule to Tribe visibility.

| Data class                                        | Authorized projection                                                                                                                                                                                                                        | Explicit denials                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unclaimed Receive request or available Give offer | Owner/requester and current eligible audience may receive the ID, care kind and direction, approved request or offer body, minimal owner/requester profile, creation/expiry information, and the actions currently available to that caller. | Unrelated, removed, blocked, expired-ineligible, and unauthenticated callers receive no object or field projection.                                                                                                                                                                                        |
| Audience snapshot and authorization evidence      | The service may use immutable original audience membership internally and may expose only a non-identifying audience label when the product requires it.                                                                                     | Never return Party or Tribe member ID lists, relationship metadata, pass identities, or authorization reasoning as ordinary care fields. Never accept a client snapshot as authority.                                                                                                                      |
| Seen and minimized state                          | The current viewer may read and update only their own state for a care item they can currently view.                                                                                                                                         | Requester, Party owner, another viewer, unrelated person, removed person, and blocked person may not inspect or mutate somebody else's state.                                                                                                                                                              |
| Pass state                                        | An eligible Party viewer may create their own pass and learn the resulting presentation available to them. The service may expose that the request has moved to Tribe without identifying individual passes.                                 | No caller may pass as another person or inspect another member's pass. Tribe, unrelated, removed, blocked, and unauthenticated callers cannot pass.                                                                                                                                                        |
| Claim state                                       | Before claim, an eligible current Party or Tribe viewer may attempt a claim. After the first successful claim, only requester and giver may receive the active request, claim status, and minimal counterpart profile.                       | Losing claimers and all unrelated Party or Tribe viewers receive no claimed-care projection or claimant identity. Removed, blocked, and unauthenticated callers cannot claim.                                                                                                                              |
| Completion state                                  | Requester and giver may read the participant projection and record only their own decision in a valid lifecycle state.                                                                                                                       | Neither participant may decide for the other. All nonparticipants are denied the decisions and mutation.                                                                                                                                                                                                   |
| Not-completed disposition and reason              | Requester and giver may receive the participant-private disposition and reason. The participant who records Not completed may choose an allowed close, postpone, or linked-retry disposition.                                                | Reasons are excluded from Timeline, Tribe activity, other profiles, audience viewers, unrelated people, logs intended for shared activity, and unauthenticated responses. No caller may submit another participant's actor ID.                                                                             |
| Terminal care history                             | The authenticated history owner may receive only their own participant-private history projection, including their relevant care role, outcome, timestamps, and participant-private reason or attribution.                                   | Another person cannot retrieve the owner's history through a person profile, Party membership, care participation, guessed owner ID, or caller-supplied viewer ID.                                                                                                                                         |
| Private gratitude                                 | Requester and giver may each receive the attributed gratitude, receiver and giver provenance, approved statement, optional message, and timestamp in their own private histories.                                                            | Other audience members, unrelated people, removed people without a participant-history record, blocked counterparts' shared views, and unauthenticated callers are denied.                                                                                                                                 |
| Tribe gratitude projection                        | Current eligible Tribe viewers may receive an opted-in gratitude activity containing the approved statement, optional shared message, timestamp, and either the authorized receiver display name or `A neighbor`.                            | The projection omits giver identity, receiver identity when anonymized, request and participant IDs, audience membership, private reasons, completion records, and other private-history provenance. A viewer who is removed or blocked after publication is no longer eligible through that relationship. |

Private participant history and Tribe activity are separate projections even
when they originate from the same gratitude record. An anonymized Tribe card
does not erase attributed receiver and giver provenance from each participant's
private history, and private provenance must not be recoverable from the Tribe
response.

## Removed and blocked relationships

Relationship removal immediately revokes profile, membership, unclaimed-care,
and Tribe-activity access that depended only on that current Party or Tribe
relationship. The person is excluded from newly created audience snapshots.
An old snapshot remains lifecycle evidence but does not permanently authorize
its former members; current-audience reads and mutations require both original
snapshot inclusion and a current eligible relationship.

Removal alone does not erase an already-established requester/giver role or the
person's own participant-private history. If care was claimed before removal,
the participant role remains the authorization basis for that active care
unless a block applies.

A block is stronger than removal. It denies profile access, relationship-based
activity, care visibility and mutation, new audience inclusion, and ordinary
participant access to the shared active object. It does not let either person
read or erase the other's private history, and it does not remove the caller's
own previously recorded history projection. The safe terminal behavior for a
block created during already-claimed care must be approved with the durable
care lifecycle; until then, ordinary participant operations do not override
the block.

For an unclaimed request, removal or blocking also removes that person from the
effective Party-pass quorum. This is a server-owned authorization consequence,
not a synthetic pass or a client-side selector decision.

## Proposed operation matrix

These are policy operation names, not committed HTTP routes. Later contracts
may split or combine them only if every resulting endpoint preserves an
equivalent rule and field projection.

### Identity and profile operations

| Operation                      | Allow                                                                                                                        | Deny and projection rule                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Resolve current account/person | Valid trusted session; service resolves its account and one mapped person                                                    | Deny invalid sessions. Never accept a caller-supplied current account or person ID.                                         |
| Read current profile           | Current person                                                                                                               | Return self-profile fields only; exclude session secrets and relationship collections.                                      |
| Update current profile         | Current person, for mutable self fields                                                                                      | Deny identity, account mapping, or another person's profile changes. Currently only `displayName` is mutable.               |
| Read another profile           | Current person with a current directed Party/Tribe relationship to the target, or an active requester/giver counterpart role | Return only the minimal profile projection. Deny unrelated, removed, blocked, reciprocal-only, and unauthenticated callers. |

### Party operations

| Operation             | Allow                                                                                 | Deny and projection rule                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Read owned Party      | Current person for their own Party                                                    | Return ordered memberships and owner-private metadata. Deny members and all other people from reading the list.          |
| Add Party member      | Owner of the current person's Party, within all domain and current-relationship rules | Deny caller-supplied owner, self, duplicate, sixth-slot, removed, blocked, and unauthorized targets.                     |
| Edit Party membership | Owner, for a membership in their own Party                                            | Permit owner-private label/note changes only. Deny changes to identity or ownership.                                     |
| Remove Party member   | Owner, for their own membership record                                                | Deny members and other people. Removal revokes relationship-derived access but does not erase participant-owned history. |
| Reorder Party         | Owner, with a complete valid ordering of their own current memberships                | Deny foreign, missing, duplicate, out-of-range, noncontiguous, and stale membership sets.                                |

### Tribe membership operations

| Operation           | Allow                                                                       | Deny and projection rule                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read owned Tribe    | Current person for their own authoritative Tribe membership                 | Return only that owner's membership list and minimal member profiles. Deny members and all other people from inspecting the list.                             |
| Add Tribe member    | Owner of the current person's Tribe, within capacity and relationship rules | Deny caller-supplied owner, self, duplicate, over-capacity, removed, blocked, and unauthorized targets. Do not create or expose a visual neighborhood.        |
| Remove Tribe member | Owner, for a membership in their own Tribe                                  | Deny members and other people. Removal revokes current relationship-derived profile, unclaimed-care, and Tribe-activity access without erasing owned history. |

### Care and Tribe-activity operations

| Operation                               | Allow                                                                                      | Deny and projection rule                                                                                                                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create Receive request                  | Current person as requester                                                                | Service derives requester, current Party/Tribe audience snapshot, timestamps, and initial state. Deny caller-supplied authority or foreign ownership.                                                                                     |
| Create Give offer                       | Current person as owner                                                                    | Service derives owner, audience, timestamps, and initial state. Deny foreign ownership and client-authoritative snapshots.                                                                                                                |
| List visible care                       | Current person as owner/requester, eligible current audience viewer, or active participant | Return role-specific projections only. Deny unrelated, removed, blocked, and unauthenticated callers.                                                                                                                                     |
| Read one care item                      | Same object-specific rules as list visible care                                            | An opaque ID does not bypass audience, participant, terminal, expiry, removal, or block rules.                                                                                                                                            |
| List My Care and private history        | Current person for their own requests, offers, commitments, and history                    | Deny any caller-supplied history owner that differs from the trusted current person.                                                                                                                                                      |
| Withdraw request or offer               | Trusted owner/requester in a withdrawable state                                            | Deny audience viewers, participants who do not own it, foreign actor IDs, and terminal or otherwise invalid state.                                                                                                                        |
| Read or update seen/minimized state     | Current viewer for their own currently visible item                                        | Deny access to another viewer's state and deny callers who cannot currently view the item.                                                                                                                                                |
| Pass Receive request                    | Eligible current Party viewer, once, before claim or expiry                                | Deny requester impersonation, another member's pass, Tribe-only viewers, removed/blocked viewers, and invalid state. Removed and blocked snapshot members are excluded from the server-calculated quorum rather than recorded as passing. |
| Claim Receive request                   | Eligible current Party or demoted-Tribe viewer before claim or expiry                      | Exactly one claim may succeed. Deny removed/blocked/ineligible callers, actor substitution, and disclosure of the winner to losing or unrelated viewers.                                                                                  |
| Record completion                       | Requester or giver, for their own decision, in valid claimed state                         | Deny nonparticipants and attempts to decide for the counterpart.                                                                                                                                                                          |
| Record Not completed                    | Requester or giver, for their own decision, in valid claimed state                         | Keep the reason participant-private; deny nonparticipants and counterpart impersonation.                                                                                                                                                  |
| Close, postpone, or create linked retry | Authorized participant following their own Not-completed decision                          | Server performs valid terminal and retry changes atomically. Deny foreign ownership, unrelated callers, and inconsistent predecessor/successor authority.                                                                                 |
| Record receiver gratitude               | Requester when they record Completed, once per accepted lifecycle rule                     | Save attributed participant-private provenance; publish Tribe activity only on explicit opt-in. Deny giver-authored receiver gratitude, nonparticipants, duplicates, and caller-selected provenance.                                      |
| Read private attributed gratitude       | Current person for their own participant-private history                                   | Deny access to another person's full gratitude history or provenance.                                                                                                                                                                     |
| Read Tribe activity                     | Current eligible Tribe viewer for currently authorized activity                            | Return only the shared projection. Deny private source fields and deny unrelated, removed, blocked, and unauthenticated viewers.                                                                                                          |

## Threat cases and required consistency checks

Later contract, API, repository, and browser work must test at least these
cases:

- every protected operation rejects an unauthenticated, expired, or revoked
  session;
- changing a target ID cannot expose another person's profile, Party, care, or
  history;
- caller-supplied actor, owner, requester, viewer, participant, and
  history-owner IDs are rejected or ignored in favor of the trusted current
  person;
- a Party member cannot enumerate the owner's Party or read membership labels,
  notes, or positions;
- a Tribe member cannot enumerate the owner's Tribe or use membership to infer
  other members;
- a reciprocal-only relationship grants no directed access;
- removed and blocked people cannot replay operations using old audience
  snapshots, cached responses, guessed IDs, or stale controls;
- removal or blocking before pass excludes that snapshot member from the
  server-calculated quorum, and all remaining eligible members passing demotes
  the request exactly once;
- unrelated Party and Tribe viewers cannot see an active request or claimant
  after claim;
- no participant can submit the other participant's completion or disposition;
- nonparticipants cannot read claims, completions, dispositions, reasons,
  private gratitude, or terminal history;
- one participant cannot use a profile or history endpoint to retrieve the
  other participant's complete private history;
- anonymized Tribe gratitude cannot leak receiver or giver provenance through
  IDs, nested objects, source references, error details, or shared logs;
- list and single-object reads apply the same authorization and projection;
- every mutation rechecks current state and authorization instead of relying on
  a previous read or a hidden/disabled control;
- Party capacity, ownership, uniqueness, and ordering rules agree across the
  domain, repository, API, and response projection;
- care request visibility agrees across Timeline, profile, My Care, and direct
  object operations without making client selectors authoritative.

Whether a denied lookup returns a generic not-found response or an explicit
forbidden response is a later contract decision. Whichever vocabulary is
chosen must not reveal private object existence or fields through
distinguishable responses.

## Deferred implementation questions

- Select the authentication dependency and session representation under T-037.
- Decide the safe terminal operation and notification behavior when a block is
  created during already-claimed care.
- Define retention, deletion, export, audit logging, and recovery for private
  profile, relationship, care, and history records.
- Define exact versioned paths, request schemas, idempotency keys, concurrency
  responses, and not-found/forbidden vocabulary in their owning API tasks.
- Define additional profile fields and their separate projections only when a
  concrete product task needs them.

This task does not implement authentication, sessions, invitations,
dependencies, database schemas or migrations, APIs, middleware, persistence,
UI changes, care conversion, generalized social-graph architecture, production
email, or external services.
