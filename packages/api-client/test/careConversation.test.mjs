import assert from "node:assert/strict";
import test from "node:test";
import { createApiClient } from "../src/index.ts";

test("conversation client preserves credentials, encodes Care IDs and rejects malformed responses", async () => {
  const requests = [];
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetch: async (url, init) => {
      requests.push([url, init]);
      return init.method === "POST"
        ? new Response(null, { status: 204 })
        : Response.json({ apiVersion: "v1", data: { messages: [] } });
    },
  });
  assert.equal((await client.getCareMessages({ careId: "care/a" })).ok, true);
  assert.equal(
    (await client.sendCareMessage({ careId: "care/a" }, { text: "Hello" })).ok,
    true,
  );
  assert.equal(
    (
      await client.markCareMessagesRead(
        { careId: "care/a" },
        { throughMessageId: "m1" },
      )
    ).ok,
    true,
  );
  assert.deepEqual(
    requests.map(([url]) => url),
    [
      "https://example.test/api/v1/cares/care%2Fa/messages",
      "https://example.test/api/v1/cares/care%2Fa/messages",
      "https://example.test/api/v1/cares/care%2Fa/messages/read",
    ],
  );
  for (const [, init] of requests) assert.equal(init.credentials, "include");
  const malformed = createApiClient({
    baseUrl: "",
    fetch: async () =>
      Response.json({
        apiVersion: "v1",
        data: { conversations: [{ careId: "care-a", unreadCount: -1 }] },
      }),
  });
  assert.equal((await malformed.getCareUnread()).kind, "unexpected-response");
  const denied = createApiClient({
    baseUrl: "",
    fetch: async () =>
      Response.json(
        {
          apiVersion: "v1",
          error: { code: "NOT_FOUND", message: "Unavailable" },
        },
        { status: 404 },
      ),
  });
  assert.equal(
    (await denied.getCareMessages({ careId: "care-a" })).kind,
    "http",
  );
});
