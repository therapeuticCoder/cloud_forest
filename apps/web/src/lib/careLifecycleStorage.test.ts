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

    saveCareLifecycleState(transition.state);

    expect(loadCareLifecycleState(incomingCareRequests)).toEqual(
      transition.state,
    );
    expect(
      JSON.parse(localStorage.getItem(CARE_LIFECYCLE_STORAGE_KEY) ?? ""),
    ).not.toHaveProperty("requests");
    expect(
      JSON.parse(localStorage.getItem(CARE_LIFECYCLE_STORAGE_KEY) ?? ""),
    ).not.toHaveProperty("gratitudes");
  });

  it("uses an empty state for malformed or unknown future versions", () => {
    localStorage.setItem(CARE_LIFECYCLE_STORAGE_KEY, "not-json");
    expect(loadCareLifecycleState(incomingCareRequests).claims).toEqual([]);

    localStorage.setItem(
      CARE_LIFECYCLE_STORAGE_KEY,
      JSON.stringify({ version: 3, claims: [] }),
    );
    expect(loadCareLifecycleState(incomingCareRequests).claims).toEqual([]);
  });
});
