import assert from "node:assert/strict";
import test from "node:test";

import { timelineItemLayers } from "./timelineItem.ts";

test("Timeline items use only the four relational content layers", () => {
  assert.deepEqual(timelineItemLayers, ["party", "tribe", "guild", "signal"]);
});
