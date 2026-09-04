# Project Brief

## Project name

Cloud Forest

## Product vision

Cloud Forest is a community-building application for people who find value in
social media but also see how attention-driven platforms can isolate, overwhelm,
and radicalize. It is for people who long for community but do not know how to
build or tend one for themselves.

Cloud Forest helps a person deliberately curate a smaller social world. It
starts from the belief that relationship quality matters more than quantity and
that not everything matters the same. Choice should create clarity and calm.

The aim is not merely to connect people, entertain them, or maximize engagement.
The aim is to help people cultivate acceptance, belonging, esteem, safety, and
security through actual community.

## Product metaphor

A tree in a forest does not live only for itself. It cooperates with what it
touches. Cloud Forest uses that metaphor to help people remember how to form
communities in which people support one another and participate in something
larger than themselves.

## Intended users

The primary users are people who:

- use social media and receive some benefit from it
- recognize the harms of large, attention-driven social networks
- want deeper relationships and stronger community
- need a practical way to decide where their relational attention belongs

The repository also serves the product owner, coding agents working under human
supervision, and future contributors evaluating or extending the product.

## Relationship model

Cloud Forest organizes a person's social world by relational depth. Each layer
is deliberately bounded, drawing loosely on the idea behind Dunbar's number.

- **Party — 5 people:** the crew or squad who can be relied on in a crisis and
  who would rely on the user in return.
- **Tribe — 100 people:** the user's other important person-to-person
  relationships, including family and friends. Party members are the deepest
  relationships within this broader personal network.
- **Guilds — 5 groups:** professional, hobby, personal, advocacy, charity, or
  other communities in which the user learns, grows, contributes, or organizes.
- **Signals — 10 sources:** celebrities, corporations, public officials, brands,
  or other strangers and institutions the user intentionally chooses to follow.

Party and Tribe relationships should generally favor people who are physically
near enough to participate in mutual aid and everyday life. Guilds may be local
or distributed. Signals are usually non-local.

These limits are product constraints, not engagement targets. They make
selection meaningful and protect attention for the relationships that matter
most.

## Views

### Curator

Curator is where the user selects, understands, and manages the people, groups,
and sources in each layer of their community.

### Timeline

Timeline presents messages and activity from the layers in a way that makes
their relative importance tangible. Content from every layer should not compete
for attention on equal terms.

## Product principles

- Quality matters more than quantity in personal relationships.
- Not everything matters the same.
- Choice should produce clarity and calm.
- Facilitate community; do not optimize for attention or engagement.
- Prefer relationships capable of mutual care over merely semantic connection.
- Help users own and control their curation choices and relationship data.
- Prefer interoperable and federated interfaces over owning the underlying data
  stream.
- Keep interactions fast, smooth, and respectful of the user's attention.

## Data posture

Cloud Forest should be capable of local, on-device curation and should be able
to work with user-controlled sources such as device contacts. Where practical,
it should retrieve or connect to data rather than become the permanent owner of
the user's social data.

This is a direction, not yet a storage architecture. Offline behavior, sync,
hosting, federation protocols, and the division between local and remote data
will be decided when concrete product requirements make the tradeoffs clear.

## Current prototype scope

The current prototype runs in a pnpm TypeScript monorepo. `apps/web` is an
installable React PWA with separate Curator and Timeline views, and `apps/api`
is a versioned Fastify service backed by PostgreSQL through reviewed Drizzle SQL
migrations. Shared domain and runtime-validated contract packages generate a
committed OpenAPI document and transport-only typed client.

Curator presents all four relationship layers at the canonical 5/100/5/10
limits through responsive mock-backed gallery interactions. Timeline carries
the approved visual grammar, with relational layers encoded through card
borders, identity, and marks rather than engagement metrics. Its first fictional
item is read from PostgreSQL through the API and typed client; the other seven
visible cards remain intentionally mocked for later incremental product slices.

The design gate and monorepo-foundation milestone are complete. The accepted
fictional Receive-care lifecycle covers request lifespan, passing, claims,
participant outcomes, private history, and optional Tribe gratitude. These care
records remain a device-local simulation; the perspective switcher is not an
identity boundary. The guarded local Chromium gate verifies the database-backed
Timeline read and representative Timeline, Curator, and care behavior at desktop
and mobile sizes. `docs/care-lifecycle-prototype.md` records the exact accepted
behavior and deferred production boundaries.

## Out of scope for the current prototype

- authentication
- analytics or attention tracking
- production hosting and external-service integrations
- a final persistence or synchronization architecture
- cross-device synchronization and background job processing
- real client, patient, or other sensitive data
- engagement mechanics intended primarily to increase time in the app

## Success criteria

Cloud Forest succeeds at this stage when:

- Curator makes the four bounded layers understandable and manageable
- the interface communicates relational priority without producing attention
  pressure
- Timeline preserves the relative importance of the layers
- interactions feel responsive, smooth, calm, and accessible
- the code is clean, human-legible, tested, and ready for serious iteration
- project documentation, decisions, backlog, and implementation remain visibly
  aligned
