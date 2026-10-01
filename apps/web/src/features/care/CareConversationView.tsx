import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Care } from "@/types/care";
import { useCareConversation } from "./useCareConversation";
import type { CareConversationClient } from "./careConversationClient";

export function CareConversationView({
  care,
  ownerId,
  enabled,
  onBack,
  onUnavailable,
  onRead,
  client,
}: {
  care: Care;
  ownerId: string;
  enabled: boolean;
  onBack: () => void;
  onUnavailable: () => void;
  onRead: () => Promise<void>;
  client?: CareConversationClient;
}) {
  const conversation = useCareConversation({
    careId: care.id,
    ownerId,
    enabled,
    onUnavailable,
    onRead,
    client,
  });
  const heading = useRef<HTMLHeadingElement>(null);
  const log = useRef<HTMLOListElement>(null);
  const keepAtEnd = useRef(true);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (keepAtEnd.current && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [conversation.messages]);
  const partner =
    care.originator.id === ownerId ? care.participant : care.originator;
  return (
    <section
      aria-label="Care conversation"
      aria-modal="true"
      role="dialog"
      className="care-conversation"
    >
      <header className="care-conversation__header">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <h1 ref={heading} tabIndex={-1}>
            Conversation
          </h1>
          <p>{partner?.displayName}</p>
        </div>
      </header>
      <ol
        ref={log}
        className="care-conversation__messages"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions text"
        onScroll={() => {
          const element = log.current;
          if (element)
            keepAtEnd.current =
              element.scrollHeight - element.scrollTop - element.clientHeight <
              48;
        }}
      >
        {conversation.messages.map((message) => (
          <li
            key={message.id}
            data-own-message={message.sender.personId === ownerId}
          >
            <div>
              <strong>{message.sender.displayName}</strong>
              <time dateTime={message.sentAt}>
                {new Date(message.sentAt).toLocaleString()}
              </time>
            </div>
            <p>{message.text}</p>
          </li>
        ))}
      </ol>
      {conversation.loading ? (
        <p role="status">Loading messages…</p>
      ) : !conversation.messages.length && !conversation.error ? (
        <p role="status">No messages yet.</p>
      ) : null}
      {conversation.error ? (
        <p role="alert">
          {conversation.error}{" "}
          <button
            type="button"
            disabled={!enabled}
            onClick={() => void conversation.refresh()}
          >
            Retry
          </button>
        </p>
      ) : null}
      {!enabled ? <p role="status">Reconnect to send messages.</p> : null}
      <form
        className="care-conversation__composer"
        onSubmit={(event) => {
          event.preventDefault();
          keepAtEnd.current = true;
          void conversation.send();
        }}
      >
        <label htmlFor="care-conversation-message">Message</label>
        <textarea
          id="care-conversation-message"
          rows={3}
          maxLength={2000}
          value={conversation.draft}
          onChange={(event) => conversation.setDraft(event.target.value)}
          aria-describedby="care-conversation-limit"
        />
        <div>
          <span id="care-conversation-limit">
            {conversation.draft.length}/2,000
          </span>
          <button
            type="submit"
            disabled={
              !enabled ||
              !conversation.reachable ||
              conversation.sending ||
              !conversation.draft.trim()
            }
          >
            {conversation.sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
