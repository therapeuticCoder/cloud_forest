# Working Prototype Roadmap

Human Forest is moving from a front-end visual prototype toward a portable,
production-seed alpha for at most 100 trusted testers. Work remains incremental:
one reviewable backlog task per Codex session, with a working demonstration every
two or three days and a weekly reforecast based on accepted outcomes and rework.

## Eight-week sequence

1. **Environment and design:** verify the Windows/Codex workflow, calibrate the
   visual direction, and establish the monorepo boundaries.
2. **Personal loop:** make Curator, tending journal, reminders, drafts, export,
   and deterministic Timeline behavior durable and local-first.
3. **Network loop:** add invited identities, following, connections, private
   layers, audience-authorized posts and replies, Guilds, blocking, and essential
   notifications.
4. **Trusted testing:** admit testers only after the complete network acceptance
   gate passes.
5. **Federation proof:** if the network is stable, ingest read-only ActivityPub
   Signals behind a feature flag.
6. **Hardening:** reserve final capacity for tester feedback, accessibility,
   security, backup restoration, deletion, failed jobs, and operational review.

ActivityPub is contingent on measured progress. Extra capacity improves the
current milestone before it expands scope.

## Architecture direction

- pnpm monorepo with a React PWA, Fastify API, background worker, shared API
  contracts, and domain packages
- TypeScript throughout, PostgreSQL with Drizzle and reviewed SQL migrations
- versioned JSON API with runtime validation, OpenAPI, and a typed client
- Better Auth with invite-only email magic links
- Dexie and IndexedDB for account-scoped cache, private offline mutations, and
  drafts
- PostgreSQL-backed durable jobs without Redis or microservices
- Render and managed PostgreSQL in a US region, Cloudflare R2 through an S3
  adapter, and Resend through a portable email adapter
- installable current-evergreen PWA, with local Docker services for development

The server may decrypt authorized posts and journals. End-to-end encryption is
not an alpha requirement. Authorization is enforced server-side and access to
relational posts is recalculated from current connection, layer, and block state.

## Product invariants

- Party has 5 exclusive private slots and Tribe has 100.
- Following is directed and read-only; a mutual connection request becomes
  available after three days.
- Personal post audiences are public, Tribe, and Party. Tribe includes connected
  Party and Tribe members; replies inherit the post audience.
- There are no likes, reposts, follower counts, public graph lists, direct
  messages, or behavioral ranking.
- Timeline uses fixed Party:Tribe:Guilds:Signals ratios: Close `6:3:2:1`, Balanced
  `4:3:2:1`, and Broad `3:3:2:2`.
- Tending journal entries are private, manually authored reflections with a date,
  optional content link and reminder, and a relational-moment category.
- Guilds contain at most 100 members and five total leaders; members post as
  themselves and leaders may publish with the Guild voice.
- Blocking is required for alpha. Reporting and moderation tooling follow later.
- Deleted user-facing records hide immediately and purge after 30 days.

## Design gate

Broad UI implementation waits for annotated references and anti-references from
the product owner. Codex will create three distinct static directions for one
representative screen, implement only the selected direction at mobile and
desktop widths, and record the approved visual grammar before applying it to
later stories.

Third-party reference screenshots remain uncommitted unless storage permission
is clear. The repository stores derived principles and original Human Forest
artifacts.
