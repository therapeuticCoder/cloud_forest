import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { getTimelineItemRequestExample } from "@cloud-forest/api-contracts";
import {
  createDatabaseClient,
  createTimelineItemRepository,
  getTestDatabaseUrl,
} from "@cloud-forest/database";

import { buildApi } from "../../src/app.ts";
import { createTimelineItemResolver } from "../../src/timelineItemResolver.ts";

test("the API reads the migrated Timeline item through the database resolver", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const server = buildApi({
    timelineItemResolver: createTimelineItemResolver(
      createTimelineItemRepository(database),
    ),
  });
  t.after(async () => {
    await server.close();
    await pool.end();
  });

  const response = await server.inject({
    method: "GET",
    url: `/api/v1/timeline-items/${getTimelineItemRequestExample.timelineItemId}`,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    apiVersion: "v1",
    data: {
      timelineItem: {
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
      },
    },
  });
});
