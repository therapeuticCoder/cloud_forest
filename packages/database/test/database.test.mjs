import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { eq } from "drizzle-orm";

import { createDatabaseClient } from "../src/client.ts";
import { getTestDatabaseUrl } from "../src/config.ts";
import { timelineItems, users } from "../src/schema.ts";

const postId = "timeline-post-schema-001";
const authorUserId = "timeline-schema-author";
const now = new Date("2026-09-16T15:30:00.000Z");

test("the migrated schema stores and reads a user-backed Timeline post", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(async () => {
    await database.delete(timelineItems).where(eq(timelineItems.id, postId));
    await database.delete(users).where(eq(users.id, authorUserId));
    await pool.end();
  });

  await database.delete(timelineItems).where(eq(timelineItems.id, postId));
  await database.delete(users).where(eq(users.id, authorUserId));
  await database.insert(users).values({
    id: authorUserId,
    name: "Timeline Author",
    email: `${authorUserId}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(timelineItems).values({
    id: postId,
    ownerUserId: null,
    authorUserId,
    audience: "party",
    actorId: authorUserId,
    actorDisplayName: "Timeline Author",
    actorLayer: "party",
    actorInitials: "TA",
    actorAvatarUrl: null,
    content: "A post written by a real user.",
    publishedAt: now,
  });

  const [storedItem] = await database
    .select()
    .from(timelineItems)
    .where(eq(timelineItems.id, postId));

  assert.deepEqual(storedItem, {
    id: postId,
    ownerUserId: null,
    authorUserId,
    audience: "party",
    actorId: authorUserId,
    actorDisplayName: "Timeline Author",
    actorLayer: "party",
    actorInitials: "TA",
    actorAvatarUrl: null,
    content: "A post written by a real user.",
    publishedAt: now,
  });
});

test("database constraints reject invalid Timeline values", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(() => pool.end());

  await assert.rejects(
    database.insert(timelineItems).values({
      id: "",
      actorId: "author-constraints-test",
      actorDisplayName: "Schema Author",
      actorLayer: "party",
      content: "Invalid id test.",
      publishedAt: new Date("2026-08-25T15:30:00.000Z"),
    }),
    (error) =>
      error instanceof Error &&
      error.cause?.constraint === "timeline_items_id_length",
  );

  await assert.rejects(
    database.insert(timelineItems).values({
      id: "timeline-item-invalid-content",
      actorId: "author-constraints-test",
      actorDisplayName: "Schema Author",
      actorLayer: "party",
      content: "",
      publishedAt: new Date("2026-08-25T15:30:00.000Z"),
    }),
    (error) =>
      error instanceof Error &&
      error.cause?.constraint === "timeline_items_content_length",
  );
});
