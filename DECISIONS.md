# Decisions

This file records durable project and workflow decisions. Git history preserves
their detailed implementation context.

## Active product decisions

- **D-006 — Relational-depth language.** Cloud Forest uses Party, Tribe, Guilds,
  and Signals from closest to broadest relational depth.
- **D-010 — Community, not engagement.** Product behavior should cultivate
  relationships and community without optimizing for attention, entertainment,
  undifferentiated engagement, or time in the app.
- **D-011 — Canonical layer limits.** Party has 5 relationship slots, Tribe 100
  people, Guilds 5 groups, and Signals 10 sources. A separate user tile may
  appear in Party without consuming a relationship slot.
- **D-012 — User-controlled and interoperable data.** Prefer local curation and
  user-controlled or federated sources over central ownership. Storage, sync,
  hosting, and federation choices wait for concrete requirements.
- **D-013 — Performance and legibility are foundational.** Code remains direct
  and human-readable, while responsive and smooth interaction is treated as a
  product requirement.
- **D-014 — Curator uses galleries.** Curator presents four full-viewport,
  vertically snapping galleries; Tribe alone has horizontal neighborhood pages.
  Tiles open a shared destination until layer-specific actions are defined.
- **D-017 — Local-first is a client experience.** Private curation, journals,
  cached reads, and drafts should remain useful locally, while the trusted
  service remains authoritative for shared social data. End-to-end encryption is
  deferred.
- **D-018 — Architecture follows measured milestone gates.** Delivery proceeds
  through environment/design, personal loop, network loop, trusted testing,
  optional federation proof, and hardening, with capacity reserved for rework
  and recovery.
- **D-019 — Timeline defines the visual grammar.** The approved Timeline
  direction and `docs/design-guide.md` govern later screens without forcing
  Timeline-specific anatomy onto other workflows.
- **D-028 — Timeline and Curator are the active views.** Galaxy is removed and
  not replaced. Any additional view requires its own concrete product need and
  approved task.

## Active engineering and workflow decisions

- **D-001 — Use explicit, incremental work modes.** The product owner invokes
  one mode from `docs/workflow.md`; each backlog item keeps its own branch and
  pull request, and larger goals are split before implementation.
- **D-002 — Repo-local context is authoritative.** Durable context belongs in
  repository documentation rather than only in chats, memories, or external
  task managers.
- **D-003 — Dependencies require human approval.** Ask before adding packages,
  services, frameworks, or integrations.
- **D-004 — This repository is Cloud Forest.** Current documentation and naming
  describe Cloud Forest rather than inherited project language.
- **D-005 — Review follows the selected mode.** Paired modes require product-owner
  code approval before commit and leave publication and merge to the owner.
  Explicitly bounded autonomous sessions may publish and merge through their
  authorized PR/review loop. Git history remains the safety rail, and the human
  remains final product authority.
- **D-007 — Use the approved TypeScript web stack.** The web application uses
  React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- **D-008 — Add infrastructure only for a clear need.** Prefer the simplest local
  implementation first; authentication, persistence, integrations, and other
  systems enter through concrete product requirements.
- **D-015 — Development is native Windows first.** The supported baseline is the
  Windows filesystem, PowerShell, Windows-native Codex, Node.js 22.23.2, pnpm
  11.1.2, and Docker Desktop with PowerShell-safe commands.
- **D-016 — Use a TypeScript modular monolith.** The production seed is a pnpm
  monorepo with a React PWA, Fastify API, reserved worker, shared packages, and
  PostgreSQL/Drizzle. Durable jobs use PostgreSQL rather than Redis or
  microservices.
- **D-021 — Recovery is explicit and evidence-led.** Cleanup is allowlisted,
  dependency rebuilding requires confirmation, protected state is preserved,
  and environment failures are classified before escalation or deferral.
- **D-022 — Database changes use reviewed SQL.** `packages/database` is
  server-only; Drizzle schema changes produce reviewed forward SQL. Direct push,
  automatic rollback/reset, and unconfirmed destructive test actions are not
  supported.
- **D-023 — OpenAPI owns transport types.** Registered Fastify TypeBox schemas
  deterministically generate committed OpenAPI and client types. The curated
  browser-safe client validates responses and never imports server or database
  implementation.
- **D-024 — Database commands name and guard their target.** Normal commands use
  `DATABASE_URL`; disposable integration and E2E commands require a distinct
  local `TEST_DATABASE_URL` and never automatically drop, reset, or truncate it.
- **D-025 — Tracked text is LF.** `.gitattributes` is authoritative, Prettier
  agrees with it, binary assets are excluded, and generated API artifacts retain
  strict byte-for-byte checks across platforms.
- **D-026 — Browser API traffic is same-origin.** Web clients use versioned
  `/api` paths; local Vite and deployed ingress proxy those paths to Fastify.
