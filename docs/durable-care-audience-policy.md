# Durable Care audience and relationship-change policy

Status: product-approved T-043 policy as of 2026-09-08. This document governs
future durable Give and Receive Care. It does not change the current
device-local prototype or select an implementation schema, API, or identity
linking protocol.

## Identity and relationship model

Cloud Forest distinguishes three concepts:

- A **Character** is a Curator-owned private representation with no
  authenticated User pointer.
- A **User** is an authenticated platform identity.
- A **Connection** is a Character upgraded through mutual connection between
  two Users.

Only Connections may participate in Care. Characters, Holding Connections,
and unauthenticated identities cannot receive, claim, pass, or otherwise
participate in another User's Care.

Holding, Party, and Tribe are mutually exclusive home layers for a Connection.
Guild membership is orthogonal; Guild Care is deferred. Signals remain outside
the Character and Connection model.

These are product concepts, not approval of a database representation. The
durable mutual-connection and identity-linking protocol remains owned by T-046
and T-047.

## Dynamic Care audience

Durable Care does not freeze Party or Tribe membership at publication time.
The Care record has a current layer, and the trusted service calculates access
from current state for every read and mutation.

A User is currently eligible only when all of these are true:

1. a valid Connection currently exists;
2. the Connection's current home layer matches the Care's current layer;
3. the Connection is not suppressed by an applicable pass under that current
   relational standing;
4. no block or other current revocation applies; and
5. the Care lifecycle state permits that access or action.

Party Care is visible only to eligible Party Connections. Tribe Care is
visible only to eligible Tribe Connections. Party is not a superset of Tribe.
Knowing an object ID, having seen the Care earlier, or having belonged to an
earlier audience never supplies continuing authorization.

Temporary session absence does not revoke eligibility. Durable Connection and
relationship state, rather than whether a User is currently signed in, govern
eligibility.

## Publication, demotion, and quorum

The originator may publish Care directly to Party or Tribe. If Party is chosen
but there are zero eligible Party Connections, the Care starts at Tribe.

Party quorum is dynamic. Current eligible Party Connections gain immediate
voice on unresolved Party Care; leaving Party immediately removes their quorum
influence. When no unresolved eligible Party Connections remain, the service
automatically demotes the Care to Tribe.

Demotion is one-way unless the originator acts. Care never returns to Party
automatically. The originator may manually return Tribe Care to Party, which
starts a fresh Party round and clears Party passes for that round.

If no eligible Tribe Connections remain, the Care stays active for the
originator and expires normally. A new Connection that enters the Care's
current layer may become eligible while the Care remains active.

## Passes and claims

A pass suppresses that Connection from the Care under its current relational
standing. An ordinary claim and later release do not clear previous passes.
Moving the Connection between Party and Tribe erases that Connection's
existing passes for the Care.

A manual Tribe-to-Party return clears Party passes and begins a fresh Party
round. Existing Tribe passes remain unless erased by that Connection's own
movement between Party and Tribe.

A claimant may release a claim. The Care returns to the same layer, with prior
passes intact. The originator may cancel their Care.

Claimed Care has a separate completion window. If neither participant resolves
it within that window, it closes neutrally as **expired after claim**. The
window's exact duration and detailed claimed-Care interface remain deferred.

## Relationship changes and current consent

Moving a Connection to Holding immediately revokes its Care access. Removing a
Connection from the Forest immediately revokes all access to Care originating
from that Forest. Breaking a Connection immediately revokes active shared Care
access.

Current mutual Connection consent outranks an active-participant role. If a
Connection breaks during claimed Care, the Care is immediately revoked and
closed as **orphaned**. Reconnection does not reactivate it. Both former
participants retain a private historical record that it closed and that
neither remains responsible.

When a Connection breaks, its owner may preserve or destroy the underlying
Character. A preserved Character may later reconnect to the same User or a
different User. Rebinding it to a different User never transfers prior shared
Care history to the new User.

## Blocking

Blocking is stronger than ordinary disconnection. It breaks the Connection
and immediately revokes the blocked User's active and shared-history access.
Shared historical records may remain hidden so that a later restoration is
possible, but unblocking alone restores neither the Connection nor shared
history. The Users must re-establish the Connection first.

The blocker may retain or erase their own private historical record. They may
not inspect or erase the other User's private record. A block during claimed
Care therefore also applies the orphaned closure rule above.

## Accepted presentation boundary

The service enforces current eligibility and authorization silently. The UI
does not notify the user for every pass, demotion, newly eligible Connection,
empty audience, removal, or block.

When a Party publication has no eligible Party Connections, the publication
wizard explains that the Care will begin with Tribe instead. Active Care shows
only its current layer and eligible count, such as `Tribe · 1/5`, together with
the actions available to the current viewer; it does not show audience names or
faces. Care that is no longer accessible is absent from Timeline. Meaningful
closures remain in private Care History as a neutral reason line without
exposing relationship or authorization mechanics. A user can discover the
result of an explicit action without a confirmation notification.

This is a presentation boundary, not an authorization rule. The trusted
service remains responsible for every protected read and mutation, and detailed
notification behavior remains deferred to a later task.

## Scope and deferrals

Give offers and Receive requests use the same audience and relationship-change
rules. This policy deliberately defers:

- Guild Care to a separately selected future product task;
- the claimed-Care completion-window duration and fine-grained claimed-Care UX
  to the tranche 3 lifecycle checkpoint before DCP-12 and DCP-13;
- detailed terminal-history presentation to the pre-mock-retirement checkpoint
  before DCP-15;
- notification behavior to a separately selected jobs/notification task;
- a generalized Care taxonomy to a separately selected product task; and
- production identity linking to T-046 and T-047.
