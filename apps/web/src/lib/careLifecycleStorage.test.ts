import { beforeEach, describe, expect, it } from "vitest";

import { incomingCareRequests } from "@/data/careListingsMockData";
import { CARE_CLAIMS_STORAGE_KEY } from "@/lib/careClaimStorage";

import { transitionCareLifecycle } from "./careLifecycle";
import {
  CARE_LIFECYCLE_STORAGE_KEY,
  loadCareLifecycleState,
  saveCareLifecycleState,
} from "./careLifecycleStorage";

describe("care lifecycle prototype storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("migrates the known version-1 claim to the current fictional user", () => {
    localStorage.setItem(
      CARE_CLAIMS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        claims: [
          {
            listingId: incomingCareRequests[0].id,
            state: "claimed",
            claimedAt: "2026-09-03T14:00:00.000Z",
          },
          {
            listingId: "missing-request",
            state: "claimed",
            claimedAt: "2026-09-03T14:00:00.000Z",
          },
        ],
      }),
    );

    expect(loadCareLifecycleState(incomingCareRequests).claims).toEqual([
      {
        id: `care-claim-${incomingCareRequests[0].id}-you`,
        requestId: incomingCareRequests[0].id,
        claimerId: "you",
        claimedAt: "2026-09-03T14:00:00.000Z",
      },
    ]);
  });

  it("round-trips version-2 lifecycle records without persisting requests", () => {
    const initial = loadCareLifecycleState(incomingCareRequests);
    const transition = transitionCareLifecycle(initial, {
      type: "claim-request",
      claim: {
        id: "claim-1",
        requestId: incomingCareRequests[0].id,
        claimerId: "you",
        claimedAt: "2026-09-03T14:00:00.000Z",
      },
    });
    expect(transition.ok).toBe(true);
    if (!transition.ok) return;

    const gratitudeTransition = transitionCareLifecycle(transition.state, {
      type: "record-gratitude",
      gratitude: {
        id: "gratitude-1",
        requestId: incomingCareRequests[0].id,
        receiverId: "anya",
        giverId: "you",
        statementId: "meal-fed-when-needed",
        message: "Thank you.",
        postToTimeline: false,
        anonymized: false,
        createdAt: "2026-09-03T15:00:00.000Z",
      },
    });
    expect(gratitudeTransition.ok).toBe(true);
    if (!gratitudeTransition.ok) return;

    saveCareLifecycleState(gratitudeTransition.state);

    expect(loadCareLifecycleState(incomingCareRequests)).toEqual(
      gratitudeTransition.state,
    );
    expect(
      JSON.parse(localStorage.getItem(CARE_LIFECYCLE_STORAGE_KEY) ?? ""),
    ).not.toHaveProperty("requests");
    expect(
      JSON.parse(localStorage.getItem(CARE_LIFECYCLE_STORAGE_KEY) ?? ""),
    ).toHaveProperty("gratitudes", gratitudeTransition.state.gratitudes);
  });

  it("loads version-2 lifecycle records written before gratitude existed", () => {
    localStorage.setItem(
      CARE_LIFECYCLE_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        claims: [],
        passes: [],
        seenStates: [],
        completions: [],
        dispositions: [],
        history: [],
      }),
    );

    expect(loadCareLifecycleState(incomingCareRequests).gratitudes).toEqual([]);
  });

  it.each([
    ["malformed JSON", "not-json"],
    ["an incomplete version-2 envelope", JSON.stringify({ version: 2 })],
    ["an unknown future version", JSON.stringify({ version: 3, claims: [] })],
  ])(
    "does not overwrite %s while using an empty fallback",
    (_, storedValue) => {
      localStorage.setItem(CARE_LIFECYCLE_STORAGE_KEY, storedValue);
      const emptyFallback = loadCareLifecycleState(incomingCareRequests);
      expect(emptyFallback.claims).toEqual([]);

      const transition = transitionCareLifecycle(emptyFallback, {
        type: "claim-request",
        claim: {
          id: "claim-1",
          requestId: incomingCareRequests[0].id,
          claimerId: "you",
          claimedAt: "2026-09-03T14:00:00.000Z",
        },
      });
      expect(transition.ok).toBe(true);
      if (!transition.ok) return;

      saveCareLifecycleState(transition.state);
      expect(localStorage.getItem(CARE_LIFECYCLE_STORAGE_KEY)).toBe(
        storedValue,
      );
    },
  );
});
