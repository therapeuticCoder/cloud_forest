import { ArrowLeft, Check, HandHeart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ReceiveCareRequest } from "@/types/careRequest";
import { careRequestCategoryName, careScheduleLabel } from "./carePresentation";

type ClaimCareViewProps = {
  onBack: () => void;
  onConfirm: () => Promise<{ ok: true } | { ok: false; message: string }>;
  request: ReceiveCareRequest;
};

export function ClaimCareView({
  onBack,
  onConfirm,
  request,
}: ClaimCareViewProps) {
  const categoryName = careRequestCategoryName(request);
  const schedule = careScheduleLabel({
    days: request.days,
    times: request.times,
    timeNote: request.timeNote,
    fallback: request.helpfulWhen,
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
      aria-label={`Commit to helping ${request.requester.displayName}`}
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
            Help {request.requester.displayName} with this{" "}
            {categoryName.toLowerCase()} care?
          </h1>
          <p className="party-wizard__hint">
            This makes a commitment to provide this care.
          </p>
          <dl className="receive-care-review care-destination__details">
            <div>
              <dt>Requester</dt>
              <dd>{request.requester.displayName}</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>{categoryName}</dd>
            </div>
            {request.subtype ? (
              <div>
                <dt>Type</dt>
                <dd>{request.subtype}</dd>
              </div>
            ) : null}
            <div>
              <dt>When</dt>
              <dd>{schedule}</dd>
            </div>
            {(request.requirements ?? request.foodWorks) ? (
              <div>
                <dt>Works well</dt>
                <dd>{request.requirements ?? request.foodWorks}</dd>
              </div>
            ) : null}
            {(request.sensitivities ?? request.foodDoesNotWork) ? (
              <div>
                <dt>Preferences</dt>
                <dd>{request.sensitivities ?? request.foodDoesNotWork}</dd>
              </div>
            ) : null}
            <div>
              <dt>Location</dt>
              <dd>{request.location ?? request.handoffStyle}</dd>
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
          <Check aria-hidden="true" /> I’ll help with this
        </Button>
      </footer>
    </section>
  );
}
