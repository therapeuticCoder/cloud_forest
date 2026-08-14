# Codex App Workflow

This repository uses a supervised workflow centered on the Codex desktop app.
The human remains the product owner, reviewer, and final authority. Codex helps
inspect the repository, plan work, implement focused changes, run checks, and
prepare a clear handoff.

`AGENTS.md` contains the concise instructions that apply automatically during
repository work. This document explains the fuller operating process. When the
two conflict, stop and ask the human to resolve the conflict.

## Standard task loop

1. Choose one task from `BACKLOG.md`, or define one comparably scoped task in the
   conversation.
2. Codex reads `AGENTS.md`, `README.md`, `BACKLOG.md`, and `DECISIONS.md`, then
   inspects the relevant implementation and current Git status.
3. Codex states the task, likely files, and assumptions before editing.
4. For work with meaningful product or architectural choices, Codex proposes a
   short plan and resolves those choices with the human.
5. Codex implements only the agreed scope and shares concise progress updates in
   the task.
6. Codex runs the relevant checks from `README.md` and inspects the final diff.
7. Codex summarizes what changed, checks run, failures or limitations, and any
   recommended follow-up.
8. The human reviews the diff and requests revisions or authorizes the Git
   actions needed to publish it.

## Starting a Codex task

A useful prompt names the outcome, scope, and important constraints without
prescribing every implementation detail:

```text
Complete T-XXX from BACKLOG.md.

Follow AGENTS.md and preserve existing behavior outside the task.
Inspect the current worktree before editing and do not overwrite unrelated
changes. Run the relevant checks and summarize the final diff.
```

For exploratory product work, ask Codex to interview the product owner or
produce a plan before editing. Once the decisions are clear, keep implementation
in the same task when the scope remains focused.

## Using plans and progress updates

A written plan is useful when a task spans several files, contains unknowns, or
requires a product decision. It should describe observable outcomes rather than
inflate a small task into ceremony.

During implementation, Codex should use commentary updates to surface:

- the active task and assumptions
- discoveries that materially affect scope
- checks currently being run
- blockers or decisions that require human authority

The final response must stand on its own and include the completed result and
verification status.

## Working safely in an existing worktree

Codex should inspect `git status` and relevant diffs before editing. Existing
changes belong to the human unless the task clearly establishes otherwise.

- Preserve unrelated changes.
- Avoid formatting or rewriting files outside the task.
- Do not discard, reset, stash, or overwrite human work without explicit
  approval.
- Call out overlapping changes before proceeding when they cannot be preserved
  safely.

## Task sizing

Good tasks are small, specific, observable, easy to review, and tied to
acceptance criteria. Split a task when it mixes distinct product outcomes or
would produce a diff too broad to understand confidently.

Planning, implementation, and verification may remain in one Codex task when
they serve one bounded outcome. Use separate Codex tasks or branches for
independent workstreams, not merely for each procedural step.

## Product and architecture decisions

Codex may make routine implementation choices inside an approved task. It must
surface choices that change product behavior, add dependencies, establish a
lasting architecture, introduce an external service, or materially expand
scope.

Record durable decisions in `DECISIONS.md`. Record unfinished implementation
work in `BACKLOG.md`. Do not rely on conversation history as the only source of
project context.

## Checks and visual review

Run focused checks while iterating and `pnpm check` before handoff when
practical. For UI work, verification should also include the rendered result at
relevant viewport sizes, keyboard and focus behavior, console errors, and
obvious interaction or performance regressions.

If a check cannot run, report the exact reason rather than implying success.

## Git and review boundaries

Codex may inspect Git history and diffs as part of normal work. Staging,
committing, pushing, opening a pull request, merging, or otherwise publishing
changes should happen only when the human requests or authorizes that action.

Each implementation session starts from an up-to-date default branch with a
clean worktree and uses a new `codex/` feature branch. Do not implement directly
on the default branch. Publish every completed session through a pull request;
keep independent outcomes in separate branches and pull requests.

Before committing, review:

- whether the requested outcome and acceptance criteria are met
- whether unrelated behavior and human changes were preserved
- whether the code and documentation remain mutually consistent
- whether the diff is understandable and appropriately scoped
- which automated and visual checks passed or failed
- whether new durable decisions or follow-up tasks need to be recorded
