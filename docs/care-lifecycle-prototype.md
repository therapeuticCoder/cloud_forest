# Receive-care lifecycle prototype

The accepted Receive-care lifecycle is a fictional, device-local product
prototype. It demonstrates the complete interaction and privacy model across a
requester, Party members, an eligible Tribe member, and the eventual giver. It
does not authenticate those people or coordinate their devices.

## Accepted behavior

1. A receiver publishes a meal request to a snapshot of their current Party and
   original Tribe audience. An unclaimed request expires at its `expiresAt`
   instant; the instant itself is expired.
2. Seen and minimized presentation is private to each viewer. A Party member may
   pass without affecting another member's view.
3. When every member in the request's Party snapshot has passed, the request is
   demoted to its original Tribe audience. Later relationship changes do not
   rewrite that snapshot in this prototype.
4. The first eligible claim wins. After a claim, only the requester and giver
   can see the active request; unrelated Party and Tribe viewers cannot.
5. Either participant may mark care Completed. The request remains active until
   both do. Either participant may instead mark Not completed, record a private
   reason, and close the request or create a linked retry request.
6. When the receiver marks Completed, they choose a meal-specific gratitude and
   may add their own words. The gratitude is saved immediately to both
   participants' private histories. If the receiver opts into a Tribe post, it
   is also published immediately, without waiting for the giver's decision.
7. A Tribe gratitude may render the receiver as “A neighbor.” That public-facing
   choice never removes receiver or giver provenance from participant history.

Terminal lifecycle history and gratitude history are visible only when the
profile owner is also the current fictional viewer. Reasons for Not completed
remain private and are not rendered in Timeline activity.

## Current sources of truth

| Behavior or record                                                                              | Prototype source of truth                                | Lifetime and authority                                        |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Seeded incoming request and people                                                              | TypeScript mock fixtures                                 | Recreated from the application bundle; fictional              |
| Newly composed Receive requests                                                                 | React lifecycle state                                    | Current page session only                                     |
| Give offers                                                                                     | React component state                                    | Current page session only                                     |
| Claims, passes, seen state, completion decisions, dispositions, terminal history, and gratitude | `localStorage` envelope `cloud-forest:care-lifecycle:v2` | One browser profile; device-local simulation                  |
| Legacy incoming claim                                                                           | Migrated from `cloud-forest:care-claims:v1`              | One-time compatibility path into the v2 simulation            |
| Perspective selection                                                                           | React component state                                    | Review harness only; not an account or authorization boundary |
| Mira's first ordinary Timeline item                                                             | PostgreSQL through the versioned API and typed client    | Authoritative only for that narrow read path                  |
| Other ordinary Timeline items                                                                   | TypeScript mock fixtures                                 | Fictional                                                     |

The v2 storage envelope deliberately omits request bodies. Persisted lifecycle
records are useful only while their referenced fixture request still exists.
Malformed, incomplete, or future-version envelopes are preserved byte-for-byte
and ignored rather than rewritten.

## Privacy and security boundary

Selectors and rendered views demonstrate the intended visibility rules, but
they are not security controls. The perspective switcher can impersonate every
fictional participant because it exists solely for product review. Browser
storage is not encrypted, account-scoped, synchronized, conflict-safe, or
protected from another script running in the same origin.

No real care, client, patient, or other sensitive information belongs in this
prototype. Production work must enforce identity, authorization, audience
membership, transition validity, and private-history access on a trusted
service boundary.

## Verification contract

Focused unit and component tests cover request validation, the expiration
boundary, per-viewer seen state, Party-pass quorum and Tribe demotion, claim
visibility, two-party completion, Not-completed close and retry paths, private
history, gratitude anonymity and publication timing, storage migration, and
reload behavior.

The guarded Chromium path exercises representative requester and giver states
at desktop and mobile sizes. It checks focus recovery, reduced-motion
emulation, Timeline scroll preservation across a nested destination, horizontal
overflow, service-worker cleanup, API responses, console and page errors, and
reviewed screenshots. See `README.md` and `docs/development.md` for commands and
the Windows process-control requirement.

## Deferred production boundaries

The accepted prototype does not choose or implement:

- authentication, invitations, accounts, or server-side authorization
- durable request, offer, lifecycle, gratitude, or private-history schemas
- API contracts for lifecycle reads or writes
- concurrency, idempotency, or first-claim transaction guarantees
- cross-device synchronization, cache invalidation, or offline mutation replay
- notification, job, moderation, retention, backup, deletion, or recovery flows
- real-world data migration from this browser-storage envelope

Those boundaries require small, dependency-ordered product slices. They must
not be inferred from the prototype's React or `localStorage` implementation.
