import { apiVersion } from "@cloud-forest/api-contracts";
import type { TimelineItemRepository } from "@cloud-forest/database";

import type { TimelineItemResolver } from "./routes/timelineItem.ts";

export function createTimelineItemResolver(
  repository: TimelineItemRepository,
): TimelineItemResolver {
  return async ({ timelineItemId }) => {
    const timelineItem = await repository.findById(timelineItemId);

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
