import { useCallback, useEffect, useRef, useState } from "react";
import type { CareMessagesResponse } from "@cloud-forest/api-client";
import { reportExpiredDeviceSession } from "@/lib/deviceReadStorage";
import {
  careConversationClient,
  type CareConversationClient,
} from "./careConversationClient";

export function useVisibleCarePolling(
  load: () => Promise<void>,
  enabled: boolean,
  delay: number,
) {
  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    let stopped = false;
    let running = false;
    const visible = () =>
      navigator.onLine && document.visibilityState !== "hidden";
    const poll = async () => {
      if (stopped || running || !visible()) return;
      running = true;
      try {
        await load();
      } finally {
        running = false;
        if (!stopped && visible())
          timer = window.setTimeout(() => void poll(), delay);
      }
    };
    const resume = () => {
      window.clearTimeout(timer);
      if (visible()) void poll();
    };
    resume();
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    window.addEventListener("offline", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [load, enabled, delay]);
}

export function useCareUnread(
  ownerId: string,
  enabled: boolean,
  client: CareConversationClient = careConversationClient,
) {
  const [state, setState] = useState<{
    ownerId: string;
    counts: Record<string, number>;
  }>();
  const sequence = useRef(0);
  useEffect(
    () => () => {
      sequence.current++;
    },
    [ownerId, enabled],
  );
  const refresh = useCallback(async () => {
    if (!enabled || !navigator.onLine || document.visibilityState === "hidden")
      return;
    const request = ++sequence.current;
    const result = await client.getCareUnread();
    if (request !== sequence.current) return;
    if (result.ok)
      setState({
        ownerId,
        counts: Object.fromEntries(
          result.value.data.conversations.map((item) => [
            item.careId,
            item.unreadCount,
          ]),
        ),
      });
    else if ("status" in result && result.status === 401)
      reportExpiredDeviceSession(ownerId);
  }, [client, enabled, ownerId]);
  useVisibleCarePolling(refresh, enabled, 30_000);
  return { counts: state?.ownerId === ownerId ? state.counts : {}, refresh };
}

export function useCareConversation({
  careId,
  ownerId,
  enabled,
  onUnavailable,
  onRead,
  client = careConversationClient,
}: {
  careId: string;
  ownerId: string;
  enabled: boolean;
  onUnavailable: () => void;
  onRead: () => Promise<void>;
  client?: CareConversationClient;
}) {
  const [messages, setMessages] = useState<
    CareMessagesResponse["data"]["messages"]
  >([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const [reachable, setReachable] = useState(false);
  const sequence = useRef(0);
  const mounted = useRef(true);
  const sendInFlight = useRef(false);
  const readInFlight = useRef(false);
  const lastReadId = useRef<string | undefined>(undefined);
  useEffect(() => {
    const requestSequence = sequence;
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestSequence.current++;
    };
  }, []);
  useEffect(
    () => () => {
      sequence.current++;
    },
    [enabled],
  );
  const handleFailure = useCallback(
    (result: { kind: string; status?: number }) => {
      setReachable(false);
      if (result.status === 401) {
        setMessages([]);
        setDraft("");
        reportExpiredDeviceSession(ownerId);
      } else if (result.kind === "http" && result.status === 404) {
        setMessages([]);
        setDraft("");
        onUnavailable();
      } else
        setError(
          "Couldn’t reach this conversation. Your unsent message is still here.",
        );
    },
    [onUnavailable, ownerId],
  );
  const refresh = useCallback(async () => {
    if (!enabled || !navigator.onLine || document.visibilityState === "hidden")
      return;
    const request = ++sequence.current;
    const result = await client.getCareMessages({ careId });
    if (!mounted.current || request !== sequence.current) return;
    setLoading(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    setMessages(result.value.data.messages);
    setReachable(true);
    setError(undefined);
  }, [careId, client, enabled, handleFailure]);
  useVisibleCarePolling(refresh, enabled, 10_000);

  const throughMessageId = messages.at(-1)?.id;
  useEffect(() => {
    if (
      !enabled ||
      !reachable ||
      !navigator.onLine ||
      document.visibilityState === "hidden" ||
      !throughMessageId ||
      throughMessageId === lastReadId.current ||
      readInFlight.current
    )
      return;
    readInFlight.current = true;
    void client
      .markCareMessagesRead({ careId }, { throughMessageId })
      .then(async (result) => {
        readInFlight.current = false;
        if (!mounted.current) return;
        if (!result.ok) {
          handleFailure(result);
          return;
        }
        lastReadId.current = throughMessageId;
        await onRead();
      });
  }, [
    careId,
    client,
    enabled,
    handleFailure,
    onRead,
    reachable,
    throughMessageId,
    messages,
  ]);

  const send = async () => {
    if (
      !enabled ||
      !reachable ||
      !navigator.onLine ||
      document.visibilityState === "hidden" ||
      !draft.trim() ||
      draft.length > 2000 ||
      sendInFlight.current
    )
      return;
    sendInFlight.current = true;
    setSending(true);
    setError(undefined);
    const sentDraft = draft;
    const result = await client.sendCareMessage(
      { careId },
      { text: sentDraft },
    );
    sendInFlight.current = false;
    if (!mounted.current) return;
    setSending(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    setDraft((current) => (current === sentDraft ? "" : current));
    await refresh();
  };
  return {
    messages,
    draft,
    setDraft,
    loading,
    sending,
    error,
    reachable,
    refresh,
    send,
  };
}
