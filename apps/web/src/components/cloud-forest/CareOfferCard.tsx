import { Gift, UsersRound } from "lucide-react";

import type { GiveCareOffer } from "@/types/careRequest";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareOfferCard({
  offer,
  onWithdraw,
}: {
  offer: GiveCareOffer;
  onWithdraw: (offerId: string) => void;
}) {
  return (
    <article
      aria-label="Open meal care offer"
      className="care-request-card care-offer-card"
    >
      <div aria-hidden="true" className="care-request-card__mark">
        <Gift />
      </div>
      <div className="care-request-card__body">
        <div className="care-request-card__heading">
          <div>
            <span className="care-request-card__eyebrow">Meal offer</span>
          </div>
          <span className="care-request-card__status">Open</span>
        </div>
        <dl>
          <div>
            <dt>Could provide</dt>
            <dd>{offer.mealDescription}</dd>
          </div>
          <div>
            <dt>Available</dt>
            <dd>{offer.availableWhen}</dd>
          </div>
          <div>
            <dt>Handoff</dt>
            <dd>{offer.handoffStyle}</dd>
          </div>
        </dl>
        <div className="care-request-card__footer">
          <span>
            <UsersRound aria-hidden="true" /> Shared with: {offer.audience}
          </span>
          <time dateTime={offer.createdAt}>
            {formatter.format(new Date(offer.createdAt))}
          </time>
        </div>
        <button
          className="care-request-card__withdraw"
          onClick={() => onWithdraw(offer.id)}
          type="button"
        >
          Withdraw offer
        </button>
      </div>
    </article>
  );
}
