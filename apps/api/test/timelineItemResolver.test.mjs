import assert from "node:assert/strict";
import test from "node:test";

import { getTimelineItemSuccessResponseExample } from "@cloud-forest/api-contracts";

import { createTimelineItemResolver } from "../src/timelineItemResolver.ts";

test("the database resolver returns the typed Timeline success response", async () => {
  const timelineItem = getTimelineItemSuccessResponseExample.data.timelineItem;
  const resolver = createTimelineItemResolver({
    findById: async (timelineItemId) => {
      assert.equal(timelineItemId, timelineItem.id);
      return timelineItem;
    },
  });

  assert.deepEqual(await resolver({ timelineItemId: timelineItem.id }), {
    statusCode: 200,
    body: getTimelineItemSuccessResponseExample,
  });
});

test("the database resolver returns the typed not-found response", async () => {
  const resolver = createTimelineItemResolver({ findById: async () => null });

  assert.deepEqual(await resolver({ timelineItemId: "missing" }), {
    statusCode: 404,
    body: {
      apiVersion: "v1",
      error: {
        code: "TIMELINE_ITEM_NOT_FOUND",
        message: "Timeline item not found.",
      },
    },
  });
});
