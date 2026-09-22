import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GetTimelineItemsResult } from "@cloud-forest/api-client";
import {
  loadTimelineItemsSnapshot,
  saveTimelineItemsSnapshot,
} from "@/lib/timelineItemStorage";
import { useTimelineItems } from "./useTimelineItems";

const item = {
  id: "cached-post",
  actor: { id: "neighbor", displayName: "Neighbor", layer: "party" as const },
  content: "A private update",
  publishedAt: "2026-09-22T10:00:00.000Z",
};

afterEach(() => localStorage.clear());

describe("Timeline cached reads", () => {
  it("uses only this owner's snapshot during a network outage", async () => {
    saveTimelineItemsSnapshot("owner", [item]);
    const apiClient = {
      getTimelineItems: vi.fn(
        async (): Promise<GetTimelineItemsResult> => ({
          ok: false,
          kind: "network",
          cause: new Error("offline"),
        }),
      ),
    };
    const { result } = renderHook(() => useTimelineItems(apiClient, "owner"));
    await waitFor(() =>
      expect(result.current.state).toMatchObject({
        status: "success",
        source: "cache",
        offline: true,
        items: [item],
      }),
    );
    const other = renderHook(() => useTimelineItems(apiClient, "other-owner"));
    await waitFor(() =>
      expect(other.result.current.state.status).toBe("error"),
    );
  });

  it("purges cached access for a 401 even when its body is malformed, before a later network failure", async () => {
    saveTimelineItemsSnapshot("owner", [item]);
    const getTimelineItems = vi
      .fn<() => Promise<GetTimelineItemsResult>>()
      .mockResolvedValueOnce({
        ok: false,
        kind: "unexpected-response",
        status: 401,
        body: "not JSON",
      })
      .mockResolvedValueOnce({
        ok: false,
        kind: "network",
        cause: new Error("offline"),
      });
    const apiClient = { getTimelineItems };
    const { result } = renderHook(() => useTimelineItems(apiClient, "owner"));
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(loadTimelineItemsSnapshot("owner")).toBeUndefined();
    act(() => result.current.retry());
    await waitFor(() =>
      expect(result.current.state).toMatchObject({
        status: "error",
        error: { code: "NETWORK" },
      }),
    );
  });

  it("removes an unavailable Timeline snapshot after a 404", async () => {
    saveTimelineItemsSnapshot("owner", [item]);
    const apiClient = {
      getTimelineItems: vi.fn(
        async (): Promise<GetTimelineItemsResult> => ({
          ok: false,
          kind: "unexpected-response",
          status: 404,
          body: null,
        }),
      ),
    };
    const { result } = renderHook(() => useTimelineItems(apiClient, "owner"));
    await waitFor(() => expect(result.current.state.status).toBe("empty"));
    expect(loadTimelineItemsSnapshot("owner")).toBeUndefined();
  });
});
