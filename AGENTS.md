# Agent Instructions

Cloud Forest is being built as a small trusted-tester alpha. Work with the product owner on one explicit increment at a time.

## Always

- Stay inside the assigned story. Do not pursue cleanup, hardening, refactors, edge cases, documentation, or adjacent features unless they are required for the story or the product owner asks.
- If a product, UX, dependency, architecture, privacy, or destructive-operation decision is missing, stop and ask instead of inventing it.
- Do not run tests, builds, lint, typecheck, E2E, or other verification unless the product owner explicitly asks you to. Verification belongs to the product owner.
- Do not retry a command that failed because of a known permission boundary. Ask once for the narrow permission/elevation required.
- Read only the code and documentation relevant to the current story. A skill may be read once per conversation; do not repeatedly reload it.
- Keep changes small and legible. Preserve unrelated human work.
- Ask before adding dependencies, external services, production integrations, or materially changing product behavior.
- Never add real client, patient, or other sensitive data, secrets, analytics, tracking, or engagement mechanics.

## Product boundaries

- The product owner is the final product and design authority.
- Cloud Forest exists to help people tend relationships, exchange care, cooperate, and retain control of their attention.
- Party is capped at 5, Tribe at 100, Guilds at 5, and Signals at 10.
- Characters are private curation. Connections require mutual consent. Private Character data never becomes shared merely because a Connection exists.
- Prefer straightforward React/TypeScript and existing project patterns. Do not introduce generalized architecture ahead of a demonstrated need.

## Stewardship

Temporary prototype code should become working product code or be deleted. Git history is sufficient historical storage.

When a real alpha story touches an oversized coordinator, test file, or stylesheet, make a cohesive extraction if it directly simplifies that story. Do not start standalone cleanup projects unless the product owner asks.

Durable product decisions belong in the smallest relevant file under `docs/`. Implementation history belongs in Git, not new documentation.
