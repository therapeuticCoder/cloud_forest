import { describe, expect, it } from "vitest";

import { curatorMockData } from "./curatorMockData";

describe("curatorMockData", () => {
  it("provides the canonical Curator layer counts", () => {
    expect(curatorMockData.user.displayName).toBe("You");
    expect(curatorMockData.partyPeople).toHaveLength(5);
    expect(curatorMockData.tribeNeighborhoods).toHaveLength(5);
    expect(curatorMockData.guilds).toHaveLength(5);
    expect(curatorMockData.signals).toHaveLength(10);
  });

  it("groups exactly 100 tribe people across five neighborhoods", () => {
    const tribePeopleCount = curatorMockData.tribeNeighborhoods.reduce(
      (total, neighborhood) => total + neighborhood.people.length,
      0,
    );

    expect(tribePeopleCount).toBe(100);
    expect(
      curatorMockData.tribeNeighborhoods.every(
        (neighborhood) => neighborhood.people.length === 20,
      ),
    ).toBe(true);
  });
});
