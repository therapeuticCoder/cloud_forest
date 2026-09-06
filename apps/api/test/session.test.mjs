import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app.ts";

test("the session route derives a current person and rejects missing sessions", async (t) => {
  const server = buildApi({
    sessionResolver: {
      async resolve(request) {
        return request.headers.cookie === "session=valid"
          ? { personId: "person-fictional-river" }
          : null;
      },
      async logout() {},
    },
  });
  t.after(() => server.close());

  const denied = await server.inject({ method: "GET", url: "/api/v1/session" });
  assert.equal(denied.statusCode, 401);
  assert.deepEqual(denied.json(), {
    apiVersion: "v1",
    error: {
      code: "UNAUTHORIZED",
      message: "A valid invited session is required.",
    },
  });

  const current = await server.inject({
    method: "GET",
    url: "/api/v1/session",
    headers: { cookie: "session=valid" },
  });
  assert.equal(current.statusCode, 200);
  assert.deepEqual(current.json(), {
    apiVersion: "v1",
    data: { currentPersonId: "person-fictional-river" },
  });
});

test("logout requires a trusted current person", async (t) => {
  let loggedOut = false;
  const server = buildApi({
    sessionResolver: {
      async resolve() {
        return { personId: "person-fictional-river" };
      },
      async logout() {
        loggedOut = true;
      },
    },
  });
  t.after(() => server.close());
  const response = await server.inject({
    method: "POST",
    url: "/api/v1/session/logout",
  });
  assert.equal(response.statusCode, 204);
  assert.equal(loggedOut, true);
});
