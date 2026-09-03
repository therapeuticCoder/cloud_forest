import { beforeEach, describe, expect, it } from "vitest";

import type { CareClaim } from "@/types/careRequest";

import {
  CARE_CLAIMS_STORAGE_KEY,
  loadCareClaims,
  saveCareClaims,
} from "./careClaimStorage";

describe("care claim prototype storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips only the versioned minimal claim record", () => {
    const claims: CareClaim[] = [
      {
        listingId: "care-request-anya-meal-001",
        state: "claimed",
        claimedAt: "2026-09-02T21:00:00.000Z",
      },
    ];

    saveCareClaims(claims);

    expect(loadCareClaims()).toEqual(claims);
    expect(
      JSON.parse(localStorage.getItem(CARE_CLAIMS_STORAGE_KEY) ?? ""),
    ).toEqual({ version: 1, claims });
  });

  it("treats malformed or differently versioned data as unclaimed", () => {
    localStorage.setItem(CARE_CLAIMS_STORAGE_KEY, "not-json");
    expect(loadCareClaims()).toEqual([]);

    localStorage.setItem(
      CARE_CLAIMS_STORAGE_KEY,
      JSON.stringify({ version: 2, claims: [] }),
    );
    expect(loadCareClaims()).toEqual([]);

    localStorage.setItem(
      CARE_CLAIMS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        claims: [{ listingId: "request", state: "liked", claimedAt: "soon" }],
      }),
    );
    expect(loadCareClaims()).toEqual([]);
  });
});
