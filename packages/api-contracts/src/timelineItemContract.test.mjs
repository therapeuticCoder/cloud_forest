import assert from "node:assert/strict";
import test from "node:test";

import {
  getTimelineItemErrorResponseExample,
  getTimelineItemRequestExample,
  getTimelineItemSuccessResponseExample,
  isGetTimelineItemErrorResponse,
  isGetTimelineItemRequest,
  isGetTimelineItemSuccessResponse,
} from "./timelineItemContract.ts";

test("representative v1 request and responses pass runtime validation", () => {
  assert.equal(isGetTimelineItemRequest(getTimelineItemRequestExample), true);
  assert.equal(
    isGetTimelineItemSuccessResponse(getTimelineItemSuccessResponseExample),
    true,
  );
  assert.equal(
    isGetTimelineItemErrorResponse(getTimelineItemErrorResponseExample),
    true,
  );
});

test("an invalid request fails runtime validation", () => {
  assert.equal(isGetTimelineItemRequest({ timelineItemId: "" }), false);
  assert.equal(
    isGetTimelineItemRequest({
      timelineItemId: "timeline-item-001",
      includeReplies: true,
    }),
    false,
  );
});

test("invalid success responses fail runtime validation", () => {
  assert.equal(
    isGetTimelineItemSuccessResponse({
      ...getTimelineItemSuccessResponseExample,
      apiVersion: "v2",
    }),
    false,
  );
  assert.equal(
    isGetTimelineItemSuccessResponse({
      apiVersion: "v1",
      data: {
        timelineItem: {
          ...getTimelineItemSuccessResponseExample.data.timelineItem,
          publishedAt: "not-a-timestamp",
        },
      },
    }),
    false,
  );
});

test("invalid error responses fail runtime validation", () => {
  assert.equal(
    isGetTimelineItemErrorResponse({
      apiVersion: "v1",
      error: { code: "UNKNOWN_ERROR", message: "Unexpected error." },
    }),
    false,
  );
  assert.equal(
    isGetTimelineItemErrorResponse({
      apiVersion: "v1",
      error: { code: "INVALID_REQUEST", message: "", details: [] },
    }),
    false,
  );
});
