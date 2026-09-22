import {
  Building2,
  Gift,
  HandHeart,
  HeartHandshake,
  Network,
  RadioTower,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  timelineApiClient,
  type TimelineApiClient,
  type TimelineError,
  type TimelineItemState,
  type RemoteTimelineItem,
} from "./timelineClient";
import { useTimelineItems } from "./useTimelineItems";
import { TimelinePostComposer } from "./TimelinePostComposer";
export type { TimelineApiClient, TimelineError } from "./timelineClient";

import type { Care, CarePersonId } from "@/types/care";
import { CareCard } from "../care/CareCard";
import { TimelineCard } from "./TimelineCard";

type TimelineLayerFilter = RemoteTimelineItem["actor"]["layer"];

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

function formatActivityTime(publishedAt: string) {
  return formatter.format(new Date(publishedAt)).replace(",", " ·");
}

type CareListingCardProps = {
  minimizedCareIds: Set<string>;
  onOpenCareDetails?: (care: Care) => void;
  onCommitToCare?: (care: Care) => void;
  onRecordCompleted?: (care: Care) => void;
  onRecordNotCompleted?: (care: Care) => void;
  onPass?: (care: Care) => void;
  onSetCareMinimized?: (careId: string, minimized: boolean) => void;
  onWithdraw?: (careId: string) => void;
  passableCareIds: Set<string>;
  viewerId: CarePersonId;
};

const noMinimizedCareIds = new Set<string>();
const noPassableCareIds = new Set<string>();

function CareListingCard({
  listing,
  ...props
}: CareListingCardProps & { listing: Care }) {
  return (
    <CareCard
      presentation="leaf"
      onOpenDetails={props.onOpenCareDetails}
      canPass={props.passableCareIds.has(listing.id)}
      care={listing}
      minimized={props.minimizedCareIds.has(listing.id)}
      onCommitToCare={props.onCommitToCare}
      onRecordCompleted={props.onRecordCompleted}
      onRecordNotCompleted={props.onRecordNotCompleted}
      onPass={props.onPass}
      onSetMinimized={props.onSetCareMinimized}
      onWithdraw={props.onWithdraw}
      viewerId={props.viewerId}
    />
  );
}

function CareListings({
  listings,
  ...props
}: CareListingCardProps & { listings: Care[] }) {
  return listings.map((listing) => (
    <CareListingCard key={listing.id} listing={listing} {...props} />
  ));
}

