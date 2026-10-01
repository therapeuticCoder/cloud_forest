import assert from "node:assert/strict";
import test from "node:test";
import { buildApi } from "../src/app.ts";

test("conversation routes authenticate every operation and use the session account", async (t) => {
  const calls = [];
  const repository = {
    async unread(userId) {
      calls.push(["unread", userId]);
      return [{ careId: "care-a", unreadCount: 0 }];
    },
    async read(careId, userId) {
      calls.push(["read", careId, userId]);
      return careId === "closed"
        ? { ok: false, error: "care-not-found" }
        : {
            ok: true,
            value: [
              {
                id: "message-a",
                text: "Hello",
                sentAt: new Date("2026-10-01T12:00:00Z"),
                sender: { personId: "person-a", displayName: "Tester" },
              },
            ],
          };
    },
    async send(...args) {
      calls.push(["send", ...args]);
      return { ok: true, value: null };
    },
    async markRead(...args) {
      calls.push(["markRead", ...args]);
      return { ok: true, value: null };
    },
  };
  const server = buildApi({
    careConversationRepository: repository,
    sessionResolver: {
      async resolve(request) {
        return request.headers.cookie
          ? {
              userId: request.headers.cookie,
              personId: `person-${request.headers.cookie}`,
              displayName: "Tester",
            }
          : null;
      },
      async logout() {},
    },
  });
  t.after(() => server.close());
  const operations = [
    { method: "GET", url: "/api/v1/cares/unread" },
    { method: "GET", url: "/api/v1/cares/care-a/messages" },
    {
      method: "POST",
      url: "/api/v1/cares/care-a/messages",
      payload: { text: "Hello" },
    },
    {
      method: "POST",
      url: "/api/v1/cares/care-a/messages/read",
      payload: { throughMessageId: "message-a" },
    },
  ];
  for (const operation of operations) {
    const response = await server.inject(operation);
    assert.equal(response.statusCode, 401);
    assert.equal(response.headers["cache-control"], "no-store");
  }
  assert.deepEqual(calls, []);
  for (const account of ["originator", "claimant"]) {
    for (const operation of operations) {
      const response = await server.inject({
        ...operation,
        headers: { cookie: account },
      });
      assert.equal(response.statusCode, operation.method === "GET" ? 200 : 204);
    }
    assert.deepEqual(calls.splice(0), [
      ["unread", account],
      ["read", "care-a", account],
      ["send", "care-a", account, "Hello"],
      ["markRead", "care-a", account, "message-a"],
    ]);
  }
  const closed = await server.inject({
    method: "GET",
    url: "/api/v1/cares/closed/messages",
    headers: { cookie: "claimant" },
  });
  assert.equal(closed.statusCode, 404);
  for (const text of ["", "   ", "x".repeat(2001)]) {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/cares/care-a/messages",
      headers: { cookie: "claimant" },
      payload: { text },
    });
    assert.equal(response.statusCode, 400);
  }
});
