import { useEffect, useState } from "react";
import {
  clearTimelineItemSnapshot,
  loadTimelineItemsSnapshot,
  saveTimelineItemsSnapshot,
} from "@/lib/timelineItemStorage";
import {
  timelineError,
  type TimelineApiClient,
  type TimelineItemState,
  type RemoteTimelineItem,
  type TimelineItemsFailure,
} from "./timelineClient";

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

export function useTimelineItems(
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

      if (result.kind !== "network" && result.status === 401) {
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
