import {
  createApiClient,
  type ApiClient,
  type GetTimelineItemResponse,
} from "@cloud-forest/api-client";
import {
  Building2,
  Gift,
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
import type {
  CareGratitude,
  CarePersonId,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";

import { CareOfferCard } from "./CareOfferCard";
import { CareGratitudeCard } from "./CareGratitudeCard";
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

type CareListing =
  | { kind: "give"; item: GiveCareOffer }
  | { kind: "receive"; item: ReceiveCareRequest };

const noClaimedRequestIds = new Set<string>();
const noMinimizedRequestIds = new Set<string>();
const noPassableRequestIds = new Set<string>();
const noCompletedRequestIds = new Set<string>();

function CareListings({
  claimedRequestIds,
  listings,
  minimizedRequestIds,
  onOfferHelp,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetRequestMinimized,
  onWithdraw,
  onWithdrawOffer,
  passableRequestIds,
  viewerClaimedRequestIds,
  viewerCompletedRequestIds,
  otherParticipantCompletedRequestIds,
  viewerId,
}: {
  claimedRequestIds: Set<string>;
  listings: CareListing[];
  minimizedRequestIds: Set<string>;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onRecordCompleted: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
  onWithdraw: (requestId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  passableRequestIds: Set<string>;
  viewerClaimedRequestIds: Set<string>;
  viewerCompletedRequestIds: Set<string>;
  otherParticipantCompletedRequestIds: Set<string>;
  viewerId: CarePersonId;
}) {
  return listings.map((listing) =>
    listing.kind === "give" ? (
      <CareOfferCard
        key={listing.item.id}
        offer={listing.item}
        onWithdraw={onWithdrawOffer}
      />
    ) : (
      <CareRequestCard
        canPass={passableRequestIds.has(listing.item.id)}
        claimed={claimedRequestIds.has(listing.item.id)}
        key={listing.item.id}
        minimized={minimizedRequestIds.has(listing.item.id)}
        onOfferHelp={onOfferHelp}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onPass={onPass}
        onSetMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        request={listing.item}
        viewerId={viewerId}
        viewerCompletion={
          viewerCompletedRequestIds.has(listing.item.id)
            ? "completed"
            : undefined
        }
        viewerIsClaimer={viewerClaimedRequestIds.has(listing.item.id)}
        otherParticipantCompleted={otherParticipantCompletedRequestIds.has(
          listing.item.id,
        )}
      />
    ),
  );
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
  careGratitudes = [],
  careOffers = [],
  careRequests = [],
  careGratitudeRequests = careRequests,
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onRecordCompleted = () => undefined,
  onRecordNotCompleted = () => undefined,
  onPass = () => undefined,
  onSetRequestMinimized = () => undefined,
  onWithdraw = () => undefined,
  onWithdrawOffer = () => undefined,
  passableRequestIds = noPassableRequestIds,
  passAnnouncement,
  viewerClaimedRequestIds = noClaimedRequestIds,
  viewerCompletedRequestIds = noCompletedRequestIds,
  otherParticipantCompletedRequestIds = noCompletedRequestIds,
  viewerId = "you",
}: {
  apiClient?: Pick<ApiClient, "getTimelineItem">;
  careGratitudes?: CareGratitude[];
  careGratitudeRequests?: ReceiveCareRequest[];
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  passableRequestIds?: Set<string>;
  passAnnouncement?: string;
  viewerClaimedRequestIds?: Set<string>;
  viewerCompletedRequestIds?: Set<string>;
  otherParticipantCompletedRequestIds?: Set<string>;
  viewerId?: CarePersonId;
}) {
  const [careFilter, setCareFilter] = useState<"all" | "give" | "receive">(
    "all",
  );
  const careListings = [
    ...careOffers.map((offer) => ({ kind: "give" as const, item: offer })),
    ...careRequests.map((request) => ({
      kind: "receive" as const,
      item: request,
    })),
  ].sort(
    (first, second) =>
      new Date(second.item.createdAt).getTime() -
      new Date(first.item.createdAt).getTime(),
  );
  const visibleCareListings = careListings.filter(
    (listing) => careFilter === "all" || listing.kind === careFilter,
  );
  const showCareListingsOnly = careFilter !== "all";
  const todayActivities = visibleActivities.filter((activity) =>
    isToday(activity.publishedAt),
  );
  const yesterdayActivities = visibleActivities.filter(
    (activity) => !isToday(activity.publishedAt),
  );

  return (
    <div className="timeline-feed">
      <div aria-label="Relationship layers" className="timeline-layer-key">
        <span className="timeline-key timeline-key--party">
          <UsersRound />
        </span>
        <span className="timeline-key timeline-key--tribe">
          <Sprout />
        </span>
        <span className="timeline-key timeline-key--guild">
          <Building2 />
        </span>
        <span className="timeline-key timeline-key--signal">
          <RadioTower />
        </span>
        <button
          aria-label="Filter to Give offers"
          aria-pressed={careFilter === "give"}
          className="timeline-key timeline-key--give"
          onClick={() =>
            setCareFilter((current) => (current === "give" ? "all" : "give"))
          }
          type="button"
        >
          <Gift aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Receive requests"
          aria-pressed={careFilter === "receive"}
          className="timeline-key timeline-key--receive"
          data-care-receive-filter
          onClick={() =>
            setCareFilter((current) =>
              current === "receive" ? "all" : "receive",
            )
          }
          type="button"
        >
          <HandHeart aria-hidden="true" />
        </button>
      </div>
      {passAnnouncement ? (
        <p aria-live="polite" className="care-pass-announcement" role="status">
          {passAnnouncement}
        </p>
      ) : null}
      <div className="timeline-list">
        {!showCareListingsOnly
          ? careGratitudes.map((gratitude) => {
              const request = careGratitudeRequests.find(
                (candidate) => candidate.id === gratitude.requestId,
              );
              return request ? (
                <CareGratitudeCard
                  gratitude={gratitude}
                  key={gratitude.id}
                  request={request}
                />
              ) : null;
            })
          : null}
        {showCareListingsOnly ? (
          visibleCareListings.length > 0 ? (
            <CareListings
              claimedRequestIds={claimedRequestIds}
              listings={visibleCareListings}
              minimizedRequestIds={minimizedRequestIds}
              onOfferHelp={onOfferHelp}
              onRecordCompleted={onRecordCompleted}
              onRecordNotCompleted={onRecordNotCompleted}
              onPass={onPass}
              onSetRequestMinimized={onSetRequestMinimized}
              onWithdraw={onWithdraw}
              onWithdrawOffer={onWithdrawOffer}
              passableRequestIds={passableRequestIds}
              viewerClaimedRequestIds={viewerClaimedRequestIds}
              viewerCompletedRequestIds={viewerCompletedRequestIds}
              otherParticipantCompletedRequestIds={
                otherParticipantCompletedRequestIds
              }
              viewerId={viewerId}
            />
          ) : (
            <div
              aria-live="polite"
              className="timeline-remote-state"
              role="status"
            >
              No care listings yet.
            </div>
          )
        ) : (
          <>
            <CareListings
              claimedRequestIds={claimedRequestIds}
              listings={careListings}
              minimizedRequestIds={minimizedRequestIds}
              onOfferHelp={onOfferHelp}
              onRecordCompleted={onRecordCompleted}
              onRecordNotCompleted={onRecordNotCompleted}
              onPass={onPass}
              onSetRequestMinimized={onSetRequestMinimized}
              onWithdraw={onWithdraw}
              onWithdrawOffer={onWithdrawOffer}
              passableRequestIds={passableRequestIds}
              viewerClaimedRequestIds={viewerClaimedRequestIds}
              viewerCompletedRequestIds={viewerCompletedRequestIds}
              otherParticipantCompletedRequestIds={
                otherParticipantCompletedRequestIds
              }
              viewerId={viewerId}
            />
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
