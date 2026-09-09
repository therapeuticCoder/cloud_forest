# Care

Care turns Cloud Forest's relationship map into practical mutual aid. The goal is to make asking for help and helping someone else feel socially and cognitively lightweight.

Give offers and Receive requests use the same relationship and audience principles.

## Eligibility

Only current mutual Connections may participate in another User's Care.

A Connection is eligible when:

- it currently exists;
- its current home placement matches the Care's current Party or Tribe layer;
- no applicable pass, block, or revocation removes access; and
- the Care lifecycle currently permits the read or action.

Holding Connections and private Characters cannot participate. Guild Care is deferred.

Eligibility is dynamic. Earlier visibility or earlier layer membership does not create continuing access.

## Publication and audience

A user may publish Care to Party or Tribe.

Party and Tribe are exclusive audiences. Party is not a hidden subset or superset of Tribe for authorization purposes.

If Party is selected but there are no eligible Party Connections, the UI should explain that the Care will begin with Tribe instead.

Party Care demotes to Tribe when no unresolved eligible Party Connections remain. Demotion is one-way unless the originator explicitly starts a fresh Party round.

The user experience should show only useful information, such as the current layer and eligible count. It should not expose audience names, private relationship metadata, passes, or authorization reasoning.

## Passes and claims

Passing is private to the viewer. A pass suppresses that Connection for the Care under its current relational standing.

Moving a Connection between Party and Tribe clears that Connection's existing passes for the Care so an old pass does not suppress them under a new relational standing.

If the originator explicitly returns Tribe Care to Party, that begins a fresh Party round and clears Party passes for that round. Existing Tribe passes remain unless that Connection itself moves between Party and Tribe.

The first eligible claim wins. After a claim, the active Care is shared only by the requester and giver while their Connection remains valid.

A claimant may release a claim. The Care returns to the same layer with prior passes intact.

## Completion and retry

Requester and giver record their own outcomes independently.

Care remains active until both participants complete it, unless either participant closes it as not completed or another terminal condition applies.

A not-completed outcome may include a private reason and may offer an allowed close, postpone, or linked retry path. Private reasons never appear in shared Timeline activity.

Claimed Care may also expire after its completion window. The exact duration is not yet durable product truth.

## Gratitude

When the receiver records completion, they may choose a Care-specific gratitude statement and add their own words.

That gratitude is saved immediately to both participants' private histories. If the receiver chooses to publish gratitude to Tribe, the shared activity may identify the receiver normally or as “A neighbor.”

An anonymized Tribe presentation does not erase participant provenance from the two private histories.

## Relationship changes during Care

Moving a Connection to Holding immediately revokes its Care access.

Removing a Connection from the user's Forest revokes relationship-derived access to that user's Care.

Breaking or blocking a Connection during claimed Care immediately revokes the shared active Care and closes it as orphaned. Reconnection does not reactivate it. Each former participant keeps only the private historical record they are entitled to.

Current mutual consent outranks an earlier Care participant role.

## Alpha scope

For 1.0-ALPHA, favor one complete, understandable shared Care path over a generalized Care platform. Preserve the accepted interaction semantics where useful, but do not carry forward browser-storage authority, fictional perspective switching, fixture-specific audience snapshots, or speculative hardening from the old prototype.
