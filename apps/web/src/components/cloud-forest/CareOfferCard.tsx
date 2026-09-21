import { Gift, HeartHandshake, Network } from "lucide-react";

import type { GiveCareOffer } from "@/types/careRequest";
import { careOfferCategoryName, careScheduleLabel } from "./carePresentation";

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
  const categoryName = careOfferCategoryName(offer);
  const categoryLabel = categoryName.toLowerCase();
  const schedule = careScheduleLabel({
    days: offer.days,
    times: offer.times,
    timeNote: offer.timeNote,
    fallback: offer.availableWhen,
  });
  const requirements = offer.requirements ?? offer.mealDescription;
  const sensitivities = offer.sensitivities;
  const location = offer.location ?? offer.handoffStyle;

  return (
    <article
      aria-label={`Open ${categoryLabel} care offer`}
      className="care-request-card care-offer-card"
    >
      <div aria-hidden="true" className="care-request-card__mark">
        <Gift />
      </div>
      <div className="care-request-card__body">
        <div className="care-request-card__heading">
          <div>
            <span className="care-request-card__eyebrow">
              {categoryName} offer
            </span>
            <p className="care-offer-card__giver">
              {isSelfAuthored
                ? `You can provide this ${categoryLabel} care.`
                : `${offer.giver.displayName} can provide this ${categoryLabel} care.`}
            </p>
          </div>
          <span className="care-request-card__status">
            {offer.status === "expired" ? "Opportunity passed" : "Open"}
          </span>
        </div>
        <dl>
          <div>
            <dt>Care</dt>
            <dd>{categoryName}</dd>
          </div>
          {offer.subtype ? (
            <div>
              <dt>Type</dt>
              <dd>{offer.subtype}</dd>
            </div>
          ) : null}
          <div>
            <dt>When</dt>
            <dd>{schedule}</dd>
          </div>
          {requirements ? (
            <div>
              <dt>Works well</dt>
              <dd>{requirements}</dd>
            </div>
          ) : null}
          {sensitivities ? (
            <div>
              <dt>Preferences</dt>
              <dd>{sensitivities}</dd>
            </div>
          ) : null}
          <div>
            <dt>Location</dt>
            <dd>{location}</dd>
          </div>
        </dl>
        <div className="care-request-card__footer">
          <span>
            {offer.audience === "Party" ? (
              <HeartHandshake aria-hidden="true" />
            ) : (
              <Network aria-hidden="true" />
            )}{" "}
            Offered to: {offer.audience}
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
