import { MessageCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Care } from "@/types/care";
import { CareConversationView } from "./CareConversationView";
import { useCareUnread } from "./useCareConversation";
import type { CareConversationClient } from "./careConversationClient";
import "./careConversation.css";

type ConversationContext = {
  enabled: boolean;
  counts: Record<string, number>;
  open: (care: Care) => void;
};
const Context = createContext<ConversationContext | null>(null);

export function CareConversations({
  cares,
  ownerId,
  enabled,
  onRefreshCares,
  children,
  client,
}: {
  cares: Care[];
  ownerId: string;
  enabled: boolean;
  onRefreshCares: () => Promise<unknown>;
  children: ReactNode;
  client?: CareConversationClient;
}) {
  const [careId, setCareId] = useState<string | null>(null);
  const closing = useRef(false);
  const source = useRef<{
    focus: HTMLElement | null;
    scrollElement: HTMLElement | null;
    scrollTop: number;
    scrollY: number;
  } | null>(null);
  const { counts, eligibility, refresh } = useCareUnread(
    ownerId,
    enabled,
    client,
  );
  const lastEligibility = useRef(eligibility);
  useEffect(() => {
    if (!enabled || !eligibility || eligibility === lastEligibility.current)
      return;
    lastEligibility.current = eligibility;
    const available = cares.filter(
      (item) => item.status === "claimed" && item.conversationAvailable,
    );
    if (
      available.length !== Object.keys(eligibility).length ||
      available.some((item) => !(item.id in eligibility))
    ) {
      void onRefreshCares();
    }
  }, [cares, eligibility, enabled, onRefreshCares]);
  const care = cares.find(
    (item) =>
      item.id === careId &&
      item.status === "claimed" &&
      item.conversationAvailable,
  );
  const open = useCallback((item: Care) => {
    closing.current = false;
    const focus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const scrollElement =
      focus?.closest<HTMLElement>(".care-destination, .curator-detail-view") ??
      null;
    source.current = {
      focus,
      scrollElement,
      scrollTop: scrollElement?.scrollTop ?? 0,
      scrollY: window.scrollY,
    };
    window.history.pushState(
      { ...window.history.state, careConversation: item.id },
      "",
    );
    setCareId(item.id);
  }, []);
  const restore = useCallback(() => {
    closing.current = false;
    setCareId(null);
    const previous = source.current;
    source.current = null;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (previous?.scrollElement?.isConnected)
          previous.scrollElement.scrollTop = previous.scrollTop;
        if (previous) window.scrollTo(0, previous.scrollY);
        if (previous?.focus?.isConnected)
          previous.focus.focus({ preventScroll: true });
      }),
    );
  }, []);
  const back = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    window.history.back();
  }, []);
  // Capture consumes this history step before the underlying Care destination
  // processes it, preserving Timeline details, My Care tabs and Party selection.
  useEffect(() => {
    if (!careId) return;
    const pop = (event: PopStateEvent) => {
      event.stopImmediatePropagation();
      restore();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        back();
      }
    };
    window.addEventListener("popstate", pop, true);
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("popstate", pop, true);
      window.removeEventListener("keydown", key, true);
    };
  }, [back, careId, restore]);
  useEffect(() => {
    if (careId && !care) back();
  }, [back, care, careId]);
  const unavailable = useCallback(() => {
    back();
    void onRefreshCares();
    void refresh();
  }, [back, onRefreshCares, refresh]);
  const context = useMemo(
    () => ({ enabled, counts, open }),
    [enabled, counts, open],
  );
  return (
    <Context.Provider value={context}>
      <div
        inert={careId ? true : undefined}
        aria-hidden={careId ? true : undefined}
      >
        {children}
      </div>
      {care ? (
        <CareConversationView
          key={`${ownerId}:${care.id}`}
          care={care}
          ownerId={ownerId}
          enabled={enabled}
          onBack={back}
          onUnavailable={unavailable}
          onRead={refresh}
          client={client}
        />
      ) : null}
    </Context.Provider>
  );
}

export function CareConversationUnread({ care }: { care: Care }) {
  const context = useContext(Context);
  const unread = context?.counts[care.id] ?? 0;
  return context?.enabled &&
    care.status === "claimed" &&
    care.conversationAvailable &&
    unread > 0 ? (
    <span className="care-conversation-unread">{unread} unread</span>
  ) : null;
}

export function CareConversationEntry({ care }: { care: Care }) {
  const context = useContext(Context);
  if (
    !context?.enabled ||
    care.status !== "claimed" ||
    !care.conversationAvailable
  )
    return null;
  return (
    <button
      type="button"
      className="care-conversation-entry"
      data-care-conversation-action={care.id}
      onClick={() => context.open(care)}
    >
      <MessageCircle aria-hidden="true" />
      Conversation <CareConversationUnread care={care} />
    </button>
  );
}
