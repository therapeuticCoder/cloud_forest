import { useEffect, useState } from "react";
import { loadTimelineItemsSnapshot } from "@/lib/timelineItemStorage";
import {
  clearDeviceRead,
  loadDeviceRead,
  saveDeviceRead,
  reportExpiredDeviceSession,
} from "@/lib/deviceReadStorage";
import {
  timelineError,
  type TimelineApiClient,
  type TimelineItemState,
  type RemoteTimelineItem,
} from "./timelineClient";

function initialTimelineItemsState(cacheOwnerId?: string): TimelineItemState {
  const cachedItems = cacheOwnerId
    ? loadTimelineItemsSnapshot(cacheOwnerId)
    : undefined;
  return cachedItems
    ? { status: "success", items: cachedItems, source: "cache", offline: true }
    : { status: "loading" };
}

export function useTimelineItems(
  apiClient: TimelineApiClient,
  cacheOwnerId = "",
  enabled = true,
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<TimelineItemState>(() =>
    initialTimelineItemsState(cacheOwnerId),
  );
  useEffect(() => {
    let active = true;
    let sequence = 0;
    const refresh = async () => {
      const requestSequence = ++sequence;
      const cached = await loadDeviceRead(cacheOwnerId, "timeline");
      if (!active || requestSequence !== sequence) return;
      if (cached !== undefined) {
        setState((current) =>
          current.status === "success" && current.source === "live"
            ? current
            : {
                status: "success",
                items: cached,
                source: "cache",
                offline: true,
              },
        );
      }
      if (!enabled) {
        if (cached === undefined)
          setState({
            status: "error",
            recoverable: true,
            error: {
              code: "NETWORK",
              message:
                "No saved Timeline on this device yet. Connect to load it.",
            },
          });
        return;
      }
      if (!apiClient.getTimelineItems) return;
      const result = await apiClient.getTimelineItems();
      if (!active || requestSequence !== sequence) return;
      if (result.ok) {
        const items = result.value.data.timelineItems;
        void saveDeviceRead(cacheOwnerId, "timeline", [...items]);
        setState({ status: "success", items, source: "live", offline: false });
        return;
      }
      if (result.kind === "unexpected-response" && result.status === 404) {
        await clearDeviceRead(cacheOwnerId, "timeline");
        if (active && requestSequence === sequence)
          setState({ status: "empty" });
        return;
      }
      if (result.kind !== "network" && result.status === 401) {
        reportExpiredDeviceSession(cacheOwnerId);
      }
      const recoverable =
        result.kind === "network" ||
        (result.kind === "unexpected-response" && result.status >= 500);
      setState((current) =>
        recoverable && current.status === "success"
          ? { ...current, source: "cache", offline: true }
          : { status: "error", recoverable, error: timelineError(result) },
      );
    };
    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleRefresh();
    };
    window.addEventListener("online", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      active = false;
      window.removeEventListener("online", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [apiClient, attempt, cacheOwnerId, enabled]);

  const retry = () => setAttempt((value) => value + 1);
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
      void saveDeviceRead(cacheOwnerId, "timeline", items);
      return { status: "success", items, source: "live", offline: false };
    });
  };
  return { addPublishedItem, retry, state };
}
