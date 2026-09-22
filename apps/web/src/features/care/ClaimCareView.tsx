import { ArrowLeft, Check, HandHeart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Care } from "@/types/care";
import { careCategoryName, careScheduleLabel } from "./carePresentation";

type ClaimCareViewProps = {
  onBack: () => void;
  onConfirm: () => Promise<{ ok: true } | { ok: false; message: string }>;
  care: Care;
};

export function ClaimCareView({ onBack, onConfirm, care }: ClaimCareViewProps) {
  const categoryName = careCategoryName(care.category);
  const schedule = careScheduleLabel({
    days: care.days,
    times: care.times,
    timeNote: care.timeNote,
    fallback: "Flexible",
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(undefined);
    const result = await onConfirm();
    if (!result.ok) setError(result.message);
    setSubmitting(false);
  };

  return (
    <section
      aria-label={`Commit to ${care.direction === "give" ? "receiving" : "helping"} ${care.originator.displayName}`}
      className="party-wizard care-destination"
    >
      <header className="party-wizard__header">
        <Button
          aria-label="Back to Timeline"
          className="party-wizard__icon-button"
          onClick={onBack}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <span className="party-wizard__step">Commitment</span>
        <Button
          className="party-wizard__cancel"
          onClick={onBack}
          type="button"
          variant="ghost"
        >
          Not now
        </Button>
      </header>

      <div className="party-wizard__content">
        <div className="party-wizard__question party-wizard__preview-wrap">
          <HandHeart aria-hidden="true" className="receive-care-icon" />
          <h1 ref={headingRef} className="party-wizard__title" tabIndex={-1}>
            {care.direction === "give" ? "Receive this from" : "Help"}{" "}
            {care.originator.displayName} with this {categoryName.toLowerCase()}{" "}
            care?
          </h1>
          <p className="party-wizard__hint">
            {care.direction === "give"
              ? "This makes a commitment to receive this Care."
              : "This makes a commitment to help with this Care."}
          </p>
          <dl className="receive-care-review care-destination__details">
            <div>
              <dt>Care partner</dt>
              <dd>{care.originator.displayName}</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>{categoryName}</dd>
            </div>
            {care.subtype ? (
              <div>
                <dt>Type</dt>
                <dd>{care.subtype}</dd>
              </div>
            ) : null}
            <div>
              <dt>When</dt>
              <dd>{schedule}</dd>
            </div>
            {care.requirements ? (
              <div>
                <dt>Works well</dt>
                <dd>{care.requirements}</dd>
              </div>
            ) : null}
            {care.sensitivities ? (
              <div>
                <dt>Preferences</dt>
                <dd>{care.sensitivities}</dd>
              </div>
            ) : null}
            <div>
              <dt>Location</dt>
              <dd>{care.location}</dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="party-wizard__footer">
        {error ? (
          <p className="party-wizard__error" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          className="party-wizard__continue"
          disabled={submitting}
          onClick={() => void confirm()}
          size="lg"
          type="button"
        >
          <Check aria-hidden="true" />
          {care.direction === "give"
            ? " I’ll receive this"
            : " I’ll help with this"}
        </Button>
      </footer>
    </section>
  );
}
