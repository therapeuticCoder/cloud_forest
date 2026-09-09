# Durable mutual-connection protocol

Status: product-approved T-046 decision as of 2026-09-09. This document
defines the consent and privacy behavior for upgrading two private Characters
into a mutual Connection between two authenticated Users. It does not approve
a database schema, API shape, QR library, camera behavior, or persistence
implementation.

## Identity model

- A **Character** is Curator-owned private relationship curation.
- A **User** is an authenticated account identity.
- A **Connection** exists only after both Users explicitly consent and each
  side has resolved the other User to one of their own Characters.

Private Character data never crosses the handshake boundary. The handshake
may disclose only the other participant's User/account identity, currently the
canonical account display name. Character names, nicknames, relationship
labels, notes, placement, portraits, and other private curation remain
private.

`linkedUserId` is an authorization-sensitive, server-owned relationship result.
It is not an ordinary private Character editing field and becomes authoritative
only when the second valid confirmation completes the protocol.

## Canonical protocol

1. The initiator starts from an existing Character.
2. The system issues a single-purpose pairing token, displayed by the
   initiator as a QR code.
3. The authenticated receiver scans the token as their current User.
4. Both participants see only the other participant's User/account identity.
5. The receiver explicitly resolves the initiator to one of their own
   Characters by choosing an existing Character or creating a new one.
6. Either participant may confirm first once the receiver has resolved a
   Character. The first confirmation changes nothing authoritative.
7. The second valid confirmation atomically establishes the Connection on
   both sides and links each selected Character to the authenticated
   counterpart User.

Consent is independent and symmetric. Either participant may cancel before
completion, and cancellation immediately kills the pairing attempt. The flow
does not offer account selection or identity switching. If the wrong account
is active, the participant must cancel, switch accounts outside the flow, and
scan again.

## Pairing-token rules

The token exists only for connection establishment. It carries no private
Character metadata, is not a reusable identity artifact, expires after 15
minutes, and becomes unusable after successful completion, cancellation,
blocking, supersession, or expiry.

Only one live attempt may exist for the relevant Character/User pairing
context. A newer attempt supersedes the older attempt; a superseded attempt is
inert and cannot later complete.

## Existing, broken, and restored Connections

If the two Users already have an active Connection, scanning another token is
a harmless no-op. The UI may present a friendly message such as “Doh! You
already have this connection.” No Character mapping, Connection state, or
private data changes.

Either User may unilaterally break an existing Connection. The break is
immediate, while each participant's private Character remains unless its owner
separately deletes it.

A preserved Character may later reconnect to the same User. Relationship
history may remain historical context, but prior or completed Care never
reactivates. A preserved Character may also reconnect to a different User;
prior shared Care history must never transfer to that User.

## Blocking and authority timing

A block immediately invalidates any pending pairing attempt between the
affected Users. A blocked attempt cannot complete, even if one participant
confirmed earlier. Failure presentation remains neutral and does not disclose
that blocking caused it.

The second valid confirmation is the only point at which the Connection and
the two `linkedUserId` results become authoritative. The first confirmation,
client state, private Character editing, and pairing-token possession cannot
create or modify that authority.

## Required non-disclosing outcomes

The durable implementation must give explicit safe outcomes for expired,
reused, cancelled, superseded, blocked, wrong-account, stale-confirmation,
replay, concurrent-completion, duplicate-link, and duplicate-existing-
Connection attempts.

These outcomes must not reveal another User's private Character data, private
relationship graph, block state, or account existence beyond the identity
already disclosed by the approved handshake. Retries must be safe and must not
create multiple links.

## Deferred implementation ownership

- T-047 owns the reviewed storage, repository, contract, API, token-consumption,
  confirmation, atomic-linking, retry, and concurrency implementation, plus
  the approved T-042 interaction and recovery states.
- T-045 owns the minimum authoritative block representation and enforcement
  that T-047 must consult for pending and existing Connections.
- QR/camera mechanics and any dependency choice remain part of T-047's
  implementation review and require separate approval where applicable.
- Generalized discovery, public identity search, account or Character merge,
  notifications, moderation/reporting, and Care lifecycle behavior remain
  separate future product tasks; this protocol does not authorize them.

