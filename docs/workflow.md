# Codex Work Modes

The product owner explicitly invokes one workflow skill at the start of each
Cloud Forest work session. `AGENTS.md` holds repository invariants; the selected
skill owns the session sequence and responsibility split.

| Mode               | Invoke                                     | Use when                                                                                                                |
| ------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Autonomous backlog | `$autonomous-agent-backlog-work-session`   | Codex is authorized to complete a bounded number or named range of backlog items, including checks and GitHub delivery. |
| Paired programming | `$paired-programming-backlog-work-session` | The product owner supervises one backlog item, runs checks, publishes the branch, monitors review, and merges.          |
| Iterative UI/UX    | `$iterative-ui-ux-work-session`            | One user-facing story needs a live annotated design loop before the paired verification and publication handoff.        |

Do not blend modes or infer broader authority from an invoked skill. Each mode
uses one task per branch and pull request, preserves unrelated work, and stops
for product, safety, ambiguity, scope, dependency, or destructive-operation
decisions outside its contract.

## Context routing

Always inspect live Git and backlog state. Read only the sources that affect the
selected task:

- `README.md` for project shape and command routing;
- `BACKLOG.md` for current task requirements and sequencing;
- `DECISIONS.md` for durable decisions touched by the task;
- `docs/project-brief.md` for product boundaries;
- `docs/design-guide.md` for user-facing visual work;
- `docs/care-lifecycle-prototype.md` for care behavior;
- `docs/authorization-and-privacy-matrix.md` for identity, relationship, care,
  or privacy enforcement;
- `docs/development.md` for the exact environment, verification, preview, or
  recovery operation being used.

Do not load frontend concept-generation instructions for a narrow repair unless
the product owner requests visual exploration or the task genuinely requires a
new visual direction. Batch compatible read-only checks and status queries.
During waits, report only meaningful state changes, decisions, failures, or
completion.

## Maintaining the workflows

When a session exposes a reusable process problem, resolve or plan it before
continuing. Once the product owner accepts the correction, update the relevant
mode skill—or its optional recovery reference—in the same session before the
workflow is considered closed. Keep project-specific commands in repository
documentation and avoid copying general policy between `AGENTS.md`, mode skills,
and backlog items.
