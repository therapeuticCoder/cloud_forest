# Privacy and authorization

Cloud Forest treats private relationship curation as sensitive by default. The trusted service, not the client UI, is authoritative for shared data access.

## Core invariants

- The service resolves the current actor from the authenticated session. A caller-supplied person or user ID never becomes authority.
- Knowing an object ID, having seen an object before, or having once belonged to an audience does not create continuing access.
- Private Character data stays private. A mutual Connection does not reveal private names, notes, labels, placement, or other curation.
- Party, Tribe, and Holding placement are private directed curation.
- Care access is checked against current Connection, current placement, block/revocation state, participant role, and lifecycle state.
- Private Care history and public/shared Timeline activity are separate projections. Private reasons and participant provenance must not leak into shared activity.
- Client-side filtering, hidden controls, localStorage, mock perspective switches, and route state are presentation mechanisms, not security boundaries.
- Saved device reads are scoped to the last signed-in owner. They may be stale while offline; live authentication and current server authorization remain necessary for shared actions. Authoritative session rejection, account changes, and sign-out clear that owner's saved reads.
- Private Curator edits and portraits commit with their local projection in IndexedDB before the app reports success. Pending edits survive session rejection and sign-out, but remain inaccessible through the app until the same account signs in again. Connection placement affects server audiences and Care access only after synchronization succeeds; pairing, blocking, and disconnecting require a live session.

## Profiles and relationships

Users may receive only the minimal profile information required for an authorized relationship or active Care interaction.

Another person's decision to place a user in Party or Tribe does not reveal that person's list, private relationship metadata, or reciprocal placement.

A block breaks the Connection and overrides relationship-derived shared access. Blocking state should not be disclosed indirectly through special error messages or pairing outcomes.

## Care

Every protected Care read or mutation re-evaluates current eligibility. Moving to Holding, removal from the Forest, breaking a Connection, or blocking can immediately revoke access.

After a claim, only the originator and participant receive the active Care
projection while their current Connection remains valid.

Withdrawal apologies are private to the two Care participants and never appear on Timeline or in Tribe activity. Withdrawal does not create or preserve gratitude.

## Signals and public data

Signals may consume public federated activity. Importing public content does not make Cloud Forest relationship data public and does not justify sending private Cloud Forest data outward.

## Alpha posture

The alpha is for invited trusted testers, but invitation is not a substitute for authorization. Implement the narrow security boundary required by each real shared feature. Do not invent exhaustive future policy before a feature exists.
