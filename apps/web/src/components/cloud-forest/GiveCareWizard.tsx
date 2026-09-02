import { ArrowLeft, Check, Gift, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GiveCareOffer } from "@/types/careRequest";

type GiveCareWizardProps = {
  onCancel: () => void;
  onComplete: (offer: GiveCareOffer) => void;
};

const steps = ["Care", "Meal", "Timing", "Handoff", "Review"];
const careOptions = [
  { label: "Meal", value: "meal", enabled: true },
  { label: "Transportation", value: "transportation", enabled: false },
  { label: "Body double", value: "body-double", enabled: false },
  { label: "Spoon swap", value: "spoon-swap", enabled: false },
  { label: "Cleaning", value: "cleaning", enabled: false },
  { label: "Skilled time", value: "skilled-time", enabled: false },
];
const handoffOptions = [
  "I can deliver it",
  "Pickup works",
  "Share the meal with them",
  "I’m flexible",
];

export function GiveCareWizard({ onCancel, onComplete }: GiveCareWizardProps) {
  const wizardRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [careType, setCareType] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [availableWhen, setAvailableWhen] = useState("");
  const [handoffStyle, setHandoffStyle] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => {
      wizardRef.current
        ?.querySelector<HTMLElement>("[data-wizard-focus]")
        ?.focus();
    });
  }, []);

  const canContinue =
    (step === 0 && careType.length > 0) ||
    (step === 1 && mealDescription.trim().length > 0) ||
    (step === 2 && availableWhen.trim().length > 0) ||
    (step === 3 && handoffStyle.length > 0) ||
    step === 4;

  const handleNext = () => {
    if (!canContinue) return;
    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    onComplete({
      id: `care-offer-${Date.now()}`,
      kind: "meal",
      direction: "give",
      offer: "A meal",
      mealDescription: mealDescription.trim(),
      availableWhen: availableWhen.trim(),
      handoffStyle,
      audience: "Party",
      status: "available",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <section
      ref={wizardRef}
      aria-label="Offer a meal to my Party"
      className="party-wizard"
    >
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
          aria-label="Cancel offering care"
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
              What kind of care would you like to offer?
            </h1>
            <span className="party-wizard__hint">
              Choose what you can offer your Party right now.
            </span>
            <div
              aria-label="Types of care"
              className="party-wizard__options party-wizard__care-options"
            >
              {careOptions.map((option) => (
                <Button
                  aria-pressed={careType === option.value}
                  className="party-wizard__option"
                  data-wizard-focus={
                    option.value === "meal" ? "true" : undefined
                  }
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
            <span className="party-wizard__title">
              What meal could you offer?
            </span>
            <span className="party-wizard__hint">
              Share a simple description of what you could provide.
            </span>
            <textarea
              autoFocus
              className="party-wizard__input party-wizard__textarea"
              onChange={(event) => setMealDescription(event.target.value)}
              placeholder="Soup, rice, or something easy"
              value={mealDescription}
            />
          </label>
        ) : null}

        {step === 2 ? (
          <label className="party-wizard__question">
            <span className="party-wizard__title">
              When could you provide it?
            </span>
            <span className="party-wizard__hint">
              A day or time is enough. You can keep it simple.
            </span>
            <input
              autoFocus
              className="party-wizard__input"
              onChange={(event) => setAvailableWhen(event.target.value)}
              placeholder="Saturday afternoon"
              value={availableWhen}
            />
          </label>
        ) : null}

        {step === 3 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">How could you share it?</h1>
            <span className="party-wizard__hint">
              Choose the handoff that feels right for you.
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
            <Gift aria-hidden="true" className="give-care-icon" />
            <h1 className="party-wizard__title">
              Ready to offer your Party a meal?
            </h1>
            <div className="receive-care-review">
              <p>
                <strong>Meal:</strong> {mealDescription}
              </p>
              <p>
                <strong>Available:</strong> {availableWhen}
              </p>
              <p>
                <strong>Handoff:</strong> {handoffStyle}
              </p>
            </div>
            <p className="party-wizard__hint">
              This offer will be shared with your Party.
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
          {step === 4 ? "Offer to my Party" : "Continue"}
        </Button>
      </footer>
    </section>
  );
}
