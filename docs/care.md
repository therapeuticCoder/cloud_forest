# Care

Care turns Cloud Forest's relationship map into practical mutual aid. The goal is to make asking for help and helping someone else feel socially and cognitively lightweight.

Give and Receive are directions on the same Care record. They use the same
relationship, audience, lifecycle, and privacy rules.

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

The first eligible claim wins. After a claim, the active Care is shared only by
the originator and participant while their Connection remains valid.

The Care keeps the same identity across the claim; claiming does not create a
second request or offer object.

## Expiration

Expiration is a neutral terminal outcome. It means the Care was valid and available, but the opportunity passed without successful completion or fault.

In the alpha, an originator chooses an unclaimed Care deadline from four canned options: 1 hour, 4 hours, 1 day, or 1 week. This is a Care-specific deadline, not a generalized scheduling system.

An unclaimed Care expires when either:

- its currently available audience is exhausted and there is no broader eligible audience remaining; or
- a meaningful deadline attached to the Care passes before it is claimed.

For Party Care, audience exhaustion first demotes the Care to Tribe. If the Tribe audience is then exhausted, the Care expires.

Expiration removes the Care from Timeline and Active Care. It leaves a small private history entry for the originator, but does not imply failure, apology, gratitude, retry, or prejudice toward anyone who passed or could not help.

## Completion and withdrawal

The originator and participant record their own outcomes independently.

Care remains active until both participants complete it, unless either participant closes it as not completed or another terminal condition applies.

When both participants complete Care, it becomes terminally completed and remains available as a private history entry for each participant. A partial completion does not create the terminal history state.

A participant may withdraw from a claimed Care when they can no longer follow through. The Care becomes terminally not completed, leaves active Care surfaces, and does not return to Party or Tribe. Both participants retain a private history entry with the Care, their participant role, the ending time, and the apology the withdrawing participant chose to share. An optional personal note is included in both participants' private history; neither the apology nor its note appears on Timeline.

Withdrawal is not a neutral expiration and does not assign blame. In the alpha, withdrawal does not retry, postpone, or republish the Care.

Claimed Care may also expire after its completion window. The exact duration is not yet durable product truth.

## Gratitude

When the receiver records completion, they may choose a Care-specific gratitude statement and add their own words.

That gratitude is saved immediately to both participants' private histories. In the current alpha, gratitude remains private between those two participants; it is not published to Tribe.

## Relationship changes during Care

Moving a Connection to Holding immediately revokes its Care access.

Removing a Connection from the user's Forest revokes relationship-derived access to that user's Care.

Breaking or blocking a Connection during claimed Care immediately revokes the shared active Care and closes it as orphaned. Reconnection does not reactivate it. Each former participant keeps only the private historical record they are entitled to.

Current mutual consent outranks an earlier Care participant role.

## Alpha scope

For 1.0-ALPHA, favor one complete, understandable shared Care path over a generalized Care platform. Preserve the accepted interaction semantics where useful, but do not carry forward browser-storage authority, fictional perspective switching, fixture-specific audience snapshots, or speculative hardening from the old prototype.
