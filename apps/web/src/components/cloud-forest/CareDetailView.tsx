import { ArrowLeft, Gift, HandHeart } from "lucide-react";
import { useEffect, useRef } from "react";

import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import type { Care, CarePersonId } from "@/types/care";
import { careCategoryName, careScheduleLabel } from "./carePresentation";
import { layerBackgrounds, layerOuterBackgrounds } from "./curatorLayerStyles";

export function CareDetailView({
  care,
  onBack,
  viewerId,
}: {
  care?: Care;
  onBack: () => void;
  viewerId: CarePersonId;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const layer = care?.audience ?? "Party";
  const DirectionIcon = care?.direction === "give" ? Gift : HandHeart;
  const rows = care
    ? [
        ["Care", careCategoryName(care.category)],
        ["What", care.subtype],
        ["When", careScheduleLabel({ ...care, fallback: "Flexible" })],
        ["Works well", care.requirements],
        ["Preferences", care.sensitivities],
        ["Location", care.location],
        ["Shared with", care.audience],
        [
          "Status",
          care.status === "not_completed"
            ? "Not completed"
            : care.status === "orphaned"
              ? "Connection ended"
              : care.status,
        ],
        [
          "Expires",
          care.expiresAt ? new Date(care.expiresAt).toLocaleString() : "",
        ],
        ["Care partner", care.participant?.displayName],
        [
          "Originator marked done",
          care.originatorCompletedAt
            ? new Date(care.originatorCompletedAt).toLocaleString()
            : "",
        ],
        [
          "Partner marked done",
          care.participantCompletedAt
            ? new Date(care.participantCompletedAt).toLocaleString()
            : "",
        ],
        [
          "Gratitude",
          care.gratitude
            ? getMealGratitudeStatement(care.gratitude.statementId)?.text
            : "",
        ],
        ["Personal thanks", care.gratitude?.message],
      ].filter(([, value]) => value)
    : [];

  return (
    <section
      aria-label="Care details"
      className={`care-destination care-detail ${layerOuterBackgrounds[layer]}`}
    >
      <div className={`care-detail__panel ${layerBackgrounds[layer]}`}>
        <button
          aria-label="Back to Timeline"
          className="care-detail__back"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <header className="care-detail__identity">
          <h1 ref={headingRef} tabIndex={-1}>
            {care
              ? `${careCategoryName(care.category)} Care`
              : "Care is no longer on your Timeline"}
          </h1>
          {care ? (
            <p>
              <DirectionIcon aria-hidden="true" />
              {care.direction === "give" ? "Give" : "Receive"} ·{" "}
              {care.originator.id === viewerId
                ? "Your Care"
                : care.originator.displayName}
            </p>
          ) : null}
        </header>
        {care ? (
          <dl className="care-destination__details care-detail__fields">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p role="status">Return to the Timeline for current Care.</p>
        )}
      </div>
    </section>
  );
}
