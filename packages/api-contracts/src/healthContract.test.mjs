import assert from "node:assert/strict";
import test from "node:test";

import {
  healthResponseExample,
  isHealthRequest,
  isHealthResponse,
} from "./healthContract.ts";

test("the v1 health request and response pass runtime validation", () => {
  assert.equal(isHealthRequest({}), true);
  assert.equal(isHealthResponse(healthResponseExample), true);
});

test("unexpected health request and response fields fail validation", () => {
  assert.equal(isHealthRequest({ verbose: true }), false);
  assert.equal(
    isHealthResponse({ ...healthResponseExample, database: "connected" }),
    false,
  );
});
