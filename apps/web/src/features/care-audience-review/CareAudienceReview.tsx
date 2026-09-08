import {
  AlertTriangle,
  Clock3,
  HandHeart,
  History,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  carePerspectiveOptions,
  type CarePerspectiveOption,
} from "@/data/careLifecycleMockData";
import { CarePerspectiveSwitcher } from "@/components/cloud-forest/CarePerspectiveSwitcher";
import { CareRequestCard } from "@/components/cloud-forest/CareRequestCard";
import type { CarePersonId, ReceiveCareRequest } from "@/types/careRequest";

import "./care-audience-review.css";

type ReviewState =
  | "party"
  | "tribe"
  | "demoted"
  | "fresh-party"
  | "newly-eligible"
  | "no-tribe"
  | "access-ended"
  | "orphaned";

type ReviewFixture = {
  label: string;
  timelineNote?: string;
  profileNote: string;
  requestAudience: "Party" | "Tribe";
  timeline: "request" | "empty" | "recovery";
  history: "none" | "orphaned";
};

const stateLabels: Record<ReviewState, string> = {
  party: "Party Care",
  tribe: "Tribe Care",
  demoted: "Party → Tribe",
  "fresh-party": "Fresh Party round",
  "newly-eligible": "New Connection enters",
  "no-tribe": "No eligible Tribe",
  "access-ended": "Access ends",
  orphaned: "Orphaned claimed Care",
};

const fixtures: Record<ReviewState, ReviewFixture> = {
  party: {
    label: "Current audience · Party",
    profileNote:
      "The request remains active and appears with its current Party audience.",
    requestAudience: "Party",
    timeline: "request",
    history: "none",
  },
  tribe: {
    label: "Current audience · Tribe",
    profileNote:
      "The request remains active and appears with its current Tribe audience.",
    requestAudience: "Tribe",
    timeline: "request",
    history: "none",
  },
  demoted: {
    label: "Audience changed · Party to Tribe",
    timelineNote:
      "No unresolved eligible Party Connections remained, so the request is now open to eligible Tribe Connections.",
    profileNote:
      "The request is still active. Its current audience is Tribe; no history entry is created by demotion.",
    requestAudience: "Tribe",
    timeline: "request",
    history: "none",
  },
  "fresh-party": {
    label: "Audience changed · Fresh Party round",
    timelineNote:
      "The originator returned the request to Party. This is a new Party round, so earlier Party passes do not carry over.",
    profileNote:
      "The request remains active in Party. Returning to Party does not create a history entry.",
    requestAudience: "Party",
    timeline: "request",
    history: "none",
  },
  "newly-eligible": {
    label: "Audience changed · Connection now eligible",
    timelineNote:
      "A Connection that entered the current layer can now see this active request.",
    profileNote:
      "The request remains active. Eligibility is recalculated from the Connection's current layer.",
    requestAudience: "Party",
    timeline: "request",
    history: "none",
  },
  "no-tribe": {
    label: "Current audience · No eligible Tribe Connections",
    timelineNote:
      "There is nothing to show in this viewer's Timeline right now. The request remains active for its originator and can expire normally.",
    profileNote:
      "An empty audience does not create a history entry. The originator still sees the active request in My Care.",
    requestAudience: "Tribe",
    timeline: "empty",
    history: "none",
  },
  "access-ended": {
    label: "Current access · No longer eligible",
    timelineNote:
      "This request is no longer available to you. The relationship changed, so the current view was refreshed.",
    profileNote:
      "Removal, Holding, or blocking revokes current access without creating a shared history item for the viewer.",
    requestAudience: "Party",
    timeline: "recovery",
    history: "none",
  },
  orphaned: {
    label: "Claimed Care · Orphaned",
    timelineNote:
      "This Care closed when the Connection broke. It will not return to the Timeline.",
    profileNote:
      "Private history records the neutral closure. Neither former participant remains responsible.",
    requestAudience: "Party",
    timeline: "empty",
    history: "orphaned",
  },
};

const reviewPeople: CarePerspectiveOption[] = carePerspectiveOptions.filter(
  (option) => ["mira", "sol", "dev", "nearby-family-1"].includes(option.id),
);

