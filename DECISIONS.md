# Decisions

This file records important project and workflow decisions.

## D-001: Work happens through small agent tasks

Agents should complete one clear task at a time. Larger goals should be split into small backlog items before implementation.

## D-002: Repo-local context is the source of truth

Important project context should live in this repository, not only in chat history, memory, or external task managers.

## D-003: Dependencies require human approval

Agents should ask before adding new packages, services, frameworks, or integrations.

## D-004: This repository is now Cloud Forest

This repository is the Cloud Forest prototype, and project documentation should describe the Cloud Forest product direction rather than inherited project language.

## D-005: Human review is required

Agent changes should be reviewed before they are committed. Git history is the safety rail.

## D-006: Cloud Forest uses relational-depth language

The product organizes relationships by relational depth. The innermost layer should be called Party, followed by Tribe, Guilds, and Signals.

## D-007: Use React, TypeScript, Vite, Tailwind, and shadcn/ui

Cloud Forest uses a lightweight front-end stack intended for small, polished, agent-friendly web applications.

## D-008: Prefer simple local front-end apps first

Child projects should avoid auth, databases, analytics, and backend services until there is a clear need.

## D-009: Curator, Timeline, and Galaxy are separate views

Curator, Timeline, and Galaxy should not be treated as side-by-side panes. The active prototype should make Timeline and Curator switchable as separate views. Galaxy may remain in the codebase where reasonable, but it is not the current polish priority.

## D-010: Cloud Forest facilitates community, not engagement

The product should help people deliberately cultivate relationships and
community. It should not optimize for entertainment, time in app, undifferentiated
engagement, or attention capture. Not everything matters the same, and product
behavior should make relational priority tangible.

## D-011: Relationship layers have canonical limits

The current canonical limits are 5 Party relationships, 100 Tribe people, 5
Guilds, and 10 Signals. The Party gallery may also include a separate tile for
the user; that tile does not consume a relationship slot. The limits are
intentional product constraints inspired by relational capacity, not growth or
engagement targets.

## D-012: Prefer user-controlled and interoperable data

Cloud Forest should support local, on-device curation and prefer retrieving or
connecting to user-controlled data over becoming the central owner of a social
data stream. Federation and interoperability are product values. This decision
does not yet select an offline, synchronization, hosting, storage, or federation
architecture; those choices should wait for concrete requirements.

## D-013: Performance and legibility are foundation requirements

Code should be clean and human-legible, with descriptive names and
straightforward control flow. Responsive, smooth interactions are product
requirements and should inform architectural choices from the beginning.

## D-014: Curator uses a gallery interaction model

Curator presents each relationship layer as a full-viewport gallery of
media-ready tiles rather than cards, rows, or accordions. Tile scale decreases
with relational distance. The layers retain vertical scroll snap, while Tribe
alone retains horizontal neighborhood pagination. Selecting any tile opens a
shared full-screen destination; layer-specific detail interfaces are deferred
until their actions are defined.

## D-015: Development is native Windows first

The primary development environment uses the Windows filesystem, PowerShell,
the Windows-native Codex agent, Node.js 22.23.2, pnpm 11.1.2, and Docker
Desktop's WSL2 backend for Linux containers. Shared setup must work in clean
Codex worktrees and use PowerShell-safe commands.

## D-016: The prototype grows into a TypeScript modular monolith

The planned production seed is a pnpm monorepo containing a React PWA, Fastify
API, background worker, shared contracts, and domain packages. PostgreSQL is the
primary server datastore, Drizzle manages reviewed SQL migrations, and durable
jobs remain PostgreSQL-backed. Redis, microservices, and a second server language
are not initial requirements.

## D-017: Local-first is a client experience, not serverless social data

Private curation, journals, cached reads, and drafts should remain useful on the
device and synchronize across devices. The trusted service remains authoritative
for identities, connections, posts, replies, Guild membership, and delivery and
may decrypt authorized alpha content. End-to-end encryption is deferred.

## D-018: Product architecture follows measured milestone gates

The working prototype sequence is environment and design calibration, personal
loop, multi-user network loop, trusted testing, optional one-way ActivityPub
proof, and hardening. Federation proceeds only when the core network is stable.
Approximately 25 to 30 percent of the eight-week window is reserved for
integration, feedback, rework, accessibility, security, and recovery testing.

