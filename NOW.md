# Cloud Forest 1.0-ALPHA

## Goal

A coherent trusted-tester alpha for fewer than 100 people: private relationship curation, mutual Connections, practical Care, ordinary Timeline posts, and control over attention.

## Current product state

- Invited signup, username/password authentication, sessions, and account-to-person mapping are durable.
- Private Characters live in Holding, Party, or Tribe. Mutual Connections, pairing by QR/link, relationship exit, blocking, and unblocking are durable. Pairing intent survives login and invited signup.
- The PWA supports bounded cached reads for session, Curator, and existing Timeline state. Shared mutations require the server.
- Ordinary Party/Tribe Timeline posts are durable.
- Give and Receive use one Care record, shared alpha catalog, and creation wizard. The catalog covers transportation, food, pet care, child care, urgent shelter, help at home, executive function support, and getting out of the house.
- Care supports private passing, claiming, independent completion, private gratitude, Party-to-Tribe audience demotion, expiration, and compassionate withdrawal. Current Connection and placement remain authoritative for shared access.
- Approved Care leaf presentation distinguishes Care from ordinary Timeline posts. Detail navigation, mobile behavior, and accessible action labels remain part of that design.
- Guilds remain a visible placeholder. Signals and ActivityPub are outside alpha; experimental federation work is not merged into this branch.
- The public front door is maintained in a separate repository.

## Coherence and ownership

- `apps/web/src/app` composes authenticated navigation and feature workflows.
- `apps/web/src/features` separates Care, Curator, Timeline, and pairing. Authentication forms remain separate from session/cache policy in `components/auth`.
- Care role and active-status rules, catalog, expiration durations, and persisted statement identities belong to `packages/domain`. UI projections consume already-authorized records; they never grant access.
- Timeline fetching/caching, post composition, and rendering have separate modules. Browser storage and PWA code remain explicit web-only boundaries.
- Global tokens/base rules and feature styles are separate, with their cascade order retained in `index.css`.
- Disconnected review prototypes, obsolete private-Character-to-public-Person adapters, and unused federation-shaped client models have been removed.

## Next

Use the existing alpha together with invited testers. Prioritize defects that interrupt signup, connection, curation, posting, or exchanging Care. Do not add another feature tranche before that feedback.

React Native / Expo remains a post-alpha direction. No native migration or speculative portability framework is part of this pass.

Before release, bring the existing browser suite up to the current alpha contracts. Its Character-update setup omits required first/last names and receives HTTP 400 on both desktop and mobile, before reaching visual assertions. The full check and database integration tests pass; the approved Care visuals still need a working browser comparison and product-owner review.

## Deliberately retained boundaries

- Database Care and Connection repositories retain their transaction, locking, current-access, and private-history boundaries.
- Persisted gratitude/apology IDs retain their historical `meal-` prefixes. Existing statement copy is preserved; broader category-specific wording remains a product decision.
- Seeded fictional accounts, portrait mappings, and browser fixtures still support development and verification. They are separate from the removed disconnected review prototypes.
- Browser history/focus recovery, pairing intent storage, and cache upgrade/purge paths remain web-specific. They protect existing installed-client behavior.

## 1.0-ALPHA exit

Invited testers can get in, curate private Characters, connect mutually, exchange Care, write Timeline posts, understand Guilds as future cooperation, and experience the product as calm and bounded. Signals are not an alpha release requirement.

Product-owner acceptance of the real experience remains the release gate. Automated verification is risk-driven and may be delegated explicitly, as it is for this coherence pass.
