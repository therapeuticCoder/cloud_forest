import { ArrowRight, HandHeart, History, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { CareRequestCard } from "@/components/cloud-forest/CareRequestCard";
import type { ReceiveCareRequest } from "@/types/careRequest";

import "./care-audience-review.css";

type ReviewState = "publication" | "active" | "not-visible" | "history";

const stateLabels: Record<ReviewState, string> = {
  publication: "Publication fallback",
  active: "Active Care",
  "not-visible": "No longer on Timeline",
  history: "Care History reason",
};

const reviewAudience = "Tribe · 1/5";

const reviewRequest: ReceiveCareRequest = {
  id: "t-044-care-review-request",
  kind: "meal",
  direction: "receive",
  need: "A meal",
  helpfulWhen: "Tonight after 6",
  foodWorks: "Soup, rice, or something easy",
  foodDoesNotWork: "",
  handoffStyle: "Leave it at my door",
  audience: "Tribe",
  audienceSnapshot: {
    partyMemberIds: [],
    tribeMemberIds: ["tribe-connection-1"],
  },
  status: "open",
  createdAt: "2026-09-08T17:00:00.000Z",
  expiresAt: "2026-09-15T17:00:00.000Z",
  requester: { kind: "party", id: "anya", displayName: "Anya Reed" },
};

function ReviewStateControls({
  onChange,
  state,
}: {
  onChange: (nextState: ReviewState) => void;
  state: ReviewState;
}) {
  return (
    <details className="care-audience-review__controls">
      <summary>Review the four agreed moments</summary>
      <div
        aria-label="T-044 review moments"
        className="care-audience-review__state-list"
      >
        {(Object.keys(stateLabels) as ReviewState[]).map((nextState) => (
          <button
            aria-pressed={state === nextState}
            key={nextState}
            onClick={() => onChange(nextState)}
            type="button"
          >
            {stateLabels[nextState]}
          </button>
        ))}
      </div>
    </details>
  );
}

function SectionHeading({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <header className="care-audience-review__section-heading">
      <div className="care-audience-review__section-icon">{icon}</div>
      <div>
        <h2>{label}</h2>
      </div>
    </header>
  );
}

function PublicationPreview() {
  return (
    <section
      aria-label="Publication wizard review"
      className="care-audience-review__publication"
    >
      <span className="care-audience-review__eyebrow">Wizard review step</span>
      <h2>Ready to ask your Tribe?</h2>
      <p>
        There are no eligible Party Connections right now, so this request will
        be shared with your Tribe instead.
      </p>
      <button type="button">
        Ask my Tribe <ArrowRight aria-hidden="true" />
      </button>
    </section>
  );
}

function TimelinePreview({ state }: { state: ReviewState }) {
  if (state === "not-visible" || state === "history") {
    return (
      <p className="care-audience-review__empty-state" role="status">
        No Care is available here right now.
      </p>
    );
  }

  return (
    <CareRequestCard
      audienceSummary={reviewAudience}
      canPass
      claimed={false}
      minimized={false}
      onOfferHelp={() => undefined}
      onPass={() => undefined}
      onSetMinimized={() => undefined}
      onWithdraw={() => undefined}
      request={reviewRequest}
      viewerId="mira"
      viewerIsClaimer={false}
    />
  );
}

function CareHistoryPreview({ state }: { state: ReviewState }) {
  if (state !== "history") {
    return (
      <p className="care-audience-review__history-empty">
        Nothing has been added to private history from this change.
      </p>
    );
  }

  return (
    <div className="care-audience-review__history-entry">
      <History aria-hidden="true" />
      <div>
        <strong>Care closed</strong>
        <span>Closed after a relationship change.</span>
      </div>
    </div>
  );
}

export function CareAudienceReview() {
  const [state, setState] = useState<ReviewState>("publication");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [state]);

  return (
    <main className="cloud-forest-app care-audience-review">
      <div className="care-audience-review__topbar">
        <div className="care-audience-review__brand">
          <span className="care-audience-review__brand-mark">✦</span>
          <span>Cloud Forest</span>
        </div>
        <span className="care-audience-review__topbar-label">T-044 review</span>
      </div>

      <ReviewStateControls onChange={setState} state={state} />

      <section
        aria-label="Care audience review"
        className="care-audience-review__surface"
      >
        <header className="care-audience-review__heading">
          <span className="care-audience-review__eyebrow">
            One Care record · quiet system changes
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            {stateLabels[state]}
          </h1>
          <p>
            The system recalculates access quietly. The user sees only the
            current audience summary, available actions, and private history.
          </p>
        </header>

        {state === "publication" ? <PublicationPreview /> : null}

        <div className="care-audience-review__surfaces">
          <section
            aria-label="Timeline preview"
            className="care-audience-review__surface-panel"
          >
            <SectionHeading
              icon={<HandHeart aria-hidden="true" />}
              label="Timeline"
            />
            <TimelinePreview state={state} />
          </section>

          <section
            aria-label="Care History preview"
            className="care-audience-review__surface-panel"
          >
            <SectionHeading
              icon={<History aria-hidden="true" />}
              label="Profile · Care History"
            />
            <CareHistoryPreview state={state} />
            {state === "not-visible" ? (
              <p className="care-audience-review__quiet-note">
                No history entry is created just because current access changed.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="care-audience-review__boundary-note">
          <ShieldCheck aria-hidden="true" />
          <p>
            Temporary T-044 review fixture only. This entry point is not part of
            the normal app, does not call the API, and must be removed before
            publication.
          </p>
        </aside>
      </section>
    </main>
  );
}
