import { describe, expect, it } from "vitest";

import type {
  CareClaim,
  CareLifecycleState,
  ReceiveCareRequest,
} from "@/types/careRequest";

import {
  createCareLifecycleState,
  haveAllPartyMembersPassed,
  selectProfileCareRequests,
  selectTimelineCareRequests,
  transitionCareLifecycle,
  type CareLifecycleAction,
} from "./careLifecycle";

const beforeExpiry = "2026-09-03T12:00:00.000Z";
const afterExpiry = "2026-09-11T12:00:00.000Z";

function request(
  overrides: Partial<ReceiveCareRequest> = {},
): ReceiveCareRequest {
  return {
    id: "request-1",
    kind: "meal",
    direction: "receive",
    need: "A meal",
    helpfulWhen: "Thursday evening",
    foodWorks: "Soup or rice",
    foodDoesNotWork: "Nothing spicy",
    handoffStyle: "Leave it at my door",
    audience: "Party",
    audienceSnapshot: {
      partyMemberIds: ["you", "mira"],
      tribeMemberIds: ["ren", "kai"],
    },
    status: "open",
    createdAt: "2026-09-03T10:00:00.000Z",
    expiresAt: "2026-09-10T10:00:00.000Z",
    requester: { kind: "party", id: "anya", displayName: "Anya Reed" },
    ...overrides,
  };
}

