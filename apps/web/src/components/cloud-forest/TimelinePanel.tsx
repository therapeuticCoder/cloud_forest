import {
  createApiClient,
  type ApiClient,
  type GetTimelineItemResponse,
} from "@cloud-forest/api-client";
import {
  Building2,
  HandHeart,
  RadioTower,
  Sprout,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  activityActors,
  cloudForestActivities,
  mockNowIso,
} from "@/data/cloudForestMockData";
import type { CloudForestActivity } from "@/types/cloudForest";
import type { ReceiveCareRequest } from "@/types/careRequest";

import { CareRequestCard } from "./CareRequestCard";
import { TimelineCard, type TimelineCardItem } from "./TimelineCard";

const actorsById = new Map(activityActors.map((actor) => [actor.id, actor]));
const selectedTimelineItemId = "timeline-item-mira-soup-001";
const visibleActivityIds = ["p2", "g1", "s1", "t2", "p4", "g2", "s2"];
const visibleActivities = visibleActivityIds
  .map((id) => cloudForestActivities.find((activity) => activity.id === id))
  .filter(
    (activity): activity is CloudForestActivity => activity !== undefined,
  );
const timelineApiClient = createApiClient({ baseUrl: "" });

type RemoteTimelineItem = GetTimelineItemResponse["data"]["timelineItem"];

type TimelineItemState =
  | { status: "loading" }
  | { status: "success"; item: RemoteTimelineItem }
  | { status: "empty" }
  | { status: "error" };

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

function formatActivityTime(publishedAt: string) {
  return formatter.format(new Date(publishedAt)).replace(",", " ·");
}

function isToday(publishedAt: string) {
  const current = new Date(mockNowIso);
  const published = new Date(publishedAt);

  return (
    current.getUTCFullYear() === published.getUTCFullYear() &&
    current.getUTCMonth() === published.getUTCMonth() &&
    current.getUTCDate() === published.getUTCDate()
  );
}

function mockActivityToCardItem(
  activity: CloudForestActivity,
): TimelineCardItem | null {
  const actor = actorsById.get(activity.actorId);
  if (!actor) return null;

  return {
    id: activity.id,
    actor,
    content: activity.content,
    publishedAt: activity.publishedAt,
  };
}

function remoteTimelineItemToCardItem(
  item: RemoteTimelineItem,
): TimelineCardItem {
  return {
    id: item.id,
    actor: {
      ...item.actor,
      sourceType:
        item.actor.layer === "party" || item.actor.layer === "tribe"
          ? "person"
          : "system",
    },
    content: item.content,
    publishedAt: item.publishedAt,
  };
}

function ActivityList({ activities }: { activities: CloudForestActivity[] }) {
  return activities.map((activity) => {
    const item = mockActivityToCardItem(activity);
    if (!item) return null;

    return (
      <TimelineCard
        key={activity.id}
        item={item}
        time={formatActivityTime(activity.publishedAt)}
      />
    );
  });
}

function RemoteTimelineSlot({
  apiClient,
}: {
  apiClient: Pick<ApiClient, "getTimelineItem">;
}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<TimelineItemState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    void apiClient
      .getTimelineItem({ timelineItemId: selectedTimelineItemId })
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          setState({
            status: "success",
            item: result.value.data.timelineItem,
          });
        } else if (result.kind === "http" && result.status === 404) {
          setState({ status: "empty" });
        } else {
          setState({ status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [apiClient, attempt]);

  if (state.status === "success") {
    const item = remoteTimelineItemToCardItem(state.item);
    return (
      <TimelineCard item={item} time={formatActivityTime(item.publishedAt)} />
    );
  }

  if (state.status === "empty") {
    return (
      <div aria-live="polite" className="timeline-remote-state" role="status">
        No live Timeline item is available.
      </div>
    );
  }

  if (state.status === "error") {
    const retry = () => {
      setState({ status: "loading" });
      setAttempt((value) => value + 1);
    };

    return (
      <div className="timeline-remote-state" role="alert">
        <span>One live Timeline item could not be loaded.</span>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div aria-live="polite" className="timeline-remote-state" role="status">
      Loading one live Timeline item…
    </div>
  );
}

export function TimelinePanel({
  apiClient = timelineApiClient,
  careRequests = [],
  onWithdraw = () => undefined,
}: {
  apiClient?: Pick<ApiClient, "getTimelineItem">;
  careRequests?: ReceiveCareRequest[];
  onWithdraw?: (requestId: string) => void;
}) {
  const [showCareRequestsOnly, setShowCareRequestsOnly] = useState(false);
  const todayActivities = visibleActivities.filter((activity) =>
    isToday(activity.publishedAt),
  );
  const yesterdayActivities = visibleActivities.filter(
    (activity) => !isToday(activity.publishedAt),
  );

  return (
    <div className="timeline-feed">
      <div aria-label="Relationship layers" className="timeline-layer-key">
        <span className="timeline-key--party">
          <UsersRound />
        </span>
        <span className="timeline-key--tribe">
          <Sprout />
        </span>
        <span className="timeline-key--guild">
          <Building2 />
        </span>
        <span className="timeline-key--signal">
          <RadioTower />
        </span>
        <button
          aria-label="Filter to Receive care requests"
          aria-pressed={showCareRequestsOnly}
          className="timeline-key--receive"
          onClick={() => setShowCareRequestsOnly((current) => !current)}
          type="button"
        >
          <HandHeart aria-hidden="true" />
        </button>
      </div>
      <div className="timeline-list">
        {showCareRequestsOnly ? (
          careRequests.length > 0 ? (
            careRequests.map((request) => (
              <CareRequestCard
                key={request.id}
                onWithdraw={onWithdraw}
                request={request}
              />
            ))
          ) : (
            <div
              aria-live="polite"
              className="timeline-remote-state"
              role="status"
            >
              No open care requests.
            </div>
          )
        ) : (
          <>
            {careRequests.map((request) => (
              <CareRequestCard
                key={request.id}
                onWithdraw={onWithdraw}
                request={request}
              />
            ))}
            <RemoteTimelineSlot apiClient={apiClient} />
            <ActivityList activities={todayActivities} />
            <div className="timeline-day-divider" role="separator">
              <span>Yesterday</span>
            </div>
            <ActivityList activities={yesterdayActivities} />
          </>
        )}
      </div>
    </div>
  );
}
