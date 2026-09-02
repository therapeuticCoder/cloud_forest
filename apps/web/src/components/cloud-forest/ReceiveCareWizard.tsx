import { ArrowLeft, Check, HandHeart, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ReceiveCareRequest } from "@/types/careRequest";

type ReceiveCareWizardProps = {
  onCancel: () => void;
  onComplete: (request: ReceiveCareRequest) => void;
};

const steps = ["Care", "Timing", "Food", "Handoff", "Review"];
const careOptions = [
  { label: "Meal", value: "meal", enabled: true },
  { label: "Transportation", value: "transportation", enabled: false },
  { label: "Body double", value: "body-double", enabled: false },
  { label: "Spoon swap", value: "spoon-swap", enabled: false },
  { label: "Cleaning", value: "cleaning", enabled: false },
  { label: "Skilled time", value: "skilled-time", enabled: false },
];
const handoffOptions = [
  "Leave it at my door",
  "Hand it to me",
  "Share the meal with me",
  "I’m flexible",
];

export function ReceiveCareWizard({
  onCancel,
  onComplete,
}: ReceiveCareWizardProps) {
  const [step, setStep] = useState(0);
  const [careType, setCareType] = useState("");
  const [helpfulWhen, setHelpfulWhen] = useState("");
  const [foodWorks, setFoodWorks] = useState("");
  const [foodDoesNotWork, setFoodDoesNotWork] = useState("");
  const [handoffStyle, setHandoffStyle] = useState("");

  const canContinue =
    (step === 0 && careType.length > 0) ||
    (step === 1 && helpfulWhen.trim().length > 0) ||
    (step === 2 && foodWorks.trim().length > 0) ||
    (step === 3 && handoffStyle.length > 0) ||
    step === 4;

  const handleNext = () => {
    if (!canContinue) return;
    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    onComplete({
      id: `care-request-${Date.now()}`,
      kind: "meal",
      need: "A meal",
      helpfulWhen: helpfulWhen.trim(),
      foodWorks: foodWorks.trim(),
      foodDoesNotWork: foodDoesNotWork.trim(),
      handoffStyle,
      audience: "Party",
      status: "open",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <section aria-label="Ask my Party for a meal" className="party-wizard">
      <header className="party-wizard__header">
        <Button
          aria-label={step === 0 ? "Close wizard" : "Back"}
          className="party-wizard__icon-button"
          onClick={
            step === 0 ? onCancel : () => setStep((current) => current - 1)
          }
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          {step === 0 ? (
            <X aria-hidden="true" />
          ) : (
            <ArrowLeft aria-hidden="true" />
          )}
        </Button>
        <span className="party-wizard__step">
          {step + 1} of {steps.length}
        </span>
        <Button
          aria-label="Cancel asking for care"
          className="party-wizard__cancel"
          onClick={onCancel}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </header>

      <div className="party-wizard__progress" aria-hidden="true">
        {steps.map((label, index) => (
          <span className={index <= step ? "is-current" : ""} key={label} />
        ))}
      </div>

      <div className="party-wizard__content">
        {step === 0 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              What kind of care would help?
            </h1>
            <span className="party-wizard__hint">
              Choose what you need most right now.
            </span>
            <div
              aria-label="Types of care"
              className="party-wizard__options party-wizard__care-options"
            >
              {careOptions.map((option) => (
                <Button
                  aria-pressed={careType === option.value}
                  className="party-wizard__option"
                  disabled={!option.enabled}
                  key={option.value}
                  onClick={() => setCareType(option.value)}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <label className="party-wizard__question">
            <span className="party-wizard__title">When would a meal help?</span>
            <span className="party-wizard__hint">
              A day or time is enough. You can keep it simple.
            </span>
            <input
              autoFocus
              className="party-wizard__input"
              onChange={(event) => setHelpfulWhen(event.target.value)}
              placeholder="Tonight after 6"
              value={helpfulWhen}
            />
          </label>
        ) : null}

        {step === 2 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">What food works for you?</h1>
            <span className="party-wizard__hint">
              Share what would feel good, and anything your Party should avoid.
            </span>
            <label className="party-wizard__field">
              <span>Works for me</span>
              <textarea
                autoFocus
                className="party-wizard__input party-wizard__textarea"
                onChange={(event) => setFoodWorks(event.target.value)}
                placeholder="Soup, rice, or something easy"
                value={foodWorks}
              />
            </label>
            <label className="party-wizard__field">
              <span>Doesn’t work for me</span>
              <textarea
                className="party-wizard__input party-wizard__textarea"
                onChange={(event) => setFoodDoesNotWork(event.target.value)}
                placeholder="Anything to avoid? (Optional)"
                value={foodDoesNotWork}
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              How would you like to receive it?
            </h1>
            <span className="party-wizard__hint">
              Choose the handoff that asks the least of you right now.
            </span>
            <div
              aria-label="Preferred handoff style"
              className="party-wizard__options"
            >
              {handoffOptions.map((option) => (
                <Button
                  aria-pressed={handoffStyle === option}
                  className="party-wizard__option"
                  key={option}
                  onClick={() => setHandoffStyle(option)}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="party-wizard__question party-wizard__preview-wrap">
            <HandHeart aria-hidden="true" className="receive-care-icon" />
            <h1 className="party-wizard__title">Ready to ask your Party?</h1>
            <div className="receive-care-review">
              <p>
                <strong>Would help:</strong> {helpfulWhen}
              </p>
              <p>
                <strong>Works for me:</strong> {foodWorks}
              </p>
              {foodDoesNotWork.trim() ? (
                <p>
                  <strong>Please avoid:</strong> {foodDoesNotWork}
                </p>
              ) : null}
              <p>
                <strong>Handoff:</strong> {handoffStyle}
              </p>
            </div>
            <p className="party-wizard__hint">
              This request will be shared with your Party.
            </p>
          </div>
        ) : null}
      </div>

      <footer className="party-wizard__footer">
        <Button
          className="party-wizard__continue"
          disabled={!canContinue}
          onClick={handleNext}
          size="lg"
          type="button"
        >
          {step === 4 ? <Check aria-hidden="true" /> : null}
          {step === 4 ? "Ask my Party" : "Continue"}
        </Button>
      </footer>
    </section>
  );
}
