# Cloud Forest 1.0-ALPHA

## Goal

Build a coherent trusted-tester alpha for fewer than 100 people. Alpha succeeds when people can use Cloud Forest together and clearly perceive its central ideas: meaningful relationship layers, low-friction mutual care, a social web that can cross platform boundaries, and an experience designed to help rather than capture attention.

## Current product state

- React PWA, Fastify API, PostgreSQL/Drizzle, Better Auth, signup codes, sessions, and account-to-person mapping exist.
- Username/password login, logout, invited signup, and multiple real users work.
- Private Character curation across Holding, Party, and Tribe is durable and user-backed.
- Mutual Connection establishment, relationship exit, blocking, and unblocking are durable.
- Pairing intent survives login and invited signup, so a pairing link can bring a new tester into Cloud Forest and return them to the pending Connection flow.
- The installed PWA has a bounded offline read path for session, Curator relationship data, and existing Timeline state. Server-dependent mutations remain unavailable offline.
- Give and Receive Care are durable between real users. Eligible Connections can see Care, pass privately, claim it, release a claim, record completion independently, retain private completion history, and exchange private gratitude.
- Care audience lifecycle is durable: Party Care can demote to Tribe when its audience is exhausted, passes follow the accepted layer semantics, and unclaimed Care expires neutrally when its audience is exhausted or its originator-chosen deadline passes.
- A participant in claimed Care may withdraw compassionately with an apology; the Care closes without returning to the audience and both participants retain the appropriate private history.
- Ordinary Timeline posting is durable: real users can create Party/Tribe posts for eligible real Connections.
- Shared Timeline/Curator navigation and active Curator layer/capacity presentation are in place.
- A public alpha front door is being built separately from the application repository.
- Guilds remain a visible alpha promise rather than implemented collaboration functionality.
- Signals remain unimplemented beyond presentation placeholders; no real ActivityPub/federated Signal exists yet.

## Now

**Care types and presentation.** Define the small alpha Care catalog with Scott, then adapt Give/Receive creation, language, and visual presentation so each Care type can ask for the information it actually needs without turning Care into a generalized form builder.

In parallel, work may proceed on **Signals** because the first real federated Signal is largely isolated from Care-type decisions. Keep this slice intentionally narrow: one real external public source flowing into Timeline as a quiet Signal is enough to satisfy the alpha promise before broader federation work.

## Next

1. **Care types and presentation** — define the alpha Care catalog with Scott, implement the corresponding Give/Receive wizard variations and language, then make Care visually distinct by type and from ordinary Posts.
2. **First real Signal** — follow one real external federated account/source, persist or retrieve its public updates through the server, and render them in Timeline as visually de-emphasized, collapsed-by-default Signal items. Do not generalize into a full federation platform yet.
3. **Alpha coherence** — use the whole product end to end; remove remaining prototype fixtures; decompose oversized coordinators; reduce giant files; clarify feature ownership; separate global styling from feature styling; repair confusing seams.
4. **React Native preparation** — as part of coherence, leave domain, API, state, and feature boundaries cleaner and less web-entangled so a post-alpha React Native client refactor is easier. Do not begin the React Native migration during alpha.

## Known temporary debt

- `DashboardShell.tsx` owns too many unrelated responsibilities.
- `apps/web/src/index.css` is oversized and mixes global and localized styling.
- Large app-level tests have accumulated around prototype behavior.
- Disconnected review prototypes remain in source until their accepted behavior is safely represented in product code or durable product docs.
- Care presentation still needs type-specific language and visual identity.
- Guild presentation still depends on placeholder behavior.
- Signals have only placeholder presentation; there is no durable external source model or real federated ingestion path yet.

## Definition of done for an alpha increment

An increment is done when its intended behavior works in the real application, the product owner has used and accepted the experience, no known defect blocks the next increment, and temporary scaffolding created for that increment is removed or intentionally retained.

Testing and verification are risk-driven and owned by the product owner. A story does not automatically require full-repository gates, E2E coverage, or documentation beyond updating durable product truth when a real product decision changed.

## 1.0-ALPHA exit

Cloud Forest is 1.0-ALPHA when invited testers can get in, curate meaningful relationships, connect mutually, exchange care, write Timeline posts, receive at least one real federated Signal, understand that Guilds are the coming collaboration layer, and experience the product as calm, bounded, and non-extractive.
