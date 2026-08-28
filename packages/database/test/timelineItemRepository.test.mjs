import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import {
  createDatabaseClient,
  createTimelineItemRepository,
  getTestDatabaseUrl,
} from "../src/index.ts";

const fixtureId = "timeline-item-mira-soup-001";

test("the repository reads the migrated fictional Timeline item", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(() => pool.end());

  const repository = createTimelineItemRepository(database);

  assert.deepEqual(await repository.findById(fixtureId), {
    id: fixtureId,
    actor: {
      id: "mira",
      displayName: "Mira",
      layer: "party",
      initials: "M",
    },
    content:
      "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?",
    publishedAt: "2026-05-30T17:00:00.000Z",
  });
});

test("the repository returns null for an unknown Timeline item", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(() => pool.end());

  const repository = createTimelineItemRepository(database);

  assert.equal(await repository.findById("timeline-item-missing"), null);
});
