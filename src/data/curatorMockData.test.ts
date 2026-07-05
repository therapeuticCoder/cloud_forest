import { describe, expect, it } from "vitest";

import { curatorMockData } from "./curatorMockData";

describe("curatorMockData", () => {
  it("provides the expected Curator layer data shape", () => {
    expect(curatorMockData.partyPeople).toHaveLength(6);
    expect(curatorMockData.tribeNeighborhoods).toHaveLength(5);
    expect(curatorMockData.guilds).toHaveLength(5);
    expect(curatorMockData.signals).toHaveLength(5);
  });

  it("groups up to 150 tribe people across five neighborhoods", () => {
    const tribePeopleCount = curatorMockData.tribeNeighborhoods.reduce(
      (total, neighborhood) => total + neighborhood.people.length,
      0,
    );

    expect(tribePeopleCount).toBe(150);
    expect(
      curatorMockData.tribeNeighborhoods.every(
        (neighborhood) => neighborhood.people.length <= 30,
      ),
    ).toBe(true);
  });
});
