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

## Profiles and relationships

Users may receive only the minimal profile information required for an authorized relationship or active Care interaction.

Another person's decision to place a user in Party or Tribe does not reveal that person's list, private relationship metadata, or reciprocal placement.

A block breaks the Connection and overrides relationship-derived shared access. Blocking state should not be disclosed indirectly through special error messages or pairing outcomes.

## Care

Every protected Care read or mutation re-evaluates current eligibility. Moving to Holding, removal from the Forest, breaking a Connection, or blocking can immediately revoke access.

After a claim, only the requester and giver receive the active participant projection while their current Connection remains valid.

Private not-completed reasons are participant-private. Gratitude may have a separate Tribe-facing projection, including an optional “A neighbor” presentation, without exposing private participant provenance.

## Signals and public data

Signals may consume public federated activity. Importing public content does not make Cloud Forest relationship data public and does not justify sending private Cloud Forest data outward.

## Alpha posture

The alpha is for invited trusted testers, but invitation is not a substitute for authorization. Implement the narrow security boundary required by each real shared feature. Do not invent exhaustive future policy before a feature exists.
