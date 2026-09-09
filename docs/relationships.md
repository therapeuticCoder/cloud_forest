# Relationships

Cloud Forest separates private curation from mutual social connection.

## Character, User, and Connection

A **Character** is a user's private representation of another person. It may contain private names, labels, notes, placement, and other curation. A Character can exist without the represented person using Cloud Forest.

A **User** is an authenticated Cloud Forest account identity.

A **Connection** exists only after two Users mutually consent to connect and each side resolves the other User to one of their own Characters. Private Character data does not cross that boundary.

A Character may remain private forever. A Connection does not make the Character shared.

## Placement and layers

Cloud Forest currently uses Party, Tribe, Guilds, Signals, and Holding.

### Party

Party is the closest bounded relationship layer. It has five relationship slots plus the user's separate self tile.

Party is for the people the user most strongly wants available for everyday and crisis-level mutual support. Party membership is private, directed curation. Another person's decision to place someone in Party does not reveal their list or imply reciprocal placement.

### Tribe

Tribe is the broader personal network, capped at 100 people. It supports meaningful reciprocal relationships and is the wider personal audience for care when Party is not the current layer.

Party and Tribe are exclusive home placements for a Connection rather than cumulative membership states.

### Holding

Holding is not a social status to perform. It is a private curation workspace.

A Character or Connection may stay in Holding while the user decides where it belongs, while they wait for capacity in another layer, or while they intentionally do not want it visible in their active layers. Holding does not make a Connection eligible for Care.

### Guilds

Guilds are user-created groups for organized cooperation: clubs, mutual-aid groups, projects, communities, organizations, and other shared purposes. Guild membership is conceptually orthogonal to Party/Tribe placement.

For 1.0-ALPHA, Guilds are a visible placeholder only. Do not invent durable Guild behavior until a future product story selects it.

### Signals

Signals are intentionally followed public people or sources. They are not Characters or Connections and do not imply reciprocity.

Signals exist so a user can care about what someone or something says without pretending there is a personal relationship. The alpha federation proof should allow at least one external federated public source to appear as a Signal.

## Mutual Connection protocol

1. The initiator starts from an existing Character.
2. Cloud Forest issues a single-purpose pairing token, currently intended to be presented as a QR code.
3. The authenticated receiver opens the pairing as their current User.
4. Each participant sees only the other participant's User/account identity, not private Character data.
5. The receiver chooses an existing Character or creates a new one for the initiator.
6. Either participant may confirm first after Character resolution. The first confirmation changes nothing authoritative.
7. The second valid confirmation atomically establishes the Connection on both sides and links each selected Character to the counterpart User.

Consent is independent and symmetric. Cancellation before completion kills the attempt. A newer attempt supersedes an older pending attempt.

Pairing tokens are single-purpose, carry no private Character metadata, expire after 15 minutes, and become unusable after success, cancellation, block, supersession, or expiry.

If the Users are already connected, another pairing attempt is a harmless no-op. A friendly message such as “Doh! You already have this connection.” is acceptable.

## Breaking, reconnecting, and blocking

Either User may unilaterally break a Connection. The break is immediate. Each side may keep or delete their own private Character.

A preserved Character may later reconnect to the same User. Relationship history may be restored as historical context, but prior or completed Care does not reactivate. Cares are not restored by reconnection.

A preserved Character may also later connect to a different User. Prior shared Care history must never transfer to that different User.

Blocking is immediate and stronger than ordinary disconnection. It invalidates pending pairing attempts, breaks the Connection, and revokes relationship-based shared access. Failure states should not disclose that a block caused them.
