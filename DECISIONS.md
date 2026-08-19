# Decisions

This file records important project and workflow decisions.

## D-001: Work happens through small agent tasks

Agents should complete one clear task at a time. Larger goals should be split into small backlog items before implementation.

## D-002: Repo-local context is the source of truth

Important project context should live in this repository, not only in chat history, memory, or external task managers.

## D-003: Dependencies require human approval

Agents should ask before adding new packages, services, frameworks, or integrations.

## D-004: This repository is now Human Forest

This repository is the Human Forest prototype, and project documentation should describe the Human Forest product direction rather than inherited project language.

## D-005: Human review is required

Agent changes should be reviewed before they are committed. Git history is the safety rail.

## D-006: Human Forest uses relational-depth language

The product organizes relationships by relational depth. The innermost layer should be called Party, followed by Tribe, Guilds, and Signals.

## D-007: Use React, TypeScript, Vite, Tailwind, and shadcn/ui

Human Forest uses a lightweight front-end stack intended for small, polished, agent-friendly web applications.

## D-008: Prefer simple local front-end apps first

Child projects should avoid auth, databases, analytics, and backend services until there is a clear need.

## D-009: Curator, Timeline, and Galaxy are separate views

Curator, Timeline, and Galaxy should not be treated as side-by-side panes. The active prototype should make Timeline and Curator switchable as separate views. Galaxy may remain in the codebase where reasonable, but it is not the current polish priority.

## D-010: Human Forest facilitates community, not engagement

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

Human Forest should support local, on-device curation and prefer retrieving or
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
the visual foundation for Human Forest. The durable principles, semantic tokens,
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
