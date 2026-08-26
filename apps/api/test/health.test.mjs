import assert from "node:assert/strict";
import test from "node:test";

import {
  healthPath,
  healthResponseExample,
  isHealthResponse,
} from "@cloud-forest/api-contracts";

import { buildApi } from "../src/app.ts";

test("GET /api/v1/health returns the validated shared response", async (t) => {
  const server = buildApi();
  t.after(() => server.close());

  const response = await server.inject({ method: "GET", url: healthPath });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), healthResponseExample);
  assert.equal(isHealthResponse(response.json()), true);
});

test("the health request rejects unexpected query parameters", async (t) => {
  const server = buildApi();
  t.after(() => server.close());

  const response = await server.inject({
    method: "GET",
    url: `${healthPath}?database=true`,
  });

  assert.equal(response.statusCode, 400);
});
