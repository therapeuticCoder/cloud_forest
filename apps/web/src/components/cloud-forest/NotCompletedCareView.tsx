import { ArrowLeft, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ReceiveCareRequest } from "@/types/careRequest";

export function NotCompletedCareView({
  onBack,
  onConfirm,
  request,
}: {
  onBack: () => void;
  onConfirm: (reason: string, tryAgain: boolean) => void;
  request: ReceiveCareRequest;
}) {
  const [reason, setReason] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reasonIsPresent = reason.trim().length > 0;

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  return (
    <section
      aria-label={`Care was not completed for ${request.requester.displayName}`}
      className="care-outcome-view care-destination"
    >
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
          <span>Care outcome</span>
          <h1 ref={headingRef} tabIndex={-1}>
            Not completed
          </h1>
        </div>
      </header>

      <form
        className="care-outcome-view__form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <h2>What got in the way?</h2>
          <p>
            This stays in the participants’ private care history. It is not a
            rating or a public report.
          </p>
        </div>
        <label htmlFor="care-outcome-reason">Reason</label>
        <textarea
          autoFocus
          id="care-outcome-reason"
          onChange={(event) => setReason(event.target.value)}
          placeholder="The timing did not work"
          rows={4}
          value={reason}
        />
        <div className="care-outcome-view__actions">
          <button
            disabled={!reasonIsPresent}
            onClick={() => onConfirm(reason.trim(), true)}
            type="button"
          >
            <RotateCcw aria-hidden="true" />
            Postpone / try again
          </button>
          <button
            disabled={!reasonIsPresent}
            onClick={() => onConfirm(reason.trim(), false)}
            type="button"
          >
            <X aria-hidden="true" />
            Close
          </button>
        </div>
      </form>
    </section>
  );
}
