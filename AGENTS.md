# Agent Instructions

This repository is designed for supervised agentic development.

`AGENTS.md` contains concise repository rules. See `docs/workflow.md` for the
full Codex app operating workflow.

## Core rules

- Work one task at a time.
- Prefer small, reviewable changes.
- Read `README.md`, `BACKLOG.md`, and `DECISIONS.md` before making changes.
- Read `docs/design-guide.md` before changing user-facing UI or visual styles.
- Do not complete unrelated tasks.
- Do not add dependencies without asking.
- Do not delete large sections or restructure the project without asking.
- Preserve existing behavior unless the task explicitly changes it.
- Inspect `git status` and relevant diffs before editing. Preserve unrelated
  human changes already in the worktree.
- After editing, run the relevant checks listed in `README.md`.
- For reference-driven UI work, inspect the supplied references before editing,
  verify the rendered result in the browser at the relevant viewport sizes, and
  compare final screenshots directly with the references.
- Summarize what changed and what checks were run.

## Safety

Do not add secrets, credentials, analytics, tracking, network calls, production integrations, or production assets unless explicitly requested.

Do not use real client data, patient data, or other sensitive information in examples, tests, fixtures, screenshots, or documentation.

## Style

Favor clarity over cleverness.

Prefer:

- boring, legible structures
- names that explain intent
- small files with clear responsibilities
- explicit assumptions
- simple language in documentation

Avoid:

- broad rewrites
- unnecessary abstractions
- hidden behavior
- speculative features
- changes outside the requested scope

## Before editing

State:

- the task being completed
- the files likely to be changed
- any assumptions being made

## After editing

State:

- what changed
- what checks were run
- whether any checks failed
- any follow-up work you recommend

## Human authority

The human remains the product owner and reviewer.

If instructions conflict, ask for clarification instead of guessing.

Codex may make routine implementation choices within an approved task. Ask
before changing product behavior, adding dependencies, establishing a lasting
architecture, introducing an external service, or materially expanding scope.

## Product principles

- Human Forest facilitates real community; it does not optimize for attention,
  entertainment, or engagement.
- Relationship quality matters more than quantity, and not everything matters
  the same.
- The canonical layer limits are 5 Party relationships, 100 Tribe people, 5
  Guilds, and 10 Signals. A separate Party-view tile may represent the user
  without consuming a relationship slot.
- Prefer user-controlled, interoperable data flows over central ownership of
  social data. Do not invent a storage or federation architecture before the
  product requires one.

## React project rules

- Prefer accessible HTML and semantic structure.
- Keep components small and named by purpose.
- Use TypeScript types for component props.
- Keep code human-legible. Prefer descriptive names and straightforward control
  flow that can be read like a recipe.
- Use shadcn/ui components where they reduce complexity.
- Do not add routing, global state libraries, authentication, analytics, backend calls, or persistence unless requested.
- Do not add dependencies without human approval.
- Treat responsiveness and smooth interaction as product requirements. Avoid
  unnecessary rendering, data work, and architectural complexity.
- Run `pnpm check` after code changes when practical.
- Treat an implemented visual direction as provisional until the human approves
  the browser-reviewed result and its reusable design guidance is recorded.
