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
- Give and Receive Care are durable between real users. Eligible Connections can see Care, the first eligible claimant wins, both participants share claimed state, each records completion independently, completed Care moves to private history, and private gratitude is durable.
- Care expiration is now durable product truth conceptually: an unclaimed Care may fall away neutrally when its audience is exhausted or its meaningful deadline passes. Party Care exhausts into Tribe before final expiration.
- Ordinary Timeline posting is currently in PR: real users can create durable Party/Tribe posts for eligible real Connections.
- A public alpha front door is being built separately from the application repository.
- Guilds remain a visible alpha promise rather than implemented collaboration functionality.
- One operator-configured ActivityPub source now imports a small durable batch
  of public posts into Timeline as Signals.

## Now

**Care continued.** Finish the remaining alpha Care lifecycle semantics that make the system feel humane rather than transactional: allow committed-but-unfinished Care to be withdrawn with an apology, support passing, Party-to-Tribe demotion, and neutral expiration, then define and implement the small alpha catalog of Care types and their tailored wizards/language.

In parallel, improve product legibility where work can stay isolated from Care lifecycle code, including clearer navigation/view switching and eventually stronger visual distinction between Posts and different Care types.

## Next

1. **Care types and presentation** — define the alpha Care catalog with Scott, implement the corresponding Give/Receive wizards and language, then make Care visually distinct by type and from ordinary Posts.
2. **Alpha coherence** — use the whole product end to end; remove remaining prototype fixtures; decompose oversized coordinators; reduce giant files; clarify feature ownership; separate global styling from feature styling; repair confusing seams.
3. **React Native preparation** — as part of coherence, leave domain, API, state, and feature boundaries cleaner and less web-entangled so a post-alpha React Native client refactor is easier. Do not begin the React Native migration during alpha.

## Known temporary debt

- `DashboardShell.tsx` owns too many unrelated responsibilities.
- `apps/web/src/index.css` is oversized and mixes global and localized styling.
- Large app-level tests have accumulated around prototype behavior.
- Disconnected review prototypes remain in source until their accepted behavior is safely represented in product code or durable product docs.
- Care presentation still needs type-specific language and visual identity.
- Guild presentation still depends on fictional fixture state.

## Definition of done for an alpha increment

An increment is done when its intended behavior works in the real application, the product owner has used and accepted the experience, no known defect blocks the next increment, and temporary scaffolding created for that increment is removed or intentionally retained.

Testing and verification are risk-driven and owned by the product owner. A story does not automatically require full-repository gates, E2E coverage, or documentation beyond updating durable product truth when a real product decision changed.

## 1.0-ALPHA exit

Cloud Forest is 1.0-ALPHA when invited testers can get in, curate meaningful relationships, connect mutually, exchange care, write Timeline posts, receive at least one real federated Signal, understand that Guilds are the coming collaboration layer, and experience the product as calm, bounded, and non-extractive.
