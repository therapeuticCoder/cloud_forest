import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { mealGratitudeStatements } from "@/data/careGratitudeStatements";
import type {
  CareHistoryGratitude,
  ReceiveCareRequest,
} from "@/types/careRequest";

export type CareGratitudeDraft = {
  message: string;
  statementId: CareHistoryGratitude["statementId"];
};

export type CareGratitudeResult = { ok: true } | { ok: false; message: string };

export function CareGratitudeWizard({
  onBack,
  onComplete,
  onSkip,
  request,
}: {
  onBack: () => void;
  onComplete: (draft: CareGratitudeDraft) => Promise<CareGratitudeResult>;
  onSkip: () => void;
  request: ReceiveCareRequest;
}) {
  const [step, setStep] = useState<"compose" | "confirm">("compose");
  const [statementId, setStatementId] = useState<
    CareHistoryGratitude["statementId"] | ""
  >("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [step]);

  return (
    <section
      aria-label={`Thank ${request.claimant?.displayName ?? "your helper"}`}
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
            {step === "compose" ? "Say thank you" : "Keep it private"}
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
            maxLength={1_000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="A short note, if you want"
            rows={3}
            value={message}
          />
          <button disabled={!statementId} type="submit">
            Continue
          </button>
          <button onClick={onSkip} type="button">
            Skip gratitude
          </button>
        </form>
      ) : (
        <div className="care-gratitude-view__confirm">
          <div className="care-gratitude-view__privacy-note">
            <LockKeyhole aria-hidden="true" />
            <div>
              <h2>
                Your gratitude stays private between you and your care partner.
              </h2>
              <p>Both participants will see it in private Care history.</p>
            </div>
          </div>
          {error ? (
            <p className="my-care-view__session-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="care-gratitude-view__confirm-actions">
            <button
              disabled={saving}
              onClick={() => {
                if (!statementId) return;
                setSaving(true);
                setError(undefined);
                void onComplete({
                  message: message.trim(),
                  statementId,
                }).then((result) => {
                  if (!result.ok) {
                    setError(result.message);
                    setSaving(false);
                  }
                });
              }}
              type="button"
            >
              <LockKeyhole aria-hidden="true" />
              {saving ? "Saving…" : "Save to private history"}
            </button>
            <button disabled={saving} onClick={onSkip} type="button">
              Skip gratitude
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
