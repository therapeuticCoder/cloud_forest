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
  HeartHandshake,
  Network,
  RadioTower,
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
import type { Care, CarePersonId } from "@/types/care";
import {
  clearTimelineItemSnapshot,
  loadTimelineItemsSnapshot,
  saveTimelineItemsSnapshot,
} from "@/lib/timelineItemStorage";

import { CareCard } from "./CareCard";
import { TimelineCard, type TimelineCardItem } from "./TimelineCard";

const timelineApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

type RemoteTimelineItem = GetTimelineItemResponse["data"]["timelineItem"];
type TimelineItemsFailure = Extract<GetTimelineItemsResult, { ok: false }>;
type TimelineLayerFilter = Exclude<CloudForestLayer, "self">;

export type TimelineError = {
  code: number | "NETWORK";
  message: string;
};

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
      error?: TimelineError;
    }
  | { status: "empty" }
  | { status: "error"; recoverable: boolean; error: TimelineError };

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

function formatActivityTime(publishedAt: string) {
  return formatter.format(new Date(publishedAt)).replace(",", " ·");
}

function timelineErrorCode(
  result: TimelineItemsFailure,
): TimelineError["code"] {
  return result.kind === "network" ? "NETWORK" : result.status;
}

function timelineErrorMessage(result: TimelineItemsFailure) {
  if (result.kind === "http") return result.error.error.message;
  if (result.kind === "network") {
    return "Cloud Forest couldn’t reach Timeline. Try again when you’re ready.";
  }
  return "Timeline posts couldn’t be loaded. Try again when you’re ready.";
}

function timelineError(result: TimelineItemsFailure): TimelineError {
  return {
    code: timelineErrorCode(result),
    message: timelineErrorMessage(result),
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

type CareListing = Care;

type CareListingCardProps = {
  onClaim?: (careId: string) => void;
  minimizedCareIds: Set<string>;
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
}: CareListingCardProps & { listing: CareListing }) {
  return (
    <CareCard
      canPass={props.passableCareIds.has(listing.id)}
      care={listing}
      minimized={props.minimizedCareIds.has(listing.id)}
      onClaim={props.onClaim}
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
}: CareListingCardProps & { listings: CareListing[] }) {
  return listings.map((listing) => (
    <CareListingCard key={listing.id} listing={listing} {...props} />
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
            error: timelineError(result),
          });
          return;
        }
      }

      setState({
        status: "error",
        recoverable,
        error: timelineError(result),
      });
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
  | { kind: "care-listing"; listing: CareListing };

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
    const item = remoteTimelineItemToCardItem(activity.item);
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
  careListings: CareListing[];
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
  cares = [],
  careError,
  minimizedCareIds = noMinimizedCareIds,
  onCommitToCare,
  onClaim,
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
  onCommitToCare?: (care: Care) => void;
  onClaim?: (careId: string) => void;
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
  const timelineItems = useRemoteTimelineItems(apiClient, cacheOwnerId);
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
    onCommitToCare,
    onClaim,
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
