import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCareConversation, useCareUnread } from "./useCareConversation";
import type { CareConversationClient } from "./careConversationClient";

const message = {
  id: "m1",
  sender: { personId: "person-a", displayName: "Tester A" },
  text: "Hello",
  sentAt: "2026-10-01T12:00:00Z",
};
function client(): CareConversationClient {
  return {
    getCareUnread: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      value: {
        apiVersion: "v1",
        data: { conversations: [{ careId: "care-a", unreadCount: 1 }] },
      },
    }),
    getCareMessages: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      value: { apiVersion: "v1", data: { messages: [message] } },
    }),
    sendCareMessage: vi
      .fn()
      .mockResolvedValue({ ok: true, status: 204, value: null }),
    markCareMessagesRead: vi
      .fn()
      .mockResolvedValue({ ok: true, status: 204, value: null }),
  };
}
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Care conversation memory and polling", () => {
  it("polls unread every 30 seconds only when visible and online, and isolates account state", async () => {
    vi.useFakeTimers();
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const api = client();
    const hook = renderHook(
      ({ ownerId }) => useCareUnread(ownerId, true, api),
      { initialProps: { ownerId: "person-a" } },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(hook.result.current.counts).toEqual({ "care-a": 1 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(api.getCareUnread).toHaveBeenCalledTimes(2);
    visibility.mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(api.getCareUnread).toHaveBeenCalledTimes(2);
    visibility.mockReturnValue("visible");
    online.mockReturnValue(false);
    act(() => window.dispatchEvent(new Event("offline")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(api.getCareUnread).toHaveBeenCalledTimes(2);
    act(() => hook.rerender({ ownerId: "person-b" }));
    expect(hook.result.current.counts).toEqual({});
    online.mockReturnValue(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await Promise.resolve();
    });
    expect(api.getCareUnread).toHaveBeenCalledTimes(3);
  });

  it("polls a visible conversation every 10 seconds and advances its displayed read marker", async () => {
    vi.useFakeTimers();
    const api = client();
    const onRead = vi.fn().mockResolvedValue(undefined);
    const onUnavailable = vi.fn();
    renderHook(() =>
      useCareConversation({
        careId: "care-a",
        ownerId: "person-b",
        enabled: true,
        onUnavailable,
        onRead,
        client: api,
      }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.markCareMessagesRead).toHaveBeenCalledWith(
      { careId: "care-a" },
      { throughMessageId: "m1" },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(api.getCareMessages).toHaveBeenCalledTimes(2);
    expect(api.markCareMessagesRead).toHaveBeenCalledTimes(1);
    expect(onRead).toHaveBeenCalledTimes(1);
  });

  it("preserves newer draft text when an earlier send completes", async () => {
    const api = client();
    let finishSend!: (
      value: Awaited<ReturnType<CareConversationClient["sendCareMessage"]>>,
    ) => void;
    vi.mocked(api.sendCareMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSend = resolve;
        }),
    );
    const onUnavailable = vi.fn();
    const onRead = vi.fn().mockResolvedValue(undefined);
    const hook = renderHook(() =>
      useCareConversation({
        careId: "care-a",
        ownerId: "person-b",
        enabled: true,
        onUnavailable,
        onRead,
        client: api,
      }),
    );
    await waitFor(() => expect(hook.result.current.reachable).toBe(true));
    act(() => hook.result.current.setDraft("First draft"));
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.send();
    });
    act(() => hook.result.current.setDraft("New draft"));
    await act(async () => {
      finishSend({ ok: true, status: 204, value: null });
      await pending;
    });
    expect(hook.result.current.draft).toBe("New draft");
    expect(api.sendCareMessage).toHaveBeenCalledWith(
      { careId: "care-a" },
      { text: "First draft" },
    );
  });

  it("clears messages and unsent text and returns to the source on server closure", async () => {
    const api = client();
    const onUnavailable = vi.fn();
    const onRead = vi.fn().mockResolvedValue(undefined);
    const hook = renderHook(() =>
      useCareConversation({
        careId: "care-a",
        ownerId: "person-b",
        enabled: true,
        onUnavailable,
        onRead,
        client: api,
      }),
    );
    await waitFor(() => expect(hook.result.current.messages).toHaveLength(1));
    act(() => hook.result.current.setDraft("Unsent"));
    vi.mocked(api.getCareMessages).mockResolvedValue({
      ok: false,
      kind: "http",
      status: 404,
      error: {
        apiVersion: "v1",
        error: { code: "NOT_FOUND", message: "Unavailable" },
      },
    });
    await act(async () => {
      await hook.result.current.refresh();
    });
    expect(hook.result.current.messages).toEqual([]);
    expect(hook.result.current.draft).toBe("");
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });
});
