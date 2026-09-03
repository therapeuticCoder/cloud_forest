import { ArrowLeft, HandHeart } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { ReceiveCareRequest } from "@/types/careRequest";

type MyCareViewProps = {
  claimedRequests: ReceiveCareRequest[];
  onBack: () => void;
};

export function MyCareView({ claimedRequests, onBack }: MyCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  return (
    <section aria-label="My Care" className="my-care-view care-destination">
      <header className="my-care-view__header">
        <Button
          aria-label="Back"
          className="party-wizard__icon-button"
          onClick={onBack}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <span>Personal care commitments</span>
          <h1 ref={headingRef} tabIndex={-1}>
            My Care
          </h1>
        </div>
      </header>

      <div className="my-care-view__content">
        <section
          aria-labelledby="helping-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <HandHeart aria-hidden="true" />
            <h2 id="helping-heading">I’m helping</h2>
          </div>

          {claimedRequests.length > 0 ? (
            claimedRequests.map((request) => (
              <article
                aria-label={`Helping ${request.requester.displayName}`}
                className="my-care-card"
                key={request.id}
              >
                <span className="my-care-card__eyebrow">Meal commitment</span>
                <h3>You’re helping {request.requester.displayName}.</h3>
                <dl>
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
              </article>
            ))
          ) : (
            <p className="my-care-view__empty">
              You’re not helping with any care requests right now.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
