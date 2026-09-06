# Project Brief

Cloud Forest is a private relationship map and mutual-care application for
people who value parts of social media but are harmed or overwhelmed by
attention-driven networks. It helps a person deliberately tend a smaller social
world, based on the premise that relationship quality matters more than quantity
and that not everything matters equally.

The goal is real acceptance, belonging, esteem, safety, and mutual support—not
connection counts, entertainment, or engagement. Forest language supplies a
metaphor for cooperation and interdependence, not decorative styling.

## People and relationship layers

Primary users want deeper community and a practical way to decide where their
relational attention belongs. Cloud Forest organizes that world by bounded
relational depth:

- **Party — 5 people:** reciprocal crisis-level and everyday support.
- **Tribe — 100 people:** other important personal relationships; Party is the
  deepest subset conceptually, while membership records remain explicit.
- **Guilds — 5 groups:** communities for work, learning, contribution, hobbies,
  advocacy, or organizing.
- **Signals — 10 sources:** intentionally followed public people, institutions,
  brands, or topics.

Party and Tribe should favor relationships capable of practical mutual aid,
often including geographic proximity. Guilds may be distributed; Signals are
usually non-local. Limits make selection meaningful and protect attention; they
are never engagement targets. A Party self tile is separate from the five
relationship slots.

## Product surfaces

- **Curator** manages the people, groups, and sources in each layer.
- **Timeline** presents activity so relational importance remains tangible;
  every source must not compete equally for attention.

The interface should feel calm, responsive, accessible, and respectful. It
uses no likes, reposts, follower counts, behavioral ranking, or similar pressure
mechanics unless a separately approved requirement changes that boundary.

## Data posture

Users should control their curation and relationship data. Prefer local utility,
device-owned sources, portable adapters, and interoperable or federated
interfaces over central ownership. This is a direction, not permission to
invent storage, synchronization, hosting, or federation architecture before a
concrete requirement.

## Current product boundary

The TypeScript monorepo contains an installable React PWA, a versioned Fastify
API, PostgreSQL with reviewed Drizzle migrations, shared domain/contracts, a
generated OpenAPI document, and a browser-safe typed client.

Curator presents mock-backed 5/100/5/10 galleries. Timeline supplies the
approved visual grammar: layer borders, identities, and marks instead of
engagement metrics. One fictional item travels through PostgreSQL, API, client,
and React; remaining cards are deliberate mocks.

The accepted fictional Receive-care lifecycle demonstrates lifespan, audience,
passing, claims, participant outcomes, private history, and optional Tribe
gratitude. Its records are device-local and its perspective switcher is not
identity or authorization. Exact behavior lives in
`docs/care-lifecycle-prototype.md`; future enforcement rules live in
`docs/authorization-and-privacy-matrix.md`.

Current work excludes analytics, production hosting/integrations, real or
sensitive data, finalized sync/offline architecture, and engagement mechanics.
Authentication, persistence, jobs, and external services enter only through
approved backlog items.

Success means the four layers are understandable and manageable, relational
priority remains calm rather than competitive, care supports real community,
interactions work accessibly across desktop and mobile, and implementation,
decisions, backlog, and documentation stay aligned.
