import { Sprout } from "lucide-react";

import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import type { CareGratitude, ReceiveCareRequest } from "@/types/careRequest";

export function CareGratitudeCard({
  gratitude,
  request,
}: {
  gratitude: CareGratitude;
  request: ReceiveCareRequest;
}) {
  const author = gratitude.anonymized
    ? "A neighbor"
    : request.requester.displayName;
  const statement = getMealGratitudeStatement(gratitude.statementId);

  return (
    <article
      aria-label={`Tribe gratitude from ${author}`}
      className="care-gratitude-card"
    >
      <div aria-hidden="true" className="care-gratitude-card__mark">
        <Sprout />
      </div>
      <div>
        <div className="care-gratitude-card__heading">
          <span>Care gratitude</span>
          <strong>Tribe</strong>
        </div>
        <h2>{author}</h2>
        <p>{statement?.text ?? "Thank you for showing up with care."}</p>
        {gratitude.message ? (
          <blockquote>{gratitude.message}</blockquote>
        ) : null}
      </div>
    </article>
  );
}