const baseRequest: ReceiveCareRequest = {
  id: "care-audience-review-request",
  kind: "meal",
  direction: "receive",
  need: "A meal",
  helpfulWhen: "Tonight after 6",
  foodWorks: "Soup, rice, or something easy",
  foodDoesNotWork: "",
  handoffStyle: "Leave it at my door",
  audience: "Party",
  audienceSnapshot: {
    partyMemberIds: ["mira", "sol", "dev"],
    tribeMemberIds: ["nearby-family-1"],
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
      <summary>Change the fictional review fixture</summary>
      <div
        aria-label="Fictional review fixtures"
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

function SectionHeading({
  icon,
  id,
  label,
  note,
}: {
  icon: React.ReactNode;
  id: string;
  label: string;
  note: string;
}) {
  return (
    <header className="care-audience-review__section-heading">
      <div className="care-audience-review__section-icon">{icon}</div>
      <div>
        <h2 id={id}>{label}</h2>
        <p>{note}</p>
      </div>
    </header>
  );
}

function TimelineMessage({ fixture }: { fixture: ReviewFixture }) {
  if (fixture.timeline === "empty") {
    return (
      <div className="care-audience-review__empty-state" role="status">
        <Clock3 aria-hidden="true" />
        <div>
          <strong>{fixture.label}</strong>
          <p>{fixture.timelineNote}</p>
        </div>
      </div>
    );
  }

  if (fixture.timeline === "recovery") {
    return (
      <div
        className="care-audience-review__empty-state care-audience-review__empty-state--recovery"
        role="status"
      >
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>Current access is different</strong>
          <p>{fixture.timelineNote}</p>
        </div>
      </div>
    );
  }

  return fixture.timelineNote ? (
    <p className="care-audience-review__timeline-note" role="status">
      <ShieldCheck aria-hidden="true" />
      {fixture.timelineNote}
    </p>
  ) : null;
}

function ProfilePreview({ fixture }: { fixture: ReviewFixture }) {
  return (
    <div className="care-audience-review__profile-preview">
      <div className="care-audience-review__profile-row">
        <div>
          <span className="care-audience-review__eyebrow">My requests</span>
          <strong>
            {fixture.history === "orphaned"
              ? "Closed meal request"
              : "Meal request"}
          </strong>
        </div>
        <span className="care-audience-review__profile-status">
          {fixture.history === "orphaned"
            ? "Orphaned"
            : fixture.timeline === "recovery"
              ? "Not visible"
              : "Active"}
        </span>
      </div>
      <p>{fixture.profileNote}</p>
      {fixture.history === "orphaned" ? (
        <div className="care-audience-review__history-entry">
          <History aria-hidden="true" />
          <div>
            <strong>Orphaned · Connection changed</strong>
            <span>Neither person remains responsible.</span>
          </div>
        </div>
      ) : (
        <div className="care-audience-review__history-empty">
          <span>Private history</span>
          <strong>No terminal history from this change.</strong>
        </div>
      )}
    </div>
  );
}

export function CareAudienceReview() {
  const [state, setState] = useState<ReviewState>("party");
  const [viewerId, setViewerId] = useState<CarePersonId>("mira");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fixture = fixtures[state];
  const request = useMemo(
    () => ({ ...baseRequest, audience: fixture.requestAudience }),
    [fixture.requestAudience],
  );

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
        <span className="care-audience-review__topbar-label">
          T-044 Care review
        </span>
      </div>

      <CarePerspectiveSwitcher
        onChange={setViewerId}
        options={reviewPeople}
        viewerId={viewerId}
      />
      <ReviewStateControls onChange={setState} state={state} />

      <section
        aria-label="Care audience review"
        className="care-audience-review__surface"
      >
        <header className="care-audience-review__heading">
          <span className="care-audience-review__eyebrow">
            One Care record · two places it can appear
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            {fixture.label}
          </h1>
          <p>
            The Timeline shows current audience access. The profile keeps the
            originator's active Care and private history separate.
          </p>
        </header>

        <div className="care-audience-review__surfaces">
          <section
            aria-labelledby="timeline-heading"
            className="care-audience-review__surface-panel"
          >
            <SectionHeading
              icon={<HandHeart aria-hidden="true" />}
              id="timeline-heading"
              label="Timeline"
              note="What the reviewing Connection can see now"
            />
            <TimelineMessage fixture={fixture} />
            {fixture.timeline === "request" ? (
              <CareRequestCard
                canPass
                claimed={false}
                minimized={false}
                onOfferHelp={() => undefined}
                onPass={() => undefined}
                onSetMinimized={() => undefined}
                onWithdraw={() => undefined}
                request={request}
                viewerId={viewerId}
                viewerIsClaimer={false}
              />
            ) : null}
          </section>

          <section
            aria-labelledby="profile-heading"
            className="care-audience-review__surface-panel"
          >
            <SectionHeading
              icon={<History aria-hidden="true" />}
              id="profile-heading"
              label="Profile · My Care"
              note="What remains active or private for the originator"
            />
            <ProfilePreview fixture={fixture} />
          </section>
        </div>

        <aside className="care-audience-review__boundary-note">
          <AlertTriangle aria-hidden="true" />
          <p>
            Fictional review harness only. A durable service recalculates
            eligibility and authorization on every read; browser visibility,
            fixtures, and perspective switching never grant access.
          </p>
        </aside>
      </section>
    </main>
  );
}
