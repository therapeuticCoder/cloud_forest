import { HandHeart, UsersRound } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ReceiveCareRequest } from "@/types/careRequest";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareRequestCard({
  claimed,
  canPass,
  minimized,
  onOfferHelp,
  onPass,
  onSetMinimized,
  onWithdraw,
  request,
}: {
  claimed: boolean;
  canPass: boolean;
  minimized: boolean;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onSetMinimized: (requestId: string, minimized: boolean) => void;
  onWithdraw: (requestId: string) => void;
  request: ReceiveCareRequest;
}) {
  const isSelfAuthored = request.requester.kind === "self";
  const requesterFirstName = request.requester.displayName.split(" ")[0];
  const presentationButtonRef = useRef<HTMLButtonElement>(null);
  const restorePresentationFocusRef = useRef(false);
  const articleLabel = isSelfAuthored
    ? "Open meal care request"
    : `Incoming meal care request from ${request.requester.displayName}`;
  const setMinimized = (nextMinimized: boolean) => {
    restorePresentationFocusRef.current = true;
    onSetMinimized(request.id, nextMinimized);
  };

  useEffect(() => {
    if (!restorePresentationFocusRef.current) return;
    restorePresentationFocusRef.current = false;
    requestAnimationFrame(() => presentationButtonRef.current?.focus());
  }, [minimized]);

  if (minimized) {
    return (
      <article
        aria-label={`${articleLabel}, minimized`}
        className={`care-request-card care-request-card--minimized${isSelfAuthored ? "" : " care-request-card--incoming"}`}
      >
        <div aria-hidden="true" className="care-request-card__mark">
          <HandHeart />
        </div>
        <div className="care-request-card__body care-request-card__body--minimized">
          <div>
            <span className="care-request-card__eyebrow">Meal request</span>
            <h2>
              {isSelfAuthored
                ? "Your meal request"
                : `${requesterFirstName} asked for a meal`}
            </h2>
            <time dateTime={request.createdAt}>
              {formatter.format(new Date(request.createdAt))}
            </time>
          </div>
          <span className="care-request-card__status">
            {claimed ? "Committed" : isSelfAuthored ? "Open" : "Needs help"}
          </span>
          <button
            className="care-request-card__presentation"
            onClick={() => setMinimized(false)}
            ref={presentationButtonRef}
            type="button"
          >
            Show details
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      aria-label={articleLabel}
      className={`care-request-card${isSelfAuthored ? "" : " care-request-card--incoming"}`}
    >
      <div aria-hidden="true" className="care-request-card__mark">
        <HandHeart />
      </div>
      <div className="care-request-card__body">
        <div className="care-request-card__heading">
          <div>
            <span className="care-request-card__eyebrow">Meal request</span>
            <h2>
              {isSelfAuthored
                ? "Your meal request"
                : `${requesterFirstName} is asking for a meal`}
            </h2>
          </div>
          <span className="care-request-card__status">
            {claimed ? "Committed" : isSelfAuthored ? "Open" : "Needs help"}
          </span>
        </div>
        <dl>
          <div>
            <dt>Would help</dt>
            <dd>{request.helpfulWhen}</dd>
          </div>
          <div>
            <dt>Works for me</dt>
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
        <div className="care-request-card__footer">
          <span>
            <UsersRound aria-hidden="true" />
            {isSelfAuthored
              ? `Shared with: ${request.audience}`
              : `From your ${request.audience}`}
          </span>
          <time dateTime={request.createdAt}>
            {formatter.format(new Date(request.createdAt))}
          </time>
        </div>
        <button
          className="care-request-card__presentation"
          onClick={() => setMinimized(true)}
          ref={presentationButtonRef}
          type="button"
        >
          I’ve seen this
        </button>
        {isSelfAuthored ? (
          <button
            className="care-request-card__withdraw"
            onClick={() => onWithdraw(request.id)}
            type="button"
          >
            Withdraw request
          </button>
        ) : claimed ? (
          <p
            className="care-request-card__commitment"
            data-care-claim-status={request.id}
            tabIndex={-1}
          >
            You’re helping {requesterFirstName}.
          </p>
        ) : (
          <div className="care-request-card__actions">
            <button
              className="care-request-card__claim"
              data-care-claim-action={request.id}
              onClick={() => onOfferHelp(request)}
              type="button"
            >
              I can help
            </button>
            {canPass ? (
              <button
                className="care-request-card__pass"
                onClick={() => onPass(request)}
                type="button"
              >
                Pass this time
              </button>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
