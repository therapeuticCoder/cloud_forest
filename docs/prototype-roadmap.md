# Product Roadmap

Cloud Forest is moving from a visual prototype toward a production-seed alpha
for at most 100 trusted testers. Delivery stays incremental and preserves a
working, reviewable product between slices. `BACKLOG.md` is the source of truth
for active tasks; `docs/durable-product-conversion-program.md` records the
dependency order beyond the active tranche.

## Milestone sequence

1. **Environment and design — complete:** native Windows workflow, approved
   visual grammar, monorepo, PWA, API/database boundary, and browser gate.
2. **Durable identity and Party — tranche 1 complete:** invited identity,
   trusted current user, private curated-Person/Party persistence and APIs, and
   the accepted mutual-connection handshake prototype. Durable identity linking
   remains an explicit prerequisite rather than an implicit Party edit.
3. **Durable care — proposed next:** durable identity linking, authoritative
   Tribe eligibility, care requests/offers, and reload-safe reads.
4. **Transactional lifecycle:** atomic claim/pass/outcome/retry/gratitude and an
   authorized Timeline projection.
5. **Recovery and trusted testing:** measured caching, offline/reconnect states,
   backup/restore, deletion, security/accessibility review, and mock retirement.
6. **Optional expansion:** federation proof, Guilds, Signals, notifications, and
   other systems only after concrete requirements and stable earlier gates.

## Architecture direction

Use the existing TypeScript modular monolith: React PWA, Fastify API, shared
domain/contracts, PostgreSQL/Drizzle, generated OpenAPI, and typed client.
Better Auth with invite-only magic links remains the preferred authentication
candidate but requires dependency approval. Begin with deterministic local/test
invitations; production email is separate.

Introduce IndexedDB/Dexie only for a measured account-scoped cache, draft, or
offline need. Introduce PostgreSQL-backed jobs only for an approved asynchronous
behavior. Do not add Redis or microservices by default. Render, managed
PostgreSQL, R2-compatible storage, and Resend remain proposed production
directions, not current authorization.

The server is authoritative for shared data and authorization. End-to-end
encryption is not an alpha requirement. Relationship and block state must be
rechecked for protected reads and writes. The trusted server may decrypt
authorized posts and private journals under that model.

## Product invariants

- Layer limits are Party 5, Tribe 100, Guilds 5, Signals 10.
- Following is directed and read-only; a mutual connection request becomes
  available after three days.
- No likes, reposts, follower counts, public graph lists, direct messages, or
  behavioral ranking.
- Personal audiences are public, Tribe, and Party. Tribe includes connected
  Party and Tribe members; replies inherit the parent audience.
- Timeline ratios remain Close `6:3:2:1`, Balanced `4:3:2:1`, Broad `3:3:2:2`.
- Tending journals are private, manually authored, dated relational reflections
  with an optional content link, reminder, and moment category.
- Guilds allow at most 100 members and five leaders; members post as themselves
  and leaders may also publish with the Guild voice.
- Blocking is required before trusted alpha; reporting/moderation follow later.
- User-facing deletion hides immediately and targets purge after 30 days when
  durable retention is implemented.

## UX gates

The approved Timeline direction governs later work through
`docs/design-guide.md`, but screens keep their own interaction model. Before a
major durable boundary, review representative desktop/mobile states—including
failure and recovery—through the iterative UI/UX workflow. References stay
uncommitted unless their storage rights are clear; preserve derived principles
and original Cloud Forest artifacts.
