import assert from "node:assert/strict";
import test from "node:test";

import {
  apiVersion,
  getTimelineItemErrorResponseExample,
  getTimelineItemRequestExample,
  getTimelineItemSuccessResponseExample,
  isGetTimelineItemErrorResponse,
  isGetTimelineItemSuccessResponse,
  timelineItemPath,
} from "@cloud-forest/api-contracts";

import { buildApi } from "../src/app.ts";

function timelineItemUrl(timelineItemId) {
  return timelineItemPath.replace(":timelineItemId", timelineItemId);
}

test("GET /api/v1/timeline-items/:id returns a typed default 404", async (t) => {
  const server = buildApi();
  t.after(() => server.close());

  const response = await server.inject({
    method: "GET",
    url: timelineItemUrl(getTimelineItemRequestExample.timelineItemId),
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), getTimelineItemErrorResponseExample);
  assert.equal(isGetTimelineItemErrorResponse(response.json()), true);
});

test("an injected resolver can return the typed success response", async (t) => {
  const server = buildApi({
    timelineItemResolver: () => ({
      statusCode: 200,
      body: getTimelineItemSuccessResponseExample,
    }),
  });
  t.after(() => server.close());

  const response = await server.inject({
    method: "GET",
    url: timelineItemUrl(getTimelineItemRequestExample.timelineItemId),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), getTimelineItemSuccessResponseExample);
  assert.equal(isGetTimelineItemSuccessResponse(response.json()), true);
});

test("invalid Timeline item path parameters return the typed error", async (t) => {
  const server = buildApi();
  t.after(() => server.close());

  const response = await server.inject({
    method: "GET",
    url: timelineItemUrl("x".repeat(129)),
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    apiVersion,
    error: {
      code: "INVALID_REQUEST",
      message: "Invalid Timeline item request.",
    },
  });
  assert.equal(isGetTimelineItemErrorResponse(response.json()), true);
});
