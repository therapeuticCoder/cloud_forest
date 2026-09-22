import { describe, expect, it } from "vitest";
import type { Care } from "@/types/care";
import { selectMyCare } from "./careViews";

function care(id: string, overrides: Partial<Care> = {}): Care {
  return {
    id,
    direction: "receive",
    category: "transportation",
    subtype: "Give me a ride",
    days: [],
    times: [],
    timeNote: "",
    location: "Downtown",
    requirements: "",
    sensitivities: "",
    audience: "Party",
    status: "open",
    createdAt: "2026-09-22T10:00:00.000Z",
    originator: { id: "owner", displayName: "Owner" },
    ...overrides,
  };
}

describe("My Care projections", () => {
  it("places both directions in the viewer's role tab without duplicate entries", () => {
    const ownRequest = care("own-request");
    const ownOffer = care("own-offer", { direction: "give" });
    const helping = care("helping", {
      status: "claimed",
      originator: { id: "neighbor", displayName: "Neighbor" },
      participant: { id: "owner", displayName: "Owner" },
      participantCompletedAt: "2026-09-22T11:00:00.000Z",
    });
    const receiving = {
      ...helping,
      id: "receiving",
      direction: "give" as const,
    };
    const incoming = care("incoming", { originator: helping.originator });
    const input = [ownRequest, ownOffer, helping, receiving, incoming];
    const view = selectMyCare(input, "owner");
    expect(view.receive).toEqual([ownRequest, receiving]);
    expect(view.give).toEqual([ownOffer]);
    expect(view.helping).toEqual([helping]);
    expect(view.history).toEqual([]);
    expect(input).toEqual([ownRequest, ownOffer, helping, receiving, incoming]);
  });

  it("keeps terminal outcomes in chronological private history and orphaned Care out of active tabs", () => {
    const completed = care("done", {
      status: "completed",
      completedAt: "2026-09-22T12:00:00.000Z",
    });
    const withdrawn = care("withdrawn", {
      status: "not_completed",
      notCompletedAt: "2026-09-22T13:00:00.000Z",
    });
    const expired = care("expired", {
      status: "expired",
      expiredAt: "2026-09-22T11:00:00.000Z",
    });
    const orphaned = care("orphaned", { status: "orphaned" });
    const view = selectMyCare(
      [completed, withdrawn, expired, orphaned],
      "owner",
    );
    expect(view.receive).toEqual([]);
    expect(view.give).toEqual([]);
    expect(view.helping).toEqual([]);
    expect(view.history.map(({ care }) => care.id)).toEqual([
      "withdrawn",
      "done",
      "expired",
    ]);
    expect(selectMyCare([completed], "outsider").history).toEqual([]);
  });
});
