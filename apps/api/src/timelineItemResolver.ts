import {
  apiVersion,
  type CreateTimelinePostBody,
} from "@cloud-forest/api-contracts";
import type { TimelineItemRepository } from "@cloud-forest/database";

import type {
  CreateTimelinePostResolver,
  TimelineItemResolver,
  TimelineItemsResolver,
} from "./routes/timelineItem.ts";

export function createTimelineItemResolver(
  repository: TimelineItemRepository,
): TimelineItemResolver {
  return async ({ timelineItemId }, viewerUserId) => {
    const timelineItem = await repository.findByIdForViewer(
      timelineItemId,
      viewerUserId,
    );

    if (timelineItem === null) {
      return {
        statusCode: 404,
        body: {
          apiVersion,
          error: {
            code: "TIMELINE_ITEM_NOT_FOUND",
            message: "Timeline item not found.",
          },
        },
      };
    }

    return {
      statusCode: 200,
      body: {
        apiVersion,
        data: { timelineItem },
      },
    };
  };
}

export function createTimelineItemsResolver(
  repository: TimelineItemRepository,
  syncSignals: () => Promise<void> = async () => undefined,
): TimelineItemsResolver {
  return async (viewerUserId) => {
    await syncSignals();
    return {
      statusCode: 200,
      body: {
        apiVersion,
        data: {
          timelineItems: await repository.listForViewer(viewerUserId),
        },
      },
    };
  };
}

export function createTimelinePostResolver(
  repository: TimelineItemRepository,
): CreateTimelinePostResolver {
  return async (input: CreateTimelinePostBody, authorUserId) => {
    const timelineItem = await repository.createPost({
      authorUserId,
      content: input.content,
      audience: input.audience,
      now: new Date(),
    });

    if (timelineItem === null) {
      return {
        statusCode: 404,
        body: {
          apiVersion,
          error: {
            code: "TIMELINE_POST_NOT_FOUND",
            message: "Timeline post not found.",
          },
        },
      };
    }

    return {
      statusCode: 200,
      body: {
        apiVersion,
        data: { timelineItem },
      },
    };
  };
}
