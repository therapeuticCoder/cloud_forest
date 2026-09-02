import { HandHeart, UsersRound } from "lucide-react";

import type { ReceiveCareRequest } from "@/types/careRequest";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareRequestCard({
  onWithdraw,
  request,
}: {
  onWithdraw: (requestId: string) => void;
  request: ReceiveCareRequest;
}) {
  return (
    <article aria-label="Open meal care request" className="care-request-card">
      <div aria-hidden="true" className="care-request-card__mark">
        <HandHeart />
      </div>
      <div className="care-request-card__body">
        <div className="care-request-card__heading">
          <div>
            <span className="care-request-card__eyebrow">Meal request</span>
          </div>
          <span className="care-request-card__status">Open</span>
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
            <UsersRound aria-hidden="true" /> Shared with: {request.audience}
          </span>
          <time dateTime={request.createdAt}>
            {formatter.format(new Date(request.createdAt))}
          </time>
        </div>
        <button
          className="care-request-card__withdraw"
          onClick={() => onWithdraw(request.id)}
          type="button"
        >
          Withdraw request
        </button>
      </div>
    </article>
  );
}
