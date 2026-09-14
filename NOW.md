# Cloud Forest 1.0-ALPHA

## Goal

Build a coherent trusted-tester alpha for fewer than 100 people. Alpha succeeds when people can use Cloud Forest together and clearly perceive its central ideas: meaningful relationship layers, low-friction mutual care, a social web that can cross platform boundaries, and an experience designed to help rather than capture attention.

## Current product state

- React PWA, Fastify API, PostgreSQL/Drizzle, Better Auth, signup codes, sessions, and account-to-person mapping exist.
- Username/password login, logout, invited signup, and multiple real users work.
- Private Character curation across Holding, Party, and Tribe is durable and user-backed.
- Users can create Characters in Holding, Party, or Tribe and move them durably among those placements subject to capacity rules.
- Holding is a real private curation workspace; Tribe is real and no longer depends on mocked people.
- Character portraits are durable.
- Mutual Connection establishment is durable: an initiator can start from a Character, create a short-lived pairing, the receiver can resolve the initiator to a private Character, and independent confirmation establishes the Connection only after both participants consent.
- Pairing intent survives login and invited signup, so a pairing link can bring a new tester into Cloud Forest and return them to the pending Connection flow.
- The installed PWA has a bounded offline read path: after a successful online load, the current user's session, Curator relationship data, and existing ordinary Timeline item can reopen from local cache. App-shell updates do not clear that product data; confirmed authentication failures and local sign-out do.
- Server-dependent mutations are currently unavailable offline. A future, separately scoped increment may make Curator more usable offline without turning alpha into a general offline-first synchronization project.
- Relationship exit and safety behavior (delete/remove, break, block, unblock) is the final Relationships increment and is currently in flight on a separate workstream. Care should rely on its resulting durable Connection/block truth rather than reinventing relationship validity.
- The existing ordinary Timeline item is user-backed, but much Timeline content remains fixture-driven.
- Care has a rich device-local interaction prototype, not a real multi-user shared lifecycle.
- Guilds and Signals are currently fixture-backed.
- The app has no public alpha landing page.

## Now

**Care.** Make one complete, understandable Care path genuinely shared between real users. Start with a Receive request published to Party: the originator creates the request, currently eligible Party Connections can see it, the first eligible Connection can claim it, and both participants then see the same claimed Care state.

Keep the first Care increment narrow. Do not carry forward browser-storage authority, fictional perspective switching, fixture-specific audience snapshots, or the full prototype lifecycle. Build the smallest durable shared path that proves a real person can ask their people for help and another real person can show up.

## Next

1. **Care continued** — extend the real shared Care lifecycle only after using the first request/claim path and seeing what it exposes.
2. **Posting** — let users write ordinary posts into Timeline with an appropriate audience/layer model.
3. **Signals** — follow at least one external federated source and bring real outside activity into Timeline, quiet and collapsed by default.
4. **Alpha coherence** — use the whole product end to end; remove remaining prototype fixtures; decompose oversized coordinators into single-responsibility components; separate global styling from component/feature styling; repair confusing seams. This is not a general hardening sprint.
5. **Front Door** — create a small landing page that explains Cloud Forest and provides the alpha entry path.

## Known temporary debt

- `DashboardShell.tsx` owns too many unrelated responsibilities.
- `apps/web/src/index.css` is oversized and mixes global and localized styling.
- Large app-level tests have accumulated around prototype behavior.
- Disconnected review prototypes remain in source until their accepted behavior is safely represented in product code or durable product docs.
- Care and much of Timeline/Guild/Signal presentation still depend on fictional fixture/browser state.

## Definition of done for an alpha increment

An increment is done when its intended behavior works in the real application, the product owner has used and accepted the experience, no known defect blocks the next increment, and temporary scaffolding created for that increment is removed or intentionally retained.

Testing and verification are risk-driven and owned by the product owner. A story does not automatically require full-repository gates, E2E coverage, or documentation beyond updating durable product truth when a real product decision changed.

## 1.0-ALPHA exit

Cloud Forest is 1.0-ALPHA when invited testers can get in, curate meaningful relationships, connect mutually, exchange care, write Timeline posts, receive at least one real federated Signal, understand that Guilds are the coming collaboration layer, and experience the product as calm, bounded, and non-extractive.
