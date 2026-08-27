import {
  createApiClient,
  type GetTimelineItemResult,
  type HealthResult,
} from "../src/index.ts";

const client = createApiClient({ baseUrl: "https://api.example.test" });

const healthResult: Promise<HealthResult> = client.getHealth();
const timelineItemResult: Promise<GetTimelineItemResult> =
  client.getTimelineItem({ timelineItemId: "timeline-item-001" });

void healthResult;
void timelineItemResult;