- **D-027 — The local regression gate uses pinned Chromium.** One guarded,
  deterministic desktop/mobile Playwright path owns service lifecycle, protects
  normal data, verifies Timeline and Curator, and keeps visual-baseline updates
  explicit and human-reviewed.
- **D-029 — Use unified pre-1.0 product versions.** Every workspace manifest
  shares one version. Accepted milestones increment `0.MINOR.0`; compatible fixes
  increment `0.MINOR.PATCH`. The trusted-tester alpha remains pre-1.0, and an
  annotated `vX.Y.Z` tag is created only after the release commit reaches
  `main`.
- **D-030 — Receiver gratitude publishes at the receiver's completion.** When a
  receiver marks claimed care completed, their gratitude is saved immediately;
  an optional Tribe post is also published immediately without waiting for the
  giver's completion decision. Private participant histories retain receiver
  and giver provenance even when the Tribe-facing post uses “A neighbor.” The
  care request itself remains active until the existing two-party completion
  rule closes it.
- **D-031 — The accepted care lifecycle remains a device-local simulation.**
  Receive-care visibility, passing, claims, outcomes, private history, and
  gratitude define the accepted interaction and privacy model, but their
  `localStorage` records and fictional perspective switcher are neither shared
  authority nor security controls. Production identity, authorization,
  concurrency, persistence, synchronization, and recovery require explicit
  later slices. Only the existing PostgreSQL-backed Timeline-item read is an
  authoritative server path today.
- **D-032 — Durable conversion starts with invited identity, Party, and
  profiles.** The first tranche completed DCP-01 through DCP-06 as T-034
  through T-041 with invited-session and Party-state UX checkpoints, then
  closed with the accepted mutual-connection QR-handshake prototype in T-042.
  The initial pilot maps one invited account to one user while private curated
  Persons remain owner-controlled and may be linked only through a separately
  approved durable mutual-connection protocol. Portrait upload remains deferred;
  minimum authoritative Tribe membership precedes durable care without making
  visual neighborhoods authoritative; fictional browser care records are test
  data and will not be imported. Better Auth with invite-only magic links
  remains the preferred authentication direction despite the product owner's
  dislike of magic links, subject to separate dependency approval. Local and
  test invitations precede any production email provider.
- **D-033 — Alternate durable construction with explicit UX review.** Place
  rapid, annotated desktop and mobile UX checkpoints before implementing major
  identity, relationship, care-transition, and recovery boundaries. When an
  approved task naturally touches a growing coordinator, stylesheet, or test
  suite, extract one cohesive responsibility when it makes that task clearer;
  do not turn incremental stewardship into unrelated or line-count-driven
  refactoring.
- **D-034 — Authorization is trusted, object-specific, and field-specific.**
  The trusted service resolves the current person from the authenticated
  account instead of accepting a caller-supplied actor identity. Party remains
  private, directed, and owner-only; current relationship state constrains
  audience visibility; removed and blocked relationships are explicit denied
  cases; and private care history and provenance use separate projections from
  Tribe activity. Client filtering, selectors, hidden controls, browser
  storage, and the fictional perspective switcher are not authorization. The
  complete rules and deferred questions are recorded in
  `docs/authorization-and-privacy-matrix.md`.
- **D-035 — Durable Care uses current Connections and a dynamic layer.** Only a
  mutually connected User in the Care's current Party or Tribe layer may
  participate. Durable Care does not freeze a publication-time membership
  audience: current layer, passes, blocks, revocations, and lifecycle state are
  re-evaluated for each operation. Party and Tribe are exclusive rather than
  cumulative; exhausted Party Care demotes once unless the originator starts a
  fresh Party round. Breaking or blocking a Connection outranks claimed-Care
  participation and closes claimed Care as orphaned. The complete T-043 policy
  is recorded in `docs/durable-care-audience-policy.md`.
- **D-036 — Durable mutual Connections require symmetric consent and private
  Character resolution.** A single-purpose pairing token expires after 15
  minutes and carries no private Character data. The authenticated receiver
  explicitly chooses or creates their own Character, either participant may
  confirm first, and only the second valid confirmation atomically makes the
  Connection and both server-owned `linkedUserId` results authoritative. The
  protocol has neutral outcomes for replay, expiry, cancellation, blocking,
  supersession, wrong-account use, duplicate scans, stale confirmation, and
  concurrent completion. Breaking is immediate; preserved Characters may
  reconnect without reactivating prior Care, and rebinding never transfers
  shared Care history. The full T-046 decision is recorded in
  `docs/durable-mutual-connection-protocol.md`.

## Fulfilled milestone decisions

- **D-020 — The first database slice starts with Timeline.** Fulfilled by the
  read-only PostgreSQL-to-React Timeline item. Other Timeline cards remain
  mocked, and IndexedDB and durable jobs remain demand-triggered follow-ups.

## Superseded decisions

- **D-009 — Curator, Timeline, and Galaxy are separate views.** Superseded by
  D-028 when the dormant Galaxy experiment was removed.
