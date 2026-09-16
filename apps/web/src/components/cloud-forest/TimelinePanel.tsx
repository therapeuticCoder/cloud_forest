import {
  createApiClient,
  type ApiClient,
  type CreateTimelinePostResult,
  type GetTimelineItemResponse,
  type GetTimelineItemsResult,
} from "@cloud-forest/api-client";
import {
  Building2,
  ChevronDown,
  Gift,
  HandHeart,
  RadioTower,
  Sprout,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import type { CloudForestLayer } from "@/types/cloudForest";
import type {
  CareGratitude,
  CarePersonId,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";
import {
  clearTimelineItemSnapshot,
  loadTimelineItemsSnapshot,
  saveTimelineItemsSnapshot,
} from "@/lib/timelineItemStorage";

import { CareOfferCard } from "./CareOfferCard";
import { CareGratitudeCard } from "./CareGratitudeCard";
import { CareRequestCard } from "./CareRequestCard";
import { TimelineCard, type TimelineCardItem } from "./TimelineCard";

const timelineApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

type RemoteTimelineItem = GetTimelineItemResponse["data"]["timelineItem"];
type TimelineItemsFailure = Extract<GetTimelineItemsResult, { ok: false }>;
type TimelineLayerFilter = Exclude<CloudForestLayer, "self">;

const timelineAudienceOptions = [
  { value: "party", label: "Party" },
  { value: "tribe", label: "Tribe" },
] as const;
type TimelineAudience = (typeof timelineAudienceOptions)[number]["value"];

export type TimelineApiClient = Partial<
  Pick<ApiClient, "createTimelinePost" | "getTimelineItems">
>;

type TimelineItemState =
  | { status: "loading" }
  | {
      status: "success";
      items: readonly RemoteTimelineItem[];
      source: "cache" | "live";
      offline: boolean;
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

type CareListingCardProps = {
  claimedRequestIds: Set<string>;
  onClaimOffer?: (offerId: string) => void;
  minimizedRequestIds: Set<string>;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  passableRequestIds: Set<string>;
  viewerClaimedRequestIds: Set<string>;
  viewerCompletedRequestIds: Set<string>;
  otherParticipantCompletedRequestIds: Set<string>;
  viewerId: CarePersonId;
};

const noClaimedRequestIds = new Set<string>();
const noMinimizedRequestIds = new Set<string>();
const noPassableRequestIds = new Set<string>();
const noCompletedRequestIds = new Set<string>();

function CareListingCard({
  listing,
  ...props
}: CareListingCardProps & { listing: CareListing }) {
  if (listing.kind === "give") {
    return (
      <CareOfferCard
        offer={listing.item}
        onClaim={props.onClaimOffer}
        onWithdraw={props.onWithdrawOffer}
        viewerId={props.viewerId}
      />
    );
  }

  return (
    <CareRequestCard
      canPass={props.passableRequestIds.has(listing.item.id)}
      claimed={props.claimedRequestIds.has(listing.item.id)}
      minimized={props.minimizedRequestIds.has(listing.item.id)}
      onOfferHelp={props.onOfferHelp}
      onRecordCompleted={props.onRecordCompleted}
      onRecordNotCompleted={props.onRecordNotCompleted}
      onPass={props.onPass}
      onSetMinimized={props.onSetRequestMinimized}
      onWithdraw={props.onWithdraw}
      request={listing.item}
      viewerId={props.viewerId}
      viewerCompletion={
        props.viewerCompletedRequestIds.has(listing.item.id)
          ? "completed"
          : undefined
      }
      viewerIsClaimer={props.viewerClaimedRequestIds.has(listing.item.id)}
      otherParticipantCompleted={props.otherParticipantCompletedRequestIds.has(
        listing.item.id,
      )}
    />
  );
}

function CareListings({
  listings,
  ...props
}: CareListingCardProps & { listings: CareListing[] }) {
  return listings.map((listing) => (
    <CareListingCard key={listing.item.id} listing={listing} {...props} />
  ));
}

function initialTimelineItemsState(cacheOwnerId?: string): TimelineItemState {
  const cachedItems = cacheOwnerId
    ? loadTimelineItemsSnapshot(cacheOwnerId)
    : undefined;
  return cachedItems
    ? {
        status: "success",
        items: cachedItems,
        source: "cache",
        offline: false,
      }
    : { status: "loading" };
}

function useRemoteTimelineItems(
  apiClient: TimelineApiClient,
  cacheOwnerId?: string,
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<TimelineItemState>(() =>
    initialTimelineItemsState(cacheOwnerId),
  );
  useEffect(() => {
    let active = true;

    const applyFailure = (result: TimelineItemsFailure) => {
      if (!active) return;

      if (result.kind === "unexpected-response" && result.status === 404) {
        clearTimelineItemSnapshot(cacheOwnerId ?? "");
        setState({ status: "empty" });
        return;
      }

      if (result.kind === "http" && result.status === 401) {
        clearTimelineItemSnapshot(cacheOwnerId ?? "");
      }

      const recoverable =
        result.kind === "network" ||
        (result.kind === "unexpected-response" && result.status >= 500);
      if (recoverable) {
        const cachedItems = cacheOwnerId
          ? loadTimelineItemsSnapshot(cacheOwnerId)
          : undefined;
        if (cachedItems) {
          setState({
            status: "success",
            items: cachedItems,
            source: "cache",
            offline: true,
          });
          return;
        }
      }

      setState({ status: "error", recoverable });
    };

    if (apiClient.getTimelineItems) {
      void apiClient.getTimelineItems().then((result) => {
        if (!active) return;
        if (result.ok) {
          const items = result.value.data.timelineItems;
          saveTimelineItemsSnapshot(cacheOwnerId ?? "", [...items]);
          setState({
            status: "success",
            items,
            source: "live",
            offline: false,
          });
          return;
        }
        applyFailure(result);
      });
    }

    return () => {
      active = false;
    };
  }, [apiClient, attempt, cacheOwnerId]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  const addPublishedItem = (item: RemoteTimelineItem) => {
    setState((current) => {
      const items =
        current.status === "success"
          ? [
              item,
              ...current.items.filter((candidate) => candidate.id !== item.id),
            ]
          : [item];
      items.sort(
        (first, second) =>
          new Date(second.publishedAt).getTime() -
          new Date(first.publishedAt).getTime(),
      );
      saveTimelineItemsSnapshot(cacheOwnerId ?? "", items);
      return { status: "success", items, source: "live", offline: false };
    });
  };

  return { addPublishedItem, retry, state };
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
          const item = remoteTimelineItemToCardItem(remoteItem);
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
    return (
      <div className="timeline-remote-state" role="alert">
        <span>Live Timeline posts could not be loaded.</span>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div aria-live="polite" className="timeline-remote-state" role="status">
      Loading Timeline…
    </div>
  );
}

type TimelineActivity =
  | { kind: "post"; item: RemoteTimelineItem }
  | { kind: "care-listing"; listing: CareListing }
  | {
      kind: "care-gratitude";
      gratitude: CareGratitude;
      request: ReceiveCareRequest;
    };

function timelineActivityTime(activity: TimelineActivity) {
  if (activity.kind === "post") {
    return new Date(activity.item.publishedAt).getTime();
  }
  if (activity.kind === "care-listing") {
    return new Date(activity.listing.item.createdAt).getTime();
  }
  return new Date(activity.gratitude.createdAt).getTime();
}

function timelineActivityKey(activity: TimelineActivity) {
  if (activity.kind === "post") return `post-${activity.item.id}`;
  if (activity.kind === "care-listing") {
    return `care-listing-${activity.listing.item.id}`;
  }
  return `care-gratitude-${activity.gratitude.id}`;
}

function TimelineActivityCard({
  activity,
  careListingCardProps,
}: {
  activity: TimelineActivity;
  careListingCardProps: CareListingCardProps;
}) {
  if (activity.kind === "post") {
    const item = remoteTimelineItemToCardItem(activity.item);
    return (
      <TimelineCard item={item} time={formatActivityTime(item.publishedAt)} />
    );
  }
  if (activity.kind === "care-listing") {
    return (
      <CareListingCard listing={activity.listing} {...careListingCardProps} />
    );
  }
  return (
    <CareGratitudeCard
      gratitude={activity.gratitude}
      request={activity.request}
    />
  );
}

function TimelineActivitySlot({
  careGratitudes,
  careGratitudeRequests,
  careListingCardProps,
  careListings,
  onRetry,
  state,
}: {
  careGratitudes: CareGratitude[];
  careGratitudeRequests: ReceiveCareRequest[];
  careListingCardProps: CareListingCardProps;
  careListings: CareListing[];
  onRetry: () => void;
  state: TimelineItemState;
}) {
  const activities: TimelineActivity[] = [
    ...careListings.map((listing) => ({
      kind: "care-listing" as const,
      listing,
    })),
    ...careGratitudes.flatMap((gratitude) => {
      const request = careGratitudeRequests.find(
        (candidate) => candidate.id === gratitude.requestId,
      );
      return request
        ? [{ kind: "care-gratitude" as const, gratitude, request }]
        : [];
    }),
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
    return (
      <>
        {activityCards}
        <div className="timeline-remote-state" role="alert">
          <span>Live Timeline posts could not be loaded.</span>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      </>
    );
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

function TimelinePostComposer({
  apiClient,
  disabled,
  onClose,
  onPublished,
}: {
  apiClient: TimelineApiClient;
  disabled: boolean;
  onClose: () => void;
  onPublished: (item: RemoteTimelineItem) => void;
}) {
  const bodyId = useId();
  const audienceId = useId();
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<TimelineAudience>("party");
  const [audienceMenuOpen, setAudienceMenuOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const audienceOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const audienceTriggerRef = useRef<HTMLButtonElement>(null);
  const createTimelinePost = apiClient.createTimelinePost;

  useEffect(() => {
    if (!audienceMenuOpen) return;

    const selectedIndex = timelineAudienceOptions.findIndex(
      (option) => option.value === audience,
    );
    audienceOptionRefs.current[selectedIndex]?.focus();
  }, [audience, audienceMenuOpen]);

  if (createTimelinePost === undefined) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled || pending) return;

    setPending(true);
    setError(undefined);
    const result: CreateTimelinePostResult = await createTimelinePost({
      content: trimmedContent,
      audience,
    });
    if (result.ok) {
      onPublished(result.value.data.timelineItem);
      setContent("");
    } else if (result.kind === "http") {
      setError(result.error.error.message);
    } else if (result.kind === "network") {
      setError(
        "Cloud Forest could not publish this post. Reconnect and try again.",
      );
    } else {
      setError("Cloud Forest could not publish this post. Try again.");
    }
    setPending(false);
  };

  return (
    <div
      className="timeline-post-composer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        aria-labelledby={`${bodyId}-title`}
        aria-modal="true"
        className="timeline-post-composer"
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        onSubmit={submit}
        role="dialog"
      >
        <div className="timeline-post-composer__header">
          <div className="timeline-post-composer__title">
            <h2 id={`${bodyId}-title`}>Write a post</h2>
            <p
              aria-live="polite"
              className="timeline-post-composer__character-count"
            >
              {content.length}/280
            </p>
          </div>
          <button
            aria-label="Close post composer"
            className="timeline-post-composer__close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <textarea
          aria-label="Post"
          aria-describedby={disabled ? `${bodyId}-offline` : undefined}
          autoFocus
          disabled={disabled || pending}
          id={bodyId}
          maxLength={280}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share something with your people"
          rows={3}
          value={content}
        />
        <div className="timeline-post-composer__controls">
          <div className="timeline-post-composer__audience">
            <label htmlFor={audienceId}>Audience</label>
            <div className="timeline-post-composer__audience-control">
              <button
                aria-controls={`${audienceId}-options`}
                aria-expanded={audienceMenuOpen}
                aria-haspopup="listbox"
                className="timeline-post-composer__audience-trigger"
                disabled={disabled || pending}
                id={audienceId}
                onClick={() => setAudienceMenuOpen((open) => !open)}
                onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                  if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowUp" ||
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    setAudienceMenuOpen(true);
                  } else if (event.key === "Escape" && audienceMenuOpen) {
                    event.preventDefault();
                    event.stopPropagation();
                    setAudienceMenuOpen(false);
                  }
                }}
                ref={audienceTriggerRef}
                type="button"
              >
                {timelineAudienceOptions.find(
                  (option) => option.value === audience,
                )?.label ?? "Party"}
                <ChevronDown aria-hidden="true" />
              </button>
              {audienceMenuOpen ? (
                <div
                  aria-labelledby={audienceId}
                  className="timeline-post-composer__audience-menu"
                  id={`${audienceId}-options`}
                  role="listbox"
                >
                  {timelineAudienceOptions.map((option, index) => (
                    <button
                      aria-selected={audience === option.value}
                      className="timeline-post-composer__audience-option"
                      key={option.value}
                      onClick={() => {
                        setAudience(option.value);
                        setAudienceMenuOpen(false);
                        audienceTriggerRef.current?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          audienceOptionRefs.current[
                            (index + 1) % timelineAudienceOptions.length
                          ]?.focus();
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          audienceOptionRefs.current[
                            (index - 1 + timelineAudienceOptions.length) %
                              timelineAudienceOptions.length
                          ]?.focus();
                        } else if (event.key === "Escape") {
                          event.preventDefault();
                          event.stopPropagation();
                          setAudienceMenuOpen(false);
                          audienceTriggerRef.current?.focus();
                        } else if (event.key === "Tab") {
                          setAudienceMenuOpen(false);
                        }
                      }}
                      ref={(element) => {
                        audienceOptionRefs.current[index] = element;
                      }}
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <button
            disabled={disabled || pending || !content.trim()}
            type="submit"
          >
            {pending ? "Publishing…" : "Publish"}
          </button>
        </div>
        {disabled ? (
          <p id={`${bodyId}-offline`} role="status">
            Publishing is unavailable offline. Reconnect to share a post.
          </p>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
      </form>
    </div>
  );
}

export function TimelinePanel({
  apiClient = timelineApiClient,
  careGratitudes = [],
  careOffers = [],
  careRequests = [],
  careRequestStatusMessage,
  careOfferStatusMessage,
  careGratitudeRequests = careRequests,
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onClaimOffer,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetRequestMinimized,
  onWithdraw,
  onWithdrawOffer = () => undefined,
  onOfflineChange,
  passableRequestIds = noPassableRequestIds,
  passAnnouncement,
  cacheOwnerId,
  viewerClaimedRequestIds = noClaimedRequestIds,
  viewerCompletedRequestIds = noCompletedRequestIds,
  otherParticipantCompletedRequestIds = noCompletedRequestIds,
  viewerId = "you",
  offline = false,
  postComposerOpen = false,
  onClosePostComposer = () => undefined,
}: {
  apiClient?: TimelineApiClient;
  careGratitudes?: CareGratitude[];
  careGratitudeRequests?: ReceiveCareRequest[];
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  careRequestStatusMessage?: string;
  careOfferStatusMessage?: string;
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onClaimOffer?: (offerId: string) => void;
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
  offline?: boolean;
  postComposerOpen?: boolean;
  onClosePostComposer?: () => void;
}) {
  const timelineItems = useRemoteTimelineItems(apiClient, cacheOwnerId);
  const timelineIsOffline =
    offline ||
    (timelineItems.state.status === "success" && timelineItems.state.offline) ||
    (timelineItems.state.status === "error" && timelineItems.state.recoverable);
  useEffect(() => {
    onOfflineChange?.(timelineIsOffline);
  }, [onOfflineChange, timelineIsOffline]);
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
  const careListingCardProps: CareListingCardProps = {
    claimedRequestIds,
    minimizedRequestIds,
    onOfferHelp,
    onClaimOffer,
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
      {careRequestStatusMessage ? (
        <div aria-live="polite" className="timeline-remote-state" role="status">
          {careRequestStatusMessage}
        </div>
      ) : null}
      {careOfferStatusMessage ? (
        <div aria-live="polite" className="timeline-remote-state" role="status">
          {careOfferStatusMessage}
        </div>
      ) : null}
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
            careGratitudes={careGratitudes}
            careGratitudeRequests={careGratitudeRequests}
            careListingCardProps={careListingCardProps}
            careListings={careListings}
            onRetry={timelineItems.retry}
            state={timelineItems.state}
          />
        ) : (
          <TimelineItemSlot
            layerFilter={layerFilter}
            onRetry={timelineItems.retry}
            state={timelineItems.state}
          />
        )}
      </div>
    </div>
  );
}
