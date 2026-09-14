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

import type { CloudForestLayer } from "@/types/cloudForest";
import type {
  CareGratitude,
  CarePersonId,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";
import {
  loadTimelineItemSnapshot,
  saveTimelineItemSnapshot,
} from "@/lib/timelineItemStorage";

import { CareOfferCard } from "./CareOfferCard";
import { CareGratitudeCard } from "./CareGratitudeCard";
import { CareRequestCard } from "./CareRequestCard";
import { TimelineCard, type TimelineCardItem } from "./TimelineCard";

const selectedTimelineItemId = "timeline-item-mira-soup-001";
const timelineApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

type RemoteTimelineItem = GetTimelineItemResponse["data"]["timelineItem"];
type TimelineLayerFilter = Exclude<CloudForestLayer, "self">;

type TimelineItemState =
  | { status: "loading" }
  | {
      status: "success";
      item: RemoteTimelineItem;
      source: "cache" | "live";
    }
  | { status: "empty" }
  | { status: "error"; recoverable: boolean };

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

function formatActivityTime(publishedAt: string) {
  return formatter.format(new Date(publishedAt)).replace(",", " ·");
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

function initialTimelineItemState(cacheOwnerId?: string): TimelineItemState {
  const cachedItem = cacheOwnerId
    ? loadTimelineItemSnapshot(cacheOwnerId)
    : undefined;
  return cachedItem
    ? { status: "success", item: cachedItem, source: "cache" }
    : { status: "loading" };
}

function useRemoteTimelineItem(
  apiClient: Pick<ApiClient, "getTimelineItem">,
  cacheOwnerId?: string,
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<TimelineItemState>(() =>
    initialTimelineItemState(cacheOwnerId),
  );

  useEffect(() => {
    let active = true;

    void apiClient
      .getTimelineItem({ timelineItemId: selectedTimelineItemId })
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          const item = result.value.data.timelineItem;
          saveTimelineItemSnapshot(cacheOwnerId ?? "", item);
          setState({ status: "success", item, source: "live" });
          return;
        }

        if (result.kind === "http" && result.status === 404) {
          setState({ status: "empty" });
          return;
        }

        const recoverable =
          result.kind === "network" ||
          (result.kind === "unexpected-response" && result.status >= 500);
        if (recoverable) {
          const cachedItem = cacheOwnerId
            ? loadTimelineItemSnapshot(cacheOwnerId)
            : undefined;
          if (cachedItem) {
            setState({ status: "success", item: cachedItem, source: "cache" });
            return;
          }
        }

        setState({ status: "error", recoverable });
      });

    return () => {
      active = false;
    };
  }, [apiClient, attempt, cacheOwnerId]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  return { retry, state };
}

function TimelineItemSlot({
  layerFilter,
  onRetry,
  state,
}: {
  layerFilter: TimelineLayerFilter | null;
  onRetry: () => void;
  state: TimelineItemState;
}) {
  if (state.status === "success") {
    const item = remoteTimelineItemToCardItem(state.item);
    if (layerFilter !== null && item.actor.layer !== layerFilter) {
      return (
        <div aria-live="polite" className="timeline-remote-state" role="status">
          No live Timeline item is available in this layer.
        </div>
      );
    }
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
    return (
      <div className="timeline-remote-state" role="alert">
        <span>One live Timeline item could not be loaded.</span>
        <button type="button" onClick={onRetry}>
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
  onOfflineChange,
  passableRequestIds = noPassableRequestIds,
  passAnnouncement,
  cacheOwnerId,
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
  onOfflineChange?: (offline: boolean) => void;
  passableRequestIds?: Set<string>;
  passAnnouncement?: string;
  cacheOwnerId?: string;
  viewerClaimedRequestIds?: Set<string>;
  viewerCompletedRequestIds?: Set<string>;
  otherParticipantCompletedRequestIds?: Set<string>;
  viewerId?: CarePersonId;
}) {
  const timelineItem = useRemoteTimelineItem(apiClient, cacheOwnerId);
  useEffect(() => {
    const timelineIsOffline =
      (timelineItem.state.status === "success" &&
        timelineItem.state.source === "cache") ||
      (timelineItem.state.status === "error" && timelineItem.state.recoverable);
    onOfflineChange?.(timelineIsOffline);
  }, [onOfflineChange, timelineItem.state]);
  const [careFilter, setCareFilter] = useState<"all" | "give" | "receive">(
    "all",
  );
  const [layerFilter, setLayerFilter] = useState<TimelineLayerFilter | null>(
    null,
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
  const toggleLayerFilter = (nextLayer: TimelineLayerFilter) => {
    setLayerFilter((current) => (current === nextLayer ? null : nextLayer));
    setCareFilter("all");
  };

  return (
    <div className="timeline-feed">
      <div aria-label="Relationship layers" className="timeline-layer-key">
        <button
          aria-label="Filter to Party"
          aria-pressed={layerFilter === "party"}
          className="timeline-key timeline-key--party"
          onClick={() => toggleLayerFilter("party")}
          type="button"
        >
          <UsersRound aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Tribe"
          aria-pressed={layerFilter === "tribe"}
          className="timeline-key timeline-key--tribe"
          onClick={() => toggleLayerFilter("tribe")}
          type="button"
        >
          <Sprout aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Guild"
          aria-pressed={layerFilter === "guild"}
          className="timeline-key timeline-key--guild"
          onClick={() => toggleLayerFilter("guild")}
          type="button"
        >
          <Building2 aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Signal"
          aria-pressed={layerFilter === "signal"}
          className="timeline-key timeline-key--signal"
          onClick={() => toggleLayerFilter("signal")}
          type="button"
        >
          <RadioTower aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Give offers"
          aria-pressed={careFilter === "give"}
          className="timeline-key timeline-key--give"
          onClick={() => {
            setLayerFilter(null);
            setCareFilter((current) => (current === "give" ? "all" : "give"));
          }}
          type="button"
        >
          <Gift aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Receive requests"
          aria-pressed={careFilter === "receive"}
          className="timeline-key timeline-key--receive"
          data-care-receive-filter
          onClick={() => {
            setLayerFilter(null);
            setCareFilter((current) =>
              current === "receive" ? "all" : "receive",
            );
          }}
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
            {layerFilter === null ? (
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
            ) : null}
            <TimelineItemSlot
              layerFilter={layerFilter}
              onRetry={timelineItem.retry}
              state={timelineItem.state}
            />
          </>
        )}
      </div>
    </div>
  );
}
