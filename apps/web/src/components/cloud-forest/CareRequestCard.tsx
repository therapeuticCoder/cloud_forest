import { HandHeart, UsersRound } from "lucide-react";

import type { ReceiveCareRequest } from "@/types/careRequest";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareRequestCard({
  claimed,
  onOfferHelp,
  onWithdraw,
  request,
}: {
  claimed: boolean;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onWithdraw: (requestId: string) => void;
  request: ReceiveCareRequest;
}) {
  const isSelfAuthored = request.requester.kind === "self";
  const requesterFirstName = request.requester.displayName.split(" ")[0];

  return (
    <article
      aria-label={
        isSelfAuthored
          ? "Open meal care request"
          : `Incoming meal care request from ${request.requester.displayName}`
      }
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
          <button
            className="care-request-card__claim"
            data-care-claim-action={request.id}
            onClick={() => onOfferHelp(request)}
            type="button"
          >
            I can help
          </button>
        )}
      </div>
    </article>
  );
}