function TimelineErrorBanner({
  errors,
  onRetry,
}: {
  errors: TimelineError[];
  onRetry?: () => void;
}) {
  if (errors.length === 0) return null;

  const codes = [...new Set(errors.map((error) => String(error.code)))].join(
    ", ",
  );
  const messages = [...new Set(errors.map((error) => error.message))].join(" ");

  return (
    <div aria-live="assertive" className="timeline-error-banner" role="alert">
      <strong>Error {codes}</strong>
      <span className="timeline-error-banner__message">{messages}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

function TimelineItemSlot({
  layerFilter,
  state,
}: {
  layerFilter: TimelineLayerFilter | null;
  state: TimelineItemState;
}) {
  if (state.status === "success") {
    const items = state.items.filter(
      (item) => layerFilter === null || item.actor.layer === layerFilter,
    );
    if (items.length === 0) {
      return (
        <div aria-live="polite" className="timeline-remote-state" role="status">
          {layerFilter === null
            ? "No Timeline posts yet."
            : "No Timeline posts are available in this layer."}
        </div>
      );
    }
    return (
      <>
        {items.map((remoteItem) => {
          const item = remoteItem;
          return (
            <TimelineCard
              item={item}
              key={item.id}
              time={formatActivityTime(item.publishedAt)}
            />
          );
        })}
      </>
    );
  }

  if (state.status === "empty") {
    return (
      <div aria-live="polite" className="timeline-remote-state" role="status">
        No Timeline posts yet.
      </div>
    );
  }

  if (state.status === "error") {
    return null;
  }

  return (
    <div aria-live="polite" className="timeline-remote-state" role="status">
      Loading Timeline…
    </div>
  );
}

type TimelineActivity =
  | { kind: "post"; item: RemoteTimelineItem }
  | { kind: "care-listing"; listing: Care };

function timelineActivityTime(activity: TimelineActivity) {
  if (activity.kind === "post") {
    return new Date(activity.item.publishedAt).getTime();
  }
  return new Date(activity.listing.createdAt).getTime();
}

function timelineActivityKey(activity: TimelineActivity) {
  if (activity.kind === "post") return `post-${activity.item.id}`;
  return `care-listing-${activity.listing.id}`;
}

function TimelineActivityCard({
  activity,
  careListingCardProps,
}: {
  activity: TimelineActivity;
  careListingCardProps: CareListingCardProps;
}) {
  if (activity.kind === "post") {
    const item = activity.item;
    return (
      <TimelineCard item={item} time={formatActivityTime(item.publishedAt)} />
    );
  }
  return (
    <CareListingCard listing={activity.listing} {...careListingCardProps} />
  );
}

function TimelineActivitySlot({
  careListingCardProps,
  careListings,
  state,
}: {
  careListingCardProps: CareListingCardProps;
  careListings: Care[];
  state: TimelineItemState;
}) {
  const activities: TimelineActivity[] = [
    ...careListings.map((listing) => ({
      kind: "care-listing" as const,
      listing,
    })),
    ...(state.status === "success"
      ? state.items.map((item) => ({ kind: "post" as const, item }))
      : []),
  ].sort(
    (first, second) =>
      timelineActivityTime(second) - timelineActivityTime(first),
  );

  const activityCards = activities.map((activity) => (
    <TimelineActivityCard
      activity={activity}
      careListingCardProps={careListingCardProps}
      key={timelineActivityKey(activity)}
    />
  ));

  if (state.status === "success" || state.status === "empty") {
    if (activities.length > 0) return <>{activityCards}</>;
    return (
      <div aria-live="polite" className="timeline-remote-state" role="status">
        No Timeline posts yet.
      </div>
    );
  }

  if (state.status === "error") {
    return <>{activityCards}</>;
  }

  return (
    <>
      {activityCards}
      <div aria-live="polite" className="timeline-remote-state" role="status">
        Loading Timeline…
      </div>
    </>
  );
}

export function TimelinePanel({
  apiClient = timelineApiClient,
  cares = [],
  careError,
  minimizedCareIds = noMinimizedCareIds,
  onOpenCareDetails,
  onCommitToCare,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetCareMinimized,
  onWithdraw,
  onOfflineChange,
  passableCareIds = noPassableCareIds,
  passAnnouncement,
  cacheOwnerId,
  viewerId = "you",
  offline = false,
  postComposerOpen = false,
  onClosePostComposer = () => undefined,
}: {
  apiClient?: TimelineApiClient;
  cares?: Care[];
  careError?: TimelineError;
  minimizedCareIds?: Set<string>;
  onOpenCareDetails?: (care: Care) => void;
  onCommitToCare?: (care: Care) => void;
  onRecordCompleted?: (care: Care) => void;
  onRecordNotCompleted?: (care: Care) => void;
  onPass?: (care: Care) => void;
  onSetCareMinimized?: (careId: string, minimized: boolean) => void;
  onWithdraw?: (careId: string) => void;
  onOfflineChange?: (offline: boolean) => void;
  passableCareIds?: Set<string>;
  passAnnouncement?: string;
  cacheOwnerId?: string;
  viewerId?: CarePersonId;
  offline?: boolean;
  postComposerOpen?: boolean;
  onClosePostComposer?: () => void;
}) {
  const timelineItems = useTimelineItems(apiClient, cacheOwnerId);
  const timelineIsOffline =
    offline ||
    (timelineItems.state.status === "success" && timelineItems.state.offline) ||
    (timelineItems.state.status === "error" && timelineItems.state.recoverable);
  const timelineStateError =
    timelineItems.state.status === "error" ||
    timelineItems.state.status === "success"
      ? timelineItems.state.error
      : undefined;
  useEffect(() => {
    onOfflineChange?.(timelineIsOffline);
  }, [onOfflineChange, timelineIsOffline]);
  const [careFilter, setCareFilter] = useState<"all" | "give" | "receive">(
    "all",
  );
  const [layerFilter, setLayerFilter] = useState<TimelineLayerFilter | null>(
    null,
  );
  const careListings = [...cares];
  careListings.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
  const visibleCareListings = careListings.filter(
    (listing) => careFilter === "all" || listing.direction === careFilter,
  );
  const showCareListingsOnly = careFilter !== "all";
  const toggleLayerFilter = (nextLayer: TimelineLayerFilter) => {
    setLayerFilter((current) => (current === nextLayer ? null : nextLayer));
    setCareFilter("all");
  };
  const careListingCardProps: CareListingCardProps = {
    minimizedCareIds,
    onOpenCareDetails,
    onCommitToCare,
    onRecordCompleted,
    onRecordNotCompleted,
    onPass,
    onSetCareMinimized,
    onWithdraw,
    passableCareIds,
    viewerId,
  };

  return (
    <div className="timeline-feed">
      {postComposerOpen ? (
        <TimelinePostComposer
          apiClient={apiClient}
          disabled={timelineIsOffline}
          onClose={onClosePostComposer}
          onPublished={(item) => {
            timelineItems.addPublishedItem(item);
            onClosePostComposer();
          }}
        />
      ) : null}
      <TimelineErrorBanner
        errors={[
          ...(careError ? [careError] : []),
          ...(timelineStateError ? [timelineStateError] : []),
        ]}
        onRetry={timelineStateError ? timelineItems.retry : undefined}
      />
      <div aria-label="Relationship layers" className="timeline-layer-key">
        <button
          aria-label="Filter to Party"
          aria-pressed={layerFilter === "party"}
          className="timeline-key timeline-key--party"
          onClick={() => toggleLayerFilter("party")}
          type="button"
        >
          <HeartHandshake aria-hidden="true" />
        </button>
        <button
          aria-label="Filter to Tribe"
          aria-pressed={layerFilter === "tribe"}
          className="timeline-key timeline-key--tribe"
          onClick={() => toggleLayerFilter("tribe")}
          type="button"
        >
          <Network aria-hidden="true" />
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
          aria-label="Filter to Give Care"
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
          aria-label="Filter to Receive Care"
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
        {showCareListingsOnly ? (
          visibleCareListings.length > 0 ? (
            <CareListings
              {...careListingCardProps}
              listings={visibleCareListings}
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
        ) : layerFilter === null ? (
          <TimelineActivitySlot
            careListingCardProps={careListingCardProps}
            careListings={careListings}
            state={timelineItems.state}
          />
        ) : (
          <TimelineItemSlot
            layerFilter={layerFilter}
            state={timelineItems.state}
          />
        )}
      </div>
    </div>
  );
}
