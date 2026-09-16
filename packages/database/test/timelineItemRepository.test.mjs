import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { eq, inArray, or } from "drizzle-orm";

import {
  connections,
  createDatabaseClient,
  createTimelineItemRepository,
  curatedPersons,
  getTestDatabaseUrl,
  relationshipBlocks,
  timelineItems,
  users,
} from "../src/index.ts";

const authorUserId = "timeline-repository-author";
const partyViewerUserId = "timeline-repository-party-viewer";
const tribeViewerUserId = "timeline-repository-tribe-viewer";
const unconnectedViewerUserId = "timeline-repository-unconnected-viewer";
const userIds = [
  authorUserId,
  partyViewerUserId,
  tribeViewerUserId,
  unconnectedViewerUserId,
];
const connectionIds = [
  "timeline-repository-party-connection",
  "timeline-repository-tribe-connection",
];
const now = new Date("2026-09-16T16:00:00.000Z");

async function removeFixture(database) {
  await database
    .delete(timelineItems)
    .where(inArray(timelineItems.authorUserId, userIds));
  await database
    .delete(relationshipBlocks)
    .where(
      or(
        inArray(relationshipBlocks.blockerUserId, userIds),
        inArray(relationshipBlocks.blockedUserId, userIds),
      ),
    );
  await database
    .delete(curatedPersons)
    .where(eq(curatedPersons.ownerUserId, authorUserId));
  await database
    .delete(connections)
    .where(inArray(connections.id, connectionIds));
  await database.delete(users).where(inArray(users.id, userIds));
}

function user(id, name) {
  return {
    id,
    name,
    email: `${id}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  };
}

function placement(id, linkedUserId, audience) {
  return {
    id,
    ownerUserId: authorUserId,
    firstName: "",
    lastName: "",
    nickname: linkedUserId,
    relationshipShape: "Connection",
    privateDescription: "",
    portraitUrl: "",
    placement: audience,
    linkedUserId,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

test("user-backed posts follow relational audience and block state", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });

  await removeFixture(database);
  await database
    .insert(users)
    .values([
      user(authorUserId, "Timeline Author"),
      user(partyViewerUserId, "Party Viewer"),
      user(tribeViewerUserId, "Tribe Viewer"),
      user(unconnectedViewerUserId, "Unconnected Viewer"),
    ]);
  await database.insert(connections).values([
    {
      id: connectionIds[0],
      firstUserId: authorUserId,
      secondUserId: partyViewerUserId,
      createdAt: now,
    },
    {
      id: connectionIds[1],
      firstUserId: authorUserId,
      secondUserId: tribeViewerUserId,
      createdAt: now,
    },
  ]);
  await database
    .insert(curatedPersons)
    .values([
      placement(
        "timeline-repository-party-placement",
        partyViewerUserId,
        "party",
      ),
      placement(
        "timeline-repository-tribe-placement",
        tribeViewerUserId,
        "tribe",
      ),
    ]);

  const repository = createTimelineItemRepository(database);
  const partyPost = await repository.createPost({
    authorUserId,
    content: "A post for Party connections.",
    audience: "party",
    now,
  });
  const tribePost = await repository.createPost({
    authorUserId,
    content: "A post for Tribe connections.",
    audience: "tribe",
    now: new Date(now.getTime() + 1_000),
  });

  assert.notEqual(partyPost, null);
  assert.notEqual(tribePost, null);
  assert.deepEqual(await repository.listForViewer(partyViewerUserId), [
    partyPost,
  ]);
  assert.deepEqual(await repository.listForViewer(tribeViewerUserId), [
    tribePost,
  ]);
  assert.deepEqual(await repository.listForViewer(unconnectedViewerUserId), []);
  assert.deepEqual(
    await repository.findByIdForViewer(partyPost.id, partyViewerUserId),
    partyPost,
  );
  assert.equal(
    await repository.findByIdForViewer(tribePost.id, partyViewerUserId),
    null,
  );

  await database.insert(relationshipBlocks).values({
    blockerUserId: partyViewerUserId,
    blockedUserId: authorUserId,
    createdAt: new Date(now.getTime() + 2_000),
  });
  assert.deepEqual(await repository.listForViewer(partyViewerUserId), []);
  assert.equal(
    await repository.findByIdForViewer(partyPost.id, partyViewerUserId),
    null,
  );
});

test("a Timeline post is private to its author when no audience connection exists", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });

  await removeFixture(database);
  await database
    .insert(users)
    .values([
      user(authorUserId, "Timeline Author"),
      user(unconnectedViewerUserId, "Unconnected Viewer"),
    ]);

  const repository = createTimelineItemRepository(database);
  const post = await repository.createPost({
    authorUserId,
    content: "A post remains visible to its author.",
    audience: "party",
    now,
  });

  assert.notEqual(post, null);
  assert.deepEqual(await repository.listForViewer(authorUserId), [post]);
  assert.deepEqual(await repository.listForViewer(unconnectedViewerUserId), []);
});
