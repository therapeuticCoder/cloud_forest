import assert from "node:assert/strict";
import test from "node:test";

import { startApi, stopApi } from "../src/lifecycle.ts";

test("startup smoke test listens on an ephemeral local port", async (t) => {
  const server = await startApi({
    environment: { API_HOST: "127.0.0.1", API_PORT: "0" },
    serverOptions: { logger: false },
  });
  t.after(() => server.close());

  assert.equal(server.server.listening, true);
  assert.match(server.listeningOrigin, /^http:\/\/127\.0\.0\.1:\d+$/);
});

test("invalid configuration fails before a server is constructed", async () => {
  await assert.rejects(
    startApi({
      environment: { API_HOST: "127.0.0.1", API_PORT: "not-a-port" },
      serverOptions: { logger: false },
    }),
    /Invalid API configuration/,
  );
});

test("clean shutdown stops the listening server", async () => {
  const server = await startApi({
    environment: { API_HOST: "127.0.0.1", API_PORT: "0" },
    serverOptions: { logger: false },
  });

  await stopApi(server);

  assert.equal(server.server.listening, false);
});
