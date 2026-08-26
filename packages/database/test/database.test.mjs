import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { eq } from "drizzle-orm";

import { createDatabaseClient } from "../src/client.ts";
import { getTestDatabaseUrl } from "../src/config.ts";
import { timelineItems } from "../src/schema.ts";

const fixtureId = "timeline-item-fictional-garden-001";

test("the migrated schema stores and reads one fictional Timeline item", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(async () => {
    await database.delete(timelineItems).where(eq(timelineItems.id, fixtureId));
    await pool.end();
  });

  await database.delete(timelineItems).where(eq(timelineItems.id, fixtureId));
  await database.insert(timelineItems).values({
    id: fixtureId,
    actorId: "actor-fictional-river",
    actorDisplayName: "River Okafor",
    actorLayer: "party",
    actorInitials: "RO",
    content: "Shared fictional notes from a neighborhood garden gathering.",
    publishedAt: new Date("2026-08-25T15:30:00.000Z"),
  });

  const [storedItem] = await database
    .select()
    .from(timelineItems)
    .where(eq(timelineItems.id, fixtureId));

  assert.deepEqual(storedItem, {
    id: fixtureId,
    actorId: "actor-fictional-river",
    actorDisplayName: "River Okafor",
    actorLayer: "party",
    actorInitials: "RO",
    actorAvatarUrl: null,
    content: "Shared fictional notes from a neighborhood garden gathering.",
    publishedAt: new Date("2026-08-25T15:30:00.000Z"),
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
      actorId: "actor-fictional-river",
      actorDisplayName: "River Okafor",
      actorLayer: "party",
      content: "Fictional content.",
      publishedAt: new Date("2026-08-25T15:30:00.000Z"),
    }),
    (error) =>
      error instanceof Error &&
      error.cause?.constraint === "timeline_items_id_length",
  );

  await assert.rejects(
    database.insert(timelineItems).values({
      id: "timeline-item-invalid-content",
      actorId: "actor-fictional-river",
      actorDisplayName: "River Okafor",
      actorLayer: "party",
      content: "",
      publishedAt: new Date("2026-08-25T15:30:00.000Z"),
    }),
    (error) =>
      error instanceof Error &&
      error.cause?.constraint === "timeline_items_content_length",
  );
});