function apply(
  state: CareLifecycleState,
  action: Parameters<typeof transitionCareLifecycle>[1],
) {
  const result = transitionCareLifecycle(state, action);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function claim(requestId = "request-1", claimerId = "you"): CareClaim {
  return {
    id: `claim-${requestId}`,
    requestId,
    claimerId,
    claimedAt: beforeExpiry,
  };
}

describe("Receive-care lifecycle", () => {
  it("publishes only valid unique requests with a snapshotted Party", () => {
    const empty = createCareLifecycleState();
    const published = transitionCareLifecycle(empty, {
      type: "publish-request",
      request: request(),
    });
    expect(published.ok).toBe(true);
    if (!published.ok) return;

    expect(
      transitionCareLifecycle(published.state, {
        type: "publish-request",
        request: request(),
      }),
    ).toMatchObject({ ok: false, error: "duplicate-record" });
    expect(
      transitionCareLifecycle(empty, {
        type: "publish-request",
        request: request({
          audienceSnapshot: { partyMemberIds: [], tribeMemberIds: [] },
        }),
      }),
    ).toMatchObject({ ok: false, error: "invalid-request" });
    expect(
      transitionCareLifecycle(empty, {
        type: "publish-request",
        request: request({ createdAt: "not-a-timestamp" }),
      }),
    ).toMatchObject({ ok: false, error: "invalid-request" });
  });

  it.each<[string, CareLifecycleAction]>([
    [
      "withdrawal timestamp",
      {
        type: "withdraw-request",
        requestId: "request-1",
        actorId: "anya",
        withdrawnAt: "not-a-timestamp",
      },
    ],
    [
      "expiry timestamp",
      {
        type: "expire-request",
        requestId: "request-1",
        expiredAt: "not-a-timestamp",
      },
    ],
    [
      "seen record identity",
      {
        type: "mark-seen",
        seenState: {
          id: " ",
          requestId: "request-1",
          viewerId: "you",
          seenAt: beforeExpiry,
          minimized: true,
        },
      },
    ],
    [
      "seen timestamp",
      {
        type: "mark-seen",
        seenState: {
          id: "seen-you",
          requestId: "request-1",
          viewerId: "you",
          seenAt: "not-a-timestamp",
          minimized: true,
        },
      },
    ],
    [
      "pass record identity",
      {
        type: "pass-request",
        pass: {
          id: "",
          requestId: "request-1",
          actorId: "you",
          passedAt: beforeExpiry,
        },
      },
    ],
    [
      "pass timestamp",
      {
        type: "pass-request",
        pass: {
          id: "pass-you",
          requestId: "request-1",
          actorId: "you",
          passedAt: "not-a-timestamp",
        },
      },
    ],
    [
      "claim record identity",
      {
        type: "claim-request",
        claim: { ...claim(), id: "" },
      },
    ],
    [
      "claim timestamp",
      {
        type: "claim-request",
        claim: { ...claim(), claimedAt: "not-a-timestamp" },
      },
    ],
    [
      "completion record identity",
      {
        type: "record-completion",
        completion: {
          id: "",
          requestId: "request-1",
          participantId: "anya",
          decision: "completed",
          decidedAt: beforeExpiry,
        },
      },
    ],
    [
      "completion timestamp",
      {
        type: "record-completion",
        completion: {
          id: "completion-anya",
          requestId: "request-1",
          participantId: "anya",
          decision: "completed",
          decidedAt: "not-a-timestamp",
        },
      },
    ],
    [
      "disposition record identity",
      {
        type: "record-disposition",
        disposition: {
          id: "",
          requestId: "request-1",
          actorId: "anya",
          kind: "close",
          reason: "The timing did not work",
          disposedAt: beforeExpiry,
        },
      },
    ],
    [
      "disposition timestamp",
      {
        type: "record-disposition",
        disposition: {
          id: "disposition-1",
          requestId: "request-1",
          actorId: "anya",
          kind: "close",
          reason: "The timing did not work",
          disposedAt: "not-a-timestamp",
        },
      },
    ],
  ])("rejects an invalid %s before applying the transition", (_, action) => {
    expect(
      transitionCareLifecycle(createCareLifecycleState([request()]), action),
    ).toMatchObject({ ok: false, error: "invalid-action" });
  });

  it("derives Party passing and Tribe demotion per viewer", () => {
    let state = createCareLifecycleState([request()]);
    expect(selectTimelineCareRequests(state, "you", beforeExpiry)).toHaveLength(
      1,
    );
    expect(selectTimelineCareRequests(state, "ren", beforeExpiry)).toHaveLength(
      0,
    );

    state = apply(state, {
      type: "pass-request",
      pass: {
        id: "pass-you",
        requestId: "request-1",
        actorId: "you",
        passedAt: beforeExpiry,
      },
    });
    expect(selectTimelineCareRequests(state, "you", beforeExpiry)).toHaveLength(
      0,
    );
    expect(
      selectTimelineCareRequests(state, "mira", beforeExpiry),
    ).toHaveLength(1);

    state = apply(state, {
      type: "pass-request",
      pass: {
        id: "pass-mira",
        requestId: "request-1",
        actorId: "mira",
        passedAt: beforeExpiry,
      },
    });
    expect(haveAllPartyMembersPassed(state, request())).toBe(true);
    expect(
      selectTimelineCareRequests(state, "mira", beforeExpiry),
    ).toHaveLength(0);
    expect(selectTimelineCareRequests(state, "ren", beforeExpiry)).toHaveLength(
      1,
    );
    expect(
      selectTimelineCareRequests(state, "anya", beforeExpiry),
    ).toHaveLength(1);
  });

  it("keeps a claim visible only to the requester and claimer and rejects a second claim", () => {
    const initial = createCareLifecycleState([request()]);
    expect(
      transitionCareLifecycle(initial, {
        type: "claim-request",
        claim: claim("request-1", "anya"),
      }),
    ).toMatchObject({ ok: false, error: "not-authorized" });
    const claimed = apply(initial, { type: "claim-request", claim: claim() });

    expect(
      selectTimelineCareRequests(claimed, "you", afterExpiry),
    ).toHaveLength(1);
    expect(
      selectTimelineCareRequests(claimed, "anya", afterExpiry),
    ).toHaveLength(1);
    expect(
      selectTimelineCareRequests(claimed, "mira", beforeExpiry),
    ).toHaveLength(0);
    expect(
      transitionCareLifecycle(claimed, {
        type: "claim-request",
        claim: { ...claim(), id: "claim-2", claimerId: "mira" },
      }),
    ).toMatchObject({ ok: false, error: "already-claimed" });
  });

  it("derives private claimed care for a profile owner", () => {
    const claimed = apply(createCareLifecycleState([request()]), {
      type: "claim-request",
      claim: claim(),
    });

    expect(
      selectProfileCareRequests(claimed, "you", "you", beforeExpiry),
    ).toEqual([request()]);
    expect(
      selectProfileCareRequests(claimed, "you", "mira", beforeExpiry),
    ).toEqual([]);
    expect(
      selectProfileCareRequests(claimed, "anya", "you", beforeExpiry),
    ).toEqual([request()]);
  });

  it("records seen state once for a viewer who can see the request", () => {
    const initial = createCareLifecycleState([request()]);
    const seenState = {
      id: "seen-you",
      requestId: "request-1",
      viewerId: "you",
      seenAt: beforeExpiry,
      minimized: true,
    };
    const seen = apply(initial, { type: "mark-seen", seenState });

    expect(seen.seenStates).toEqual([seenState]);
    expect(
      transitionCareLifecycle(seen, { type: "mark-seen", seenState }),
    ).toMatchObject({ ok: false, error: "duplicate-record" });
    expect(
      transitionCareLifecycle(initial, {
        type: "mark-seen",
        seenState: { ...seenState, id: "seen-ren", viewerId: "ren" },
      }),
    ).toMatchObject({ ok: false, error: "request-not-visible" });
  });

  it("closes completed care only after both participants decide", () => {
    let state = apply(createCareLifecycleState([request()]), {
      type: "claim-request",
      claim: claim(),
    });
    state = apply(state, {
      type: "record-completion",
      completion: {
        id: "completion-anya",
        requestId: "request-1",
        participantId: "anya",
        decision: "completed",
        decidedAt: "2026-09-04T10:00:00.000Z",
      },
    });
    expect(state.history).toEqual([]);

    state = apply(state, {
      type: "record-completion",
      completion: {
        id: "completion-you",
        requestId: "request-1",
        participantId: "you",
        decision: "completed",
        decidedAt: "2026-09-04T11:00:00.000Z",
      },
    });
    expect(state.history).toEqual([
      expect.objectContaining({ ownerId: "anya", outcome: "completed" }),
      expect.objectContaining({ ownerId: "you", outcome: "completed" }),
    ]);
    expect(selectTimelineCareRequests(state, "you", afterExpiry)).toEqual([]);
  });

  it("closes not-completed care and links a retry successor", () => {
    let state = apply(createCareLifecycleState([request()]), {
      type: "claim-request",
      claim: claim(),
    });
    state = apply(state, {
      type: "record-completion",
      completion: {
        id: "completion-you",
        requestId: "request-1",
        participantId: "you",
        decision: "not-completed",
        decidedAt: "2026-09-04T10:00:00.000Z",
      },
    });
    const successor = request({
      id: "request-2",
      createdAt: "2026-09-04T10:30:00.000Z",
      expiresAt: "2026-09-11T10:30:00.000Z",
    });
    state = apply(state, {
      type: "record-disposition",
      disposition: {
        id: "disposition-1",
        requestId: "request-1",
        actorId: "you",
        kind: "retry",
        reason: "The timing did not work",
        disposedAt: "2026-09-04T10:30:00.000Z",
        successorRequestId: "request-2",
      },
      successorRequest: successor,
    });

    expect(state.requests[0]).toEqual(successor);
    expect(state.history).toEqual([
      expect.objectContaining({ ownerId: "anya", outcome: "not-completed" }),
      expect.objectContaining({ ownerId: "you", outcome: "not-completed" }),
    ]);
  });

  it("expires only unclaimed requests and records requester history", () => {
    const initial = createCareLifecycleState([request()]);
    expect(selectTimelineCareRequests(initial, "you", afterExpiry)).toEqual([]);

    const expired = apply(initial, {
      type: "expire-request",
      requestId: "request-1",
      expiredAt: afterExpiry,
    });
    expect(expired.history).toEqual([
      expect.objectContaining({ ownerId: "anya", outcome: "expired" }),
    ]);

    const claimed = apply(initial, { type: "claim-request", claim: claim() });
    expect(
      transitionCareLifecycle(claimed, {
        type: "expire-request",
        requestId: "request-1",
        expiredAt: afterExpiry,
      }),
    ).toMatchObject({ ok: false, error: "request-expired" });
  });
});
