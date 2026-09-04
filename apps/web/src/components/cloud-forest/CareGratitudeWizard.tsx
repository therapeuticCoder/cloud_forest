import { ArrowLeft, LockKeyhole, Sprout } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { mealGratitudeStatements } from "@/data/careGratitudeStatements";
import type { ReceiveCareRequest } from "@/types/careRequest";

export type CareGratitudeDraft = {
  anonymized: boolean;
  message: string;
  postToTimeline: boolean;
  statementId: string;
};

export function CareGratitudeWizard({
  onBack,
  onComplete,
  request,
}: {
  onBack: () => void;
  onComplete: (draft: CareGratitudeDraft) => void;
  request: ReceiveCareRequest;
}) {
  const [step, setStep] = useState<"compose" | "confirm">("compose");
  const [statementId, setStatementId] = useState("");
  const [message, setMessage] = useState("");
  const [anonymized, setAnonymized] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [step]);

  return (
    <section
      aria-label={`Thank ${request.requester.displayName}'s helper`}
      className="care-gratitude-view care-destination"
    >
      <header className="my-care-view__header">
        <Button
          aria-label="Back"
          className="party-wizard__icon-button"
          onClick={step === "compose" ? onBack : () => setStep("compose")}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <span>Care gratitude</span>
          <h1 ref={headingRef} tabIndex={-1}>
            {step === "compose" ? "Say thank you" : "Keep it private or share"}
          </h1>
        </div>
      </header>

      {step === "compose" ? (
        <form
          className="care-gratitude-view__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (statementId) setStep("confirm");
          }}
        >
          <fieldset>
            <legend>Choose a message</legend>
            <div className="care-gratitude-view__choices">
              {mealGratitudeStatements.map((statement) => (
                <label key={statement.id}>
                  <input
                    checked={statementId === statement.id}
                    name="gratitude-statement"
                    onChange={() => setStatementId(statement.id)}
                    type="radio"
                    value={statement.id}
                  />
                  <span>{statement.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="care-gratitude-message">
            Add your own words <span>(optional)</span>
          </label>
          <textarea
            id="care-gratitude-message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="A short note, if you want"
            rows={3}
            value={message}
          />
          <button disabled={!statementId} type="submit">
            Continue
          </button>
        </form>
      ) : (
        <div className="care-gratitude-view__confirm">
          <div className="care-gratitude-view__privacy-note">
            <LockKeyhole aria-hidden="true" />
            <div>
              <h2>Your private history keeps who gave and received care.</h2>
              <p>A Tribe post is optional and can hide your name.</p>
            </div>
          </div>
          <label className="care-gratitude-view__anonymous">
            <input
              checked={anonymized}
              onChange={(event) => setAnonymized(event.target.checked)}
              type="checkbox"
            />
            Post to Tribe as “A neighbor”
          </label>
          <div className="care-gratitude-view__confirm-actions">
            <button
              onClick={() =>
                onComplete({
                  anonymized: false,
                  message: message.trim(),
                  postToTimeline: false,
                  statementId,
                })
              }
              type="button"
            >
              <LockKeyhole aria-hidden="true" />
              Save to history
            </button>
            <button
              onClick={() =>
                onComplete({
                  anonymized,
                  message: message.trim(),
                  postToTimeline: true,
                  statementId,
                })
              }
              type="button"
            >
              <Sprout aria-hidden="true" />
              Post to Tribe and save to history
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
