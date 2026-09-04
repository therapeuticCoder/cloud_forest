import { ArrowLeft, Clock3, HandHeart, Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type {
  CareHistoryEntry,
  CareLifecycleState,
  ReceiveCareRequest,
} from "@/types/careRequest";

import { CareRequestCard } from "./CareRequestCard";

type MyCareViewProps = {
  activeRequests: ReceiveCareRequest[];
  careLifecycle: CareLifecycleState;
  claimedRequests: ReceiveCareRequest[];
  history: CareHistoryEntry[];
  onBack: () => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
  onWithdraw: (requestId: string) => void;
};

const historyLabels = {
  completed: "Completed",
  "not-completed": "Not completed",
  expired: "Expired",
  withdrawn: "Withdrawn",
} as const;

const historyDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export function MyCareView({
  activeRequests,
  careLifecycle,
  claimedRequests,
  history,
  onBack,
  onSetRequestMinimized,
  onWithdraw,
}: MyCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  return (
    <section aria-label="My Care" className="my-care-view care-destination">
      <header className="my-care-view__header">
        <Button
          aria-label="Back"
          className="party-wizard__icon-button"
          onClick={onBack}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <span>Personal care commitments</span>
          <h1 ref={headingRef} tabIndex={-1}>
            My Care
          </h1>
        </div>
      </header>

      <div className="my-care-view__content">
        <section
          aria-labelledby="requests-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <Send aria-hidden="true" />
            <h2 id="requests-heading">My requests</h2>
          </div>

          {activeRequests.length > 0 ? (
            activeRequests.map((request) => {
              const claim = careLifecycle.claims.find(
                (candidate) => candidate.requestId === request.id,
              );
              return (
                <CareRequestCard
                  canPass={false}
                  claimed={Boolean(claim)}
                  key={request.id}
                  minimized={false}
                  onOfferHelp={() => undefined}
                  onPass={() => undefined}
                  onSetMinimized={onSetRequestMinimized}
                  onWithdraw={onWithdraw}
                  request={request}
                  viewerId="you"
                  viewerIsClaimer={claim?.claimerId === "you"}
                />
              );
            })
          ) : (
            <p className="my-care-view__empty">
              You don’t have an active care request right now.
            </p>
          )}
        </section>

        <section
          aria-labelledby="helping-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <HandHeart aria-hidden="true" />
            <h2 id="helping-heading">I’m helping</h2>
          </div>

          {claimedRequests.length > 0 ? (
            claimedRequests.map((request) => (
              <article
                aria-label={`Helping ${request.requester.displayName}`}
                className="my-care-card"
                key={request.id}
              >
                <span className="my-care-card__eyebrow">Meal commitment</span>
                <h3>You’re helping {request.requester.displayName}.</h3>
                <dl>
                  <div>
                    <dt>Need</dt>
                    <dd>{request.need}</dd>
                  </div>
                  <div>
                    <dt>Timing</dt>
                    <dd>{request.helpfulWhen}</dd>
                  </div>
                  <div>
                    <dt>Food that works</dt>
                    <dd>{request.foodWorks}</dd>
                  </div>
                  {request.foodDoesNotWork ? (
                    <div>
                      <dt>Please avoid</dt>
                      <dd>{request.foodDoesNotWork}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Handoff</dt>
                    <dd>{request.handoffStyle}</dd>
                  </div>
                </dl>
              </article>
            ))
          ) : (
            <p className="my-care-view__empty">
              You’re not helping with any care requests right now.
            </p>
          )}
        </section>

        <section
          aria-labelledby="history-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <Clock3 aria-hidden="true" />
            <h2 id="history-heading">Private history</h2>
          </div>

          {history.length > 0 ? (
            <ol className="my-care-history">
              {history.map((entry) => {
                const request = careLifecycle.requests.find(
                  (candidate) => candidate.id === entry.requestId,
                );
                return (
                  <li key={entry.id}>
                    <div>
                      <span>{historyLabels[entry.outcome]}</span>
                      <strong>{request?.need ?? "Care request"}</strong>
                    </div>
                    <time dateTime={entry.recordedAt}>
                      {historyDateFormatter.format(new Date(entry.recordedAt))}
                    </time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="my-care-view__empty">
              Completed and closed care will appear here for you only.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
