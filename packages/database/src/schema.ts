import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import type { TimelineItemLayer } from "@cloud-forest/domain";

export const timelineItems = pgTable(
  "timeline_items",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    actorId: varchar("actor_id", { length: 128 }).notNull(),
    actorDisplayName: varchar("actor_display_name", { length: 200 }).notNull(),
    actorLayer: varchar("actor_layer", { length: 16 })
      .$type<TimelineItemLayer>()
      .notNull(),
    actorInitials: varchar("actor_initials", { length: 8 }),
    actorAvatarUrl: varchar("actor_avatar_url", { length: 2_048 }),
    content: text("content").notNull(),
    publishedAt: timestamp("published_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    check("timeline_items_id_length", sql`char_length(${table.id}) >= 1`),
    check(
      "timeline_items_actor_id_length",
      sql`char_length(${table.actorId}) >= 1`,
    ),
    check(
      "timeline_items_actor_display_name_length",
      sql`char_length(${table.actorDisplayName}) >= 1`,
    ),
    check(
      "timeline_items_actor_layer_allowed",
      sql`${table.actorLayer} in ('party', 'tribe', 'guild', 'signal')`,
    ),
    check(
      "timeline_items_actor_initials_length",
      sql`${table.actorInitials} is null or char_length(${table.actorInitials}) >= 1`,
    ),
    check(
      "timeline_items_actor_avatar_url_length",
      sql`${table.actorAvatarUrl} is null or char_length(${table.actorAvatarUrl}) >= 1`,
    ),
    check(
      "timeline_items_content_length",
      sql`char_length(${table.content}) between 1 and 10000`,
    ),
  ],
);

export type TimelineItemRow = typeof timelineItems.$inferSelect;
export type NewTimelineItemRow = typeof timelineItems.$inferInsert;
