import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { mealApologyStatements } from "@/data/careApologyStatements";
import type {
  CareHistoryApology,
  ReceiveCareRequest,
} from "@/types/careRequest";

export type CareWithdrawalDraft = {
  message: string;
  statementId: CareHistoryApology["statementId"];
};

export type CareWithdrawalResult =
  | { ok: true }
  | { ok: false; message: string };

export function CareWithdrawalWizard({
  onBack,
  onComplete,
  request,
}: {
  onBack: () => void;
  onComplete: (draft: CareWithdrawalDraft) => Promise<CareWithdrawalResult>;
  request: ReceiveCareRequest;
}) {
  const [step, setStep] = useState<"compose" | "confirm">("compose");
  const [statementId, setStatementId] = useState<
    CareHistoryApology["statementId"] | ""
  >("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const carePartnerName =
    request.requester.kind === "self"
      ? (request.claimant?.displayName ?? "your care partner")
      : request.requester.displayName;

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [step]);

  return (
    <section
      aria-label={`Withdraw committed Care with ${carePartnerName}`}
      className="care-gratitude-view care-withdrawal-view care-destination"
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
          <span>Care withdrawal</span>
          <h1 ref={headingRef} tabIndex={-1}>
            {step === "compose"
              ? "I can’t complete this Care"
              : "Acknowledge and close"}
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
          <div>
            <h2>Would you like to say anything?</h2>
            <p>
              Choose a short apology for your care partner. Your own words are
              optional.
            </p>
          </div>
          <fieldset>
            <legend>Choose an apology</legend>
            <div className="care-gratitude-view__choices">
              {mealApologyStatements.map((statement) => (
                <label key={statement.id}>
                  <input
                    checked={statementId === statement.id}
                    name="care-apology-statement"
                    onChange={() => setStatementId(statement.id)}
                    type="radio"
                    value={statement.id}
                  />
                  <span>{statement.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="care-withdrawal-message">
            Add your own words <span>(optional)</span>
          </label>
          <textarea
            id="care-withdrawal-message"
            maxLength={1_000}
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
              <h2>This stays private between you and your care partner.</h2>
              <p>
                The Care will close as not completed. Both participants will see
                this apology in private Care history.
              </p>
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
              {saving ? "Closing…" : "Close Care as not completed"}
            </button>
            <button
              disabled={saving}
              onClick={() => setStep("compose")}
              type="button"
            >
              Back to apology
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
