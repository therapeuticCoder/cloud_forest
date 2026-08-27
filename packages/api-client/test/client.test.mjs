import assert from "node:assert/strict";
import test from "node:test";

import { createApiClient } from "../src/index.ts";

function jsonResponse(body, status = 200) {
  return {
    status,
    async text() {
      return JSON.stringify(body);
    },
  };
}

test("getHealth returns the typed v1 success result", async () => {
  const client = createApiClient({
    baseUrl: "https://api.example.test/",
    fetch: async (url, options) => {
      assert.equal(url, "https://api.example.test/api/v1/health");
      assert.equal(options.method, "GET");
      assert.equal(options.headers.accept, "application/json");
      return jsonResponse({ apiVersion: "v1", status: "ok" });
    },
  });

  assert.deepEqual(await client.getHealth(), {
    ok: true,
    status: 200,
    value: { apiVersion: "v1", status: "ok" },
  });
});

test("getTimelineItem encodes its path parameter and returns typed errors", async () => {
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async (url) => {
      assert.equal(
        url,
        "https://api.example.test/api/v1/timeline-items/item%2Fwith%20spaces",
      );
      return jsonResponse(
        {
          apiVersion: "v1",
          error: {
            code: "TIMELINE_ITEM_NOT_FOUND",
            message: "Timeline item not found.",
          },
        },
        404,
      );
    },
  });

  assert.deepEqual(
    await client.getTimelineItem({ timelineItemId: "item/with spaces" }),
    {
      ok: false,
      kind: "http",
      status: 404,
      error: {
        apiVersion: "v1",
        error: {
          code: "TIMELINE_ITEM_NOT_FOUND",
          message: "Timeline item not found.",
        },
      },
    },
  );
});

test("transport failures are distinct from HTTP errors", async () => {
  const cause = new Error("fictional network failure");
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async () => {
      throw cause;
    },
  });

  assert.deepEqual(await client.getHealth(), {
    ok: false,
    kind: "network",
    cause,
  });
});

test("undocumented statuses preserve the response for explicit handling", async () => {
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async () => ({
      status: 502,
      async text() {
        return "fictional gateway response";
      },
    }),
  });

  assert.deepEqual(await client.getHealth(), {
    ok: false,
    kind: "unexpected-response",
    status: 502,
    body: "fictional gateway response",
  });
});
