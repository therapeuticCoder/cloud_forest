import { describe, expect, it } from "vitest";

import { curatorMockData } from "./curatorMockData";

describe("curatorMockData", () => {
  it("provides mock data only for the active prototype layers", () => {
    expect(curatorMockData.user.displayName).toBe("River Tester");
    expect(curatorMockData.partyPeople).toHaveLength(5);
  });
});
