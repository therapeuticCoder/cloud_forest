import { eq } from "drizzle-orm";

import type { TimelineItem } from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import { timelineItems, type TimelineItemRow } from "./schema.ts";

function mapTimelineItemRow(row: TimelineItemRow): TimelineItem {
  return {
    id: row.id,
    actor: {
      id: row.actorId,
      displayName: row.actorDisplayName,
      layer: row.actorLayer,
      ...(row.actorInitials === null ? {} : { initials: row.actorInitials }),
      ...(row.actorAvatarUrl === null ? {} : { avatarUrl: row.actorAvatarUrl }),
    },
    content: row.content,
    publishedAt: row.publishedAt.toISOString(),
  };
}

export function createTimelineItemRepository(database: DatabaseClient) {
  return {
    async findById(timelineItemId: string): Promise<TimelineItem | null> {
      const [row] = await database
        .select()
        .from(timelineItems)
        .where(eq(timelineItems.id, timelineItemId))
        .limit(1);

      return row === undefined ? null : mapTimelineItemRow(row);
    },
  };
}

export type TimelineItemRepository = ReturnType<
  typeof createTimelineItemRepository
>;
