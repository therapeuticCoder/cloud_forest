import { ArrowLeft, Check, HandHeart } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { ReceiveCareRequest } from "@/types/careRequest";

type ClaimCareViewProps = {
  onBack: () => void;
  onConfirm: () => void;
  request: ReceiveCareRequest;
};

export function ClaimCareView({
  onBack,
  onConfirm,
  request,
}: ClaimCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

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
            Help {request.requester.displayName} with this meal?
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
              <dt>Need</dt>
              <dd>{request.need}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{request.helpfulWhen}</dd>
            </div>
            <div>
              <dt>Food that works</dt>
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
        </div>
      </div>

      <footer className="party-wizard__footer">
        <Button
          className="party-wizard__continue"
          onClick={onConfirm}
          size="lg"
          type="button"
        >
          <Check aria-hidden="true" /> I’ll help with this
        </Button>
      </footer>
    </section>
  );
}
