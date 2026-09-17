import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import {
  connections,
  createDatabaseClient,
  createTimelineItemRepository,
  curatedPersons,
  getTestDatabaseUrl,
  users,
} from "@cloud-forest/database";

import {
  createTimelineItemResolver,
  createTimelineItemsResolver,
  createTimelinePostResolver,
} from "../../src/timelineItemResolver.ts";

import { buildApi } from "../../src/app.ts";

const authorUserId = "timeline-api-author";
const viewerUserId = "timeline-api-party-viewer";
const userIds = [authorUserId, viewerUserId];
const connectionId = "timeline-api-connection";
const placementId = "timeline-api-party-placement";
const now = new Date("2026-09-16T16:30:00.000Z");

test("the API publishes and lists a user-backed Timeline post", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const removeFixture = async () => {
    await pool.query(
      'DELETE FROM "timeline_items" WHERE "author_user_id" = $1',
      [authorUserId],
    );
    await pool.query('DELETE FROM "curated_persons" WHERE "id" = $1', [
      placementId,
    ]);
    await pool.query('DELETE FROM "connections" WHERE "id" = $1', [
      connectionId,
    ]);
    await pool.query('DELETE FROM "user" WHERE "id" = ANY($1::varchar[])', [
      userIds,
    ]);
  };
  await removeFixture();

  await database.insert(users).values([
    {
      id: authorUserId,
      name: "Timeline API Author",
      email: `${authorUserId}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: viewerUserId,
      name: "Timeline API Viewer",
      email: `${viewerUserId}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(connections).values({
    id: connectionId,
    firstUserId: authorUserId,
    secondUserId: viewerUserId,
    createdAt: now,
  });
  await database.insert(curatedPersons).values({
    id: placementId,
    ownerUserId: authorUserId,
    firstName: "",
    lastName: "",
    nickname: "Timeline API Viewer",
    relationshipShape: "Connection",
    privateDescription: "",
    portraitUrl: "",
    placement: "party",
    linkedUserId: viewerUserId,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  let currentUserId = authorUserId;
  const repository = createTimelineItemRepository(database);
  const server = buildApi({
    timelineItemsResolver: createTimelineItemsResolver(repository),
    createTimelinePostResolver: createTimelinePostResolver(repository),
    timelineItemResolver: createTimelineItemResolver(repository),
    sessionResolver: {
      async resolve() {
        return {
          userId: currentUserId,
          personId: `person-${currentUserId}`,
        };
      },
      async logout() {},
    },
  });
  t.after(async () => {
    await server.close();
    await removeFixture();
    await pool.end();
  });

  const publishResponse = await server.inject({
    method: "POST",
    url: "/api/v1/timeline-items",
    payload: {
      content: "A post published by a connected user.",
      audience: "party",
    },
  });
  assert.equal(publishResponse.statusCode, 200);
  const published = publishResponse.json().data.timelineItem;

  const authorItemResponse = await server.inject({
    method: "GET",
    url: `/api/v1/timeline-items/${published.id}`,
  });
  assert.equal(authorItemResponse.statusCode, 200);
  assert.deepEqual(authorItemResponse.json(), {
    apiVersion: "v1",
    data: { timelineItem: published },
  });

  currentUserId = viewerUserId;
  const listResponse = await server.inject({
    method: "GET",
    url: "/api/v1/timeline-items",
  });
  assert.equal(listResponse.statusCode, 200);
  assert.deepEqual(listResponse.json(), {
    apiVersion: "v1",
    data: { timelineItems: [published] },
  });

  const itemResponse = await server.inject({
    method: "GET",
    url: `/api/v1/timeline-items/${published.id}`,
  });
  assert.equal(itemResponse.statusCode, 200);
  assert.deepEqual(itemResponse.json(), {
    apiVersion: "v1",
    data: { timelineItem: published },
  });
});
