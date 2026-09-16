import { Gift, UsersRound } from "lucide-react";

import type { GiveCareOffer } from "@/types/careRequest";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareOfferCard({
  canPass = false,
  onClaim,
  onPass,
  offer,
  onWithdraw,
  viewerId,
}: {
  canPass?: boolean;
  onClaim?: (offerId: string) => void;
  onPass?: (offer: GiveCareOffer) => void;
  offer: GiveCareOffer;
  onWithdraw: (offerId: string) => void;
  viewerId: string;
}) {
  const isSelfAuthored = offer.giver.id === viewerId;

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
            <p className="care-offer-card__giver">
              {isSelfAuthored
                ? "You can provide this care."
                : `${offer.giver.displayName} can provide this care.`}
            </p>
          </div>
          <span className="care-request-card__status">
            {offer.status === "expired" ? "Opportunity passed" : "Open"}
          </span>
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
            <UsersRound aria-hidden="true" /> Offered to: {offer.audience}
          </span>
          <time dateTime={offer.createdAt}>
            {formatter.format(new Date(offer.createdAt))}
          </time>
        </div>
        {isSelfAuthored ? (
          <button
            className="care-request-card__withdraw"
            onClick={() => onWithdraw(offer.id)}
            type="button"
          >
            Withdraw offer
          </button>
        ) : onClaim ? (
          <div className="care-request-card__actions">
            <button
              className="care-request-card__claim"
              onClick={() => onClaim(offer.id)}
              type="button"
            >
              I will receive this
            </button>
            {canPass && onPass ? (
              <button
                className="care-request-card__pass"
                onClick={() => onPass(offer)}
                type="button"
              >
                Pass this time
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
