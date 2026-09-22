import { ChevronDown, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { CreateTimelinePostResult } from "@cloud-forest/api-client";
import type { TimelineApiClient, RemoteTimelineItem } from "./timelineClient";

const timelineAudienceOptions = [
  { value: "party", label: "Party" },
  { value: "tribe", label: "Tribe" },
] as const;
type TimelineAudience = (typeof timelineAudienceOptions)[number]["value"];

export function TimelinePostComposer({
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
