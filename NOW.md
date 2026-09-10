# Cloud Forest 1.0-ALPHA

## Goal

Build a coherent trusted-tester alpha for fewer than 100 people. Alpha succeeds when people can use Cloud Forest together and clearly perceive its central ideas: meaningful relationship layers, low-friction mutual care, a social web that can cross platform boundaries, and an experience designed to help rather than capture attention.

## Current product state

- React PWA, Fastify API, PostgreSQL/Drizzle, Better Auth, signup codes, sessions, and account-to-person mapping exist.
- Username/password login, logout, invited signup, and multiple real users work.
- Party/private Character curation is partly durable and connected to the API; existing Party members are user-backed.
- The existing ordinary Timeline item is user-backed, but much Timeline content remains fixture-driven.
- Holding, Tribe, Guild, and Signal placements exist in the model, but their user experiences are not yet equivalently durable.
- Tribe still uses old first-sprint styling and mocked data.
- The mutual Connection experience was prototyped and its consent/privacy behavior is decided, but durable Connection establishment is not implemented.
- Care has a rich device-local interaction prototype, not a real multi-user shared lifecycle.
- Guilds and Signals are currently fixture-backed.
- The app has no public alpha landing page.

## Now

**Relationships.** Make Character → Connection → Holding/Party/Tribe a coherent durable curation loop. Start by making Holding a real curation workspace and Tribe a real user-backed layer: remove mocked Tribe data, refresh Tribe styling to fit the current visual language, and allow private Characters to move durably among Holding, Party, and Tribe subject to existing capacity rules. Mutual Connection establishment comes after this foundation is usable.

## Next

1. **Relationships continued** — implement the approved mutual Connection flow and finish the durable relationship loop. Guilds remain a visible promise.
2. **Care** — make one complete aid/care path genuinely shared between real users.
3. **Posting** — let users write ordinary posts into Timeline with an appropriate audience/layer model.
4. **Signals** — follow at least one external federated source and bring real outside activity into Timeline, quiet and collapsed by default.
5. **Alpha coherence** — use the whole product end to end; remove remaining prototype fixtures; decompose oversized coordinators into single-responsibility components; separate global styling from component/feature styling; repair confusing seams. This is not a general hardening sprint.
6. **Front Door** — create a small landing page that explains Cloud Forest and provides the alpha entry path.

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
