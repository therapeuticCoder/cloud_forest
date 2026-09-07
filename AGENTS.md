# Agent Instructions

Cloud Forest uses supervised agentic development. `docs/workflow.md` routes work
to the collaboration mode explicitly selected by the product owner.

## Invariants

- Work on one bounded task at a time, on a fresh `codex/` branch from current
  `main`. Preserve unrelated human changes and never rewrite or discard them.
- Before editing, inspect Git state and the active backlog item; read only the
  repository documents and code needed for that task. Read
  `docs/design-guide.md` before user-facing visual work.
- State the task, likely files, assumptions, exclusions, and verification plan.
  Wait for approval when the selected workflow or a material product or
  architecture choice requires it.
- Keep changes small and legible. Do not add dependencies, external services,
  production integrations, lasting architecture, or expanded product behavior
  without explicit approval.
- Do not add secrets, analytics, tracking, production assets, or real client,
  patient, or other sensitive data.
- Investigate environment, permission, dependency, and build failures when they
  appear. Resolve them narrowly or report the exact command, evidence, and
  recovery plan; never normalize or silently defer them.
- Verification discipline is non-negotiable: never enter a blind test-and-patch
  loop, never rerun a full gate without a named reason, and never claim success
  from partial output. Read and classify the latest failure, make one focused
  repair, and follow the owner’s instruction about whether checks may run. See
  `docs/development.md` and `docs/workflow.md` for the mandatory recovery rules.
- Follow the invoked workflow skill for responsibility boundaries around tests,
  previews, Git publication, review monitoring, merge, and cleanup.
- After work, report the diff scope, verification evidence, failures or limits,
  process state, and useful follow-up.

## Product and code boundaries

- The human remains product owner and reviewer. Ask before changing product
  behavior, dependencies, architecture, services, or scope.
- Cloud Forest facilitates community, not attention or engagement. Relationship
  quality matters more than quantity.
- Canonical limits are 5 Party relationships, 100 Tribe people, 5 Guilds, and
  10 Signals. A separate self tile does not consume a Party slot.
- Prefer user-controlled, interoperable data flows. Do not invent storage,
  synchronization, hosting, or federation architecture ahead of a requirement.
- Preserve existing behavior unless the task changes it. Favor semantic,
  accessible HTML; typed, purpose-named React components; straightforward
  control flow; responsive interaction; and existing shadcn/ui components when
  they reduce complexity.
- Do not introduce routing, global state, authentication, persistence, backend
  calls, or unrelated refactors unless the approved task requires them.
- Treat visual directions as provisional until the product owner approves the
  rendered desktop and mobile result and durable guidance is recorded.

If instructions conflict, stop and ask the product owner rather than guessing.