## D-019: Timeline establishes the approved visual grammar

The product owner approved the representative responsive Timeline direction as
the visual foundation for Cloud Forest. The durable principles, semantic tokens,
component patterns, responsive behavior, motion, accessibility expectations, and
anti-patterns are recorded in `docs/design-guide.md`. Future screens should reuse
that grammar without forcing Timeline-specific anatomy onto unrelated workflows.

## D-020: The first database-backed vertical slice starts with Timeline

The first thin client-to-database slice will load one read-only Timeline item
from PostgreSQL through the versioned Fastify API and generated typed client.
All other Timeline data remains mock-backed during that slice so the migration
stays small and the working prototype remains usable. IndexedDB caching and
durable background jobs are not required for this first slice and remain
separate follow-up boundaries unless a later approved requirement needs them.

## D-021: Environment recovery is explicit, bounded, and evidence-led

Routine setup uses the committed pnpm lockfile without purging a healthy
environment. Repository cleanup removes only an explicit allowlist of disposable
generated artifacts. Rebuilding dependencies requires an explicit confirmation
because it removes workspace `node_modules`; it does not remove the pnpm store,
Docker volumes, backups, environment files, source files, or user data.
Environment and build failures must be investigated and classified using their
observable behavior before an approval escalation or documented deferral.

## D-022: Database changes use a server-only reviewed SQL boundary

`packages/database` owns local PostgreSQL configuration, Drizzle schema code,
and database access. It may depend on the framework-neutral domain package, but
domain and API-contract packages do not contain database configuration. The
initial driver is `pg`, with Drizzle ORM as the typed SQL layer.

Schema changes are generated as human-readable SQL, reviewed with their Drizzle
metadata, committed, and applied forward. Direct schema push, automatic down
migrations, and automatic destructive reset are not supported. Migration apply
is repeatable, while migration status and schema inspection are read-only.
Database integration tests require an explicitly separate local disposable
database and fictional data; destructive reset always requires separate human
confirmation.

## D-023: OpenAPI is generated at the API boundary and narrows the client boundary

Registered Fastify TypeBox request and response schemas are the source for the
OpenAPI 3 document. The deterministic JSON document is committed under
`apps/api`, and `openapi-typescript` derives committed client types from it.
Generation contains no timestamp, workstation URL, or environment-dependent
metadata. Missing or stale generated artifacts fail the root check.

`packages/api-client` is a transport-only package with a curated public surface
for approved versioned operations. It uses the platform `fetch` implementation
and distinguishes typed success, documented HTTP errors, network failures, and
unexpected responses. Its transport types come from generated OpenAPI output
rather than parallel handwritten definitions. Existing API-contract validators
check response bodies before the client returns typed results. The package and
its web consumers must not import Fastify, API implementation code, Drizzle,
`pg`, or `packages/database`.

The v1 Timeline-item route accepts an injected resolver and defaults to its
typed not-found result. This establishes the API and client seam without
database access; T-018J owns the PostgreSQL-backed resolver and web integration.

## D-024: Root database commands name their target and E2E starts at an isolated boundary

Migration generation and artifact checking remain disconnected from database
execution. Normal apply, status, and inspection commands explicitly use
`DATABASE_URL`; their `:test` counterparts explicitly use the guarded
`TEST_DATABASE_URL`. Test preparation may create the named local test database
when absent but never drops, resets, truncates, or rolls it back automatically.

The root E2E command prepares, migrates, and inspects that disposable database
through the same root commands used by humans and Codex. Before T-018K, it does
not start the API, web app, browser, or persistent child processes. T-018K owns
the approved browser runner, product test, service lifecycle, signal forwarding,
and guaranteed child-process cleanup.

## D-025: The repository owns an LF text policy

Tracked text files use LF in the Git index and worktree on every supported
platform. `.gitattributes` is authoritative for checkout and commit
normalization, `.editorconfig` guides editors, and Prettier enforces LF for the
files it formats. Machine-level `core.autocrlf` settings must not override the
repository policy.

Generated OpenAPI and typed-client artifacts remain strict byte-for-byte drift
checks. Their generators emit LF, so native Windows checks use the same bytes as
Linux and clean Codex worktrees instead of weakening artifact validation.

Binary assets are explicitly marked binary and are never line-normalized.
