import { randomUUID } from "node:crypto";

import {
  and,
  desc,
  eq,
  exists,
  isNotNull,
  isNull,
  notExists,
  or,
  sql,
} from "drizzle-orm";

import type { TimelineAudience, TimelineItem } from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  connections,
  curatedPersons,
  personProfiles,
  relationshipBlocks,
  timelineItems,
  users,
  type TimelineItemRow,
} from "./schema.ts";

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

function visibleTimelineItemForViewer(
  database: DatabaseClient,
  viewerUserId: string,
) {
  const connectionWithAuthor = exists(
    database
      .select({ id: connections.id })
      .from(connections)
      .where(
        or(
          and(
            eq(connections.firstUserId, viewerUserId),
            eq(connections.secondUserId, timelineItems.authorUserId),
          ),
          and(
            eq(connections.firstUserId, timelineItems.authorUserId),
            eq(connections.secondUserId, viewerUserId),
          ),
        ),
      ),
  );
  const authorPlacementMatches = exists(
    database
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, timelineItems.authorUserId),
          eq(curatedPersons.linkedUserId, viewerUserId),
          sql`${curatedPersons.placement} = ${timelineItems.audience}`,
        ),
      ),
  );
  const relationshipIsNotBlocked = notExists(
    database
      .select({ blockerUserId: relationshipBlocks.blockerUserId })
      .from(relationshipBlocks)
      .where(
        or(
          and(
            eq(relationshipBlocks.blockerUserId, viewerUserId),
            eq(relationshipBlocks.blockedUserId, timelineItems.authorUserId),
          ),
          and(
            eq(relationshipBlocks.blockerUserId, timelineItems.authorUserId),
            eq(relationshipBlocks.blockedUserId, viewerUserId),
          ),
        ),
      ),
  );

  const visibleRelationshipPost = and(
    isNotNull(timelineItems.authorUserId),
    isNotNull(timelineItems.audience),
    relationshipIsNotBlocked,
    or(
      eq(timelineItems.authorUserId, viewerUserId),
      and(connectionWithAuthor, authorPlacementMatches),
    ),
  );

  const visibleExternalSignal = and(
    eq(timelineItems.actorLayer, "signal"),
    isNull(timelineItems.ownerUserId),
    isNull(timelineItems.authorUserId),
    isNull(timelineItems.audience),
  );

  return or(visibleRelationshipPost, visibleExternalSignal);
}

export function createTimelineItemRepository(database: DatabaseClient) {
  return {
    async listForViewer(viewerUserId: string): Promise<TimelineItem[]> {
      const rows = await database
        .select()
        .from(timelineItems)
        .where(visibleTimelineItemForViewer(database, viewerUserId))
        .orderBy(desc(timelineItems.publishedAt), desc(timelineItems.id));

      return rows.map(mapTimelineItemRow);
    },

    async createPost(input: {
      authorUserId: string;
      content: string;
      audience: TimelineAudience;
      now: Date;
    }): Promise<TimelineItem | null> {
      const [author] = await database
        .select({
          displayName: sql<string>`coalesce(${personProfiles.displayName}, ${users.name})`,
        })
        .from(users)
        .leftJoin(accountPeople, eq(accountPeople.accountId, users.id))
        .leftJoin(
          personProfiles,
          eq(personProfiles.personId, accountPeople.personId),
        )
        .where(eq(users.id, input.authorUserId))
        .limit(1);

      if (author === undefined) return null;

      const [created] = await database
        .insert(timelineItems)
        .values({
          id: `timeline-post-${randomUUID()}`,
          ownerUserId: null,
          authorUserId: input.authorUserId,
          audience: input.audience,
          actorId: input.authorUserId,
          actorDisplayName: author.displayName,
          actorLayer: input.audience,
          actorInitials: author.displayName
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 3)
            .toUpperCase(),
          actorAvatarUrl: null,
          content: input.content,
          publishedAt: input.now,
        })
        .returning();

      return created === undefined ? null : mapTimelineItemRow(created);
    },

    async insertSignalItems(
      items: readonly {
        id: string;
        actorId: string;
        actorDisplayName: string;
        actorInitials?: string;
        actorAvatarUrl?: string;
        content: string;
        publishedAt: Date;
      }[],
    ): Promise<void> {
      if (items.length === 0) return;

      await database
        .insert(timelineItems)
        .values(
          items.map((item) => ({
            id: item.id,
            ownerUserId: null,
            authorUserId: null,
            audience: null,
            actorId: item.actorId,
            actorDisplayName: item.actorDisplayName,
            actorLayer: "signal" as const,
            actorInitials: item.actorInitials ?? null,
            actorAvatarUrl: item.actorAvatarUrl ?? null,
            content: item.content,
            publishedAt: item.publishedAt,
          })),
        )
        .onConflictDoNothing();
    },

    async findByIdForViewer(
      timelineItemId: string,
      viewerUserId: string,
    ): Promise<TimelineItem | null> {
      const [row] = await database
        .select()
        .from(timelineItems)
        .where(
          and(
            eq(timelineItems.id, timelineItemId),
            visibleTimelineItemForViewer(database, viewerUserId),
          ),
        )
        .limit(1);

      return row === undefined ? null : mapTimelineItemRow(row);
    },
  };
}

export type TimelineItemRepository = ReturnType<
  typeof createTimelineItemRepository
>;
