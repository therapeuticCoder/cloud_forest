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

test("getTimelineItem returns the validated typed success result", async () => {
  const timelineItem = {
    id: "timeline-item-mira-soup-001",
    actor: {
      id: "mira",
      displayName: "Mira",
      layer: "party",
      initials: "M",
    },
    content:
      "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?",
    publishedAt: "2026-05-30T17:00:00.000Z",
  };
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async () =>
      jsonResponse({
        apiVersion: "v1",
        data: { timelineItem },
      }),
  });

  assert.deepEqual(
    await client.getTimelineItem({ timelineItemId: timelineItem.id }),
    {
      ok: true,
      status: 200,
      value: { apiVersion: "v1", data: { timelineItem } },
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

test("malformed success bodies become unexpected responses", async () => {
  const malformedBody = { apiVersion: "v1", data: {} };
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async () => jsonResponse(malformedBody),
  });

  assert.deepEqual(
    await client.getTimelineItem({ timelineItemId: "timeline-item-001" }),
    {
      ok: false,
      kind: "unexpected-response",
      status: 200,
      body: malformedBody,
    },
  );
});

test("malformed documented error bodies become unexpected responses", async () => {
  const malformedBody = {
    apiVersion: "v1",
    error: { code: "UNKNOWN_ERROR", message: "Fictional error." },
  };
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetch: async () => jsonResponse(malformedBody, 404),
  });

  assert.deepEqual(
    await client.getTimelineItem({ timelineItemId: "timeline-item-001" }),
    {
      ok: false,
      kind: "unexpected-response",
      status: 404,
      body: malformedBody,
    },
  );
});

test("HTML fallbacks cannot masquerade as typed health responses", async () => {
  const client = createApiClient({
    baseUrl: "https://web.example.test",
    fetch: async () => ({
      status: 200,
      async text() {
        return "<html>Fictional Vite fallback</html>";
      },
    }),
  });

  assert.deepEqual(await client.getHealth(), {
    ok: false,
    kind: "unexpected-response",
    status: 200,
    body: "<html>Fictional Vite fallback</html>",
  });
});
