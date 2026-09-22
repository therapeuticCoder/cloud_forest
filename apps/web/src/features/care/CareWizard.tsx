import { dayLabels, timeLabels } from "./carePresentation";
import { ArrowLeft, Check, Gift, HandHeart, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  careCategories,
  careDays,
  careTimes,
  getCareCategory,
  type CareCategoryId,
} from "@cloud-forest/domain";

import {
  careExpirationOptions,
  type CareDraft,
  type CareWizardDirection,
  type CareDay,
  type CareTime,
  type CareAudience,
  type CareExpiration,
} from "@/types/care";

type CompletionResult = { ok: true } | { ok: false; message: string } | void;

type CareWizardProps = {
  direction: CareWizardDirection;
  onCancel: () => void;
  onComplete: (draft: CareDraft) => Promise<CompletionResult>;
};

type CareWizardStep =
  | "category"
  | "subtype"
  | "schedule"
  | "location"
  | "preferences"
  | "expiration"
  | "layer";

function hasSubtypes(category: CareCategoryId | "") {
  if (!category) return false;
  const definition = getCareCategory(category);
  return Boolean(
    definition?.receiveOptions?.length || definition?.giveOptions?.length,
  );
}

function toggleValue<Value extends string>(values: Value[], value: Value) {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

export function CareWizard({
  direction,
  onCancel,
  onComplete,
}: CareWizardProps) {
  const wizardRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CareCategoryId | "">("");
  const [subtype, setSubtype] = useState("");
  const [days, setDays] = useState<CareDay[]>([]);
  const [times, setTimes] = useState<CareTime[]>([]);
  const [timeNote, setTimeNote] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [sensitivities, setSensitivities] = useState("");
  const [expiresIn, setExpiresIn] = useState<CareExpiration | "">("");
  const [audience, setAudience] = useState<CareAudience>("Party");
  const [submissionError, setSubmissionError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const wizardSteps: CareWizardStep[] = [
    "category",
    ...(hasSubtypes(category) ? ["subtype" as const] : []),
    "schedule",
    "location",
    "preferences",
    "expiration",
    "layer",
  ];
  const activeStep = wizardSteps[step] ?? "category";
  const definition = category ? getCareCategory(category) : undefined;
  const subtypeOptions =
    direction === "receive"
      ? definition?.receiveOptions
      : definition?.giveOptions;
  const directionLabel = direction === "receive" ? "receive" : "offer";
  const cancelLabel = direction === "receive" ? "asking for" : "offering";
  const actionLabel =
    direction === "receive" ? `Ask my ${audience}` : `Offer to my ${audience}`;

  useEffect(() => {
    requestAnimationFrame(() => {
      wizardRef.current
        ?.querySelector<HTMLElement>("[data-wizard-focus]")
        ?.focus();
    });
  }, [step]);

  const canContinue =
    (activeStep === "category" && category.length > 0) ||
    (activeStep === "subtype" && subtype.length > 0) ||
    (activeStep === "schedule" && days.length > 0 && times.length > 0) ||
    (activeStep === "location" && location.trim().length > 0) ||
    activeStep === "preferences" ||
    (activeStep === "expiration" && expiresIn.length > 0) ||
    (activeStep === "layer" && audience.length > 0);

  const handleNext = async () => {
    if (submitting || !canContinue) return;
    if (step < wizardSteps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    if (!category || !expiresIn) return;
    setSubmitting(true);
    setSubmissionError(undefined);
    const result = await onComplete({
      category,
      subtype: subtype.trim(),
      days,
      times,
      timeNote: timeNote.trim(),
      location: location.trim(),
      requirements: requirements.trim(),
      sensitivities: sensitivities.trim(),
      expiresIn,
      audience,
    });
    if (result && !result.ok) setSubmissionError(result.message);
    setSubmitting(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key !== "Enter" ||
      event.nativeEvent.isComposing ||
      !(
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) ||
      !canContinue ||
      submitting
    ) {
      return;
    }
    event.preventDefault();
    void handleNext();
  };

  return (
    <section
      ref={wizardRef}
      aria-label={`${direction === "receive" ? "Ask" : "Offer"} Care to my ${audience}`}
      className="party-wizard"
      onKeyDown={handleKeyDown}
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
          {step + 1} of {wizardSteps.length}
        </span>
        <Button
          aria-label={`Cancel ${cancelLabel} Care`}
          className="party-wizard__cancel"
          onClick={onCancel}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </header>

      <div
        aria-hidden="true"
        className="party-wizard__progress"
        data-step-count={wizardSteps.length}
      >
        {wizardSteps.map((wizardStep, index) => (
          <span
            className={index <= step ? "is-current" : ""}
            key={wizardStep}
          />
        ))}
      </div>

      <div className="party-wizard__content">
        {activeStep === "category" ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              What kind of Care would you like to {directionLabel}?
            </h1>
            <span className="party-wizard__hint">
              Choose the kind of practical support that fits best.
            </span>
            <div
              aria-label="Care categories"
              className="party-wizard__options party-wizard__care-options"
            >
              {careCategories.map((option, index) => (
                <Button
                  aria-pressed={category === option.id}
                  className="party-wizard__option"
                  data-wizard-focus={index === 0 ? "true" : undefined}
                  key={option.id}
                  onClick={() => {
                    setCategory(option.id);
                    setSubtype("");
                  }}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  <span>
                    <strong>{option.name}</strong>
                    <small>{option.description}</small>
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {activeStep === "subtype" && definition && subtypeOptions ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              {direction === "receive"
                ? definition.receiveQuestion
                : definition.giveQuestion}
            </h1>
            <span className="party-wizard__hint">{definition.description}</span>
            <div aria-label="Care subtype" className="party-wizard__options">
              {subtypeOptions.map((option, index) => (
                <Button
                  aria-pressed={subtype === option}
                  className="party-wizard__option"
                  data-wizard-focus={index === 0 ? "true" : undefined}
                  key={option}
                  onClick={() => setSubtype(option)}
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

        {activeStep === "schedule" ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              {direction === "receive"
                ? "When do you need this Care?"
                : "When are you available to offer this Care?"}
            </h1>
            <span className="party-wizard__hint">
              Choose one or more days and times. A note can add flexibility.
            </span>
            <div className="party-wizard__field">
              <span>Days</span>
              <div aria-label="Days" className="party-wizard__options">
                {careDays.map((day, index) => (
                  <label className="party-wizard__checkbox" key={day}>
                    <input
                      checked={days.includes(day)}
                      data-wizard-focus={index === 0 ? "true" : undefined}
                      onChange={() => setDays(toggleValue(days, day))}
                      type="checkbox"
                    />
                    {dayLabels[day]}
                  </label>
                ))}
              </div>
            </div>
            <div className="party-wizard__field">
              <span>Times</span>
              <div aria-label="Times" className="party-wizard__options">
                {careTimes.map((time) => (
                  <Button
                    aria-pressed={times.includes(time)}
                    className="party-wizard__option"
                    key={time}
                    onClick={() => setTimes(toggleValue(times, time))}
                    size="lg"
                    type="button"
                    variant="outline"
                  >
                    {timeLabels[time]}
                  </Button>
                ))}
              </div>
            </div>
            <label className="party-wizard__field">
              <span>Optional note about specifics or flexibility</span>
              <textarea
                className="party-wizard__input party-wizard__textarea"
                onChange={(event) => setTimeNote(event.target.value)}
                placeholder="I can be flexible about the day"
                value={timeNote}
              />
            </label>
          </div>
        ) : null}

        {activeStep === "location" ? (
          <label className="party-wizard__question">
            <span className="party-wizard__title">
              {direction === "receive"
                ? "Where do you need this Care?"
                : "Where can you offer this Care?"}
            </span>
            <span className="party-wizard__hint">
              A simple place or area is enough for this alpha.
            </span>
            <input
              autoFocus
              className="party-wizard__input"
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Neighborhood, home, or nearby area"
              value={location}
            />
          </label>
        ) : null}

        {activeStep === "preferences" ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">What would help this work?</h1>
            <label className="party-wizard__field">
              <span>What will make this work well for you?</span>
              <textarea
                autoFocus
                className="party-wizard__input party-wizard__textarea"
                onChange={(event) => setRequirements(event.target.value)}
                placeholder="Anything that would make this easier"
                value={requirements}
              />
            </label>
            <label className="party-wizard__field">
              <span>What preferences or sensitivities matter to you?</span>
              <textarea
                className="party-wizard__input party-wizard__textarea"
                onChange={(event) => setSensitivities(event.target.value)}
                placeholder="Optional"
                value={sensitivities}
              />
            </label>
            <span className="party-wizard__hint">
              You can leave these blank or say that no special preferences
              apply.
            </span>
          </div>
        ) : null}

        {activeStep === "expiration" ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              When should this Care expire?
            </h1>
            <span className="party-wizard__hint">
              Choose how long this opportunity should stay open if it is not
              claimed.
            </span>
            <div aria-label="Care expiration" className="party-wizard__options">
              {careExpirationOptions.map((option, index) => (
                <Button
                  aria-pressed={expiresIn === option.value}
                  className="party-wizard__option"
                  data-wizard-focus={index === 0 ? "true" : undefined}
                  key={option.value}
                  onClick={() => setExpiresIn(option.value)}
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

        {activeStep === "layer" ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">Who should see this Care?</h1>
            <span className="party-wizard__hint">
              Choose the relationship layer for this opportunity.
            </span>
            <div aria-label="Care layer" className="party-wizard__options">
              {(["Party", "Tribe"] as const).map((option, index) => (
                <Button
                  aria-pressed={audience === option}
                  className="party-wizard__option"
                  data-wizard-focus={index === 0 ? "true" : undefined}
                  key={option}
                  onClick={() => setAudience(option)}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {option}
                </Button>
              ))}
            </div>
            <span className="party-wizard__hint">
              This Care will be shared with your {audience}.
            </span>
          </div>
        ) : null}
      </div>

      <footer className="party-wizard__footer">
        {submissionError ? (
          <p className="party-wizard__error" role="alert">
            {submissionError}
          </p>
        ) : null}
        <Button
          className="party-wizard__continue"
          disabled={!canContinue || submitting}
          onClick={() => void handleNext()}
          size="lg"
          type="button"
        >
          {activeStep === "layer" ? (
            direction === "receive" ? (
              <HandHeart aria-hidden="true" />
            ) : (
              <Gift aria-hidden="true" />
            )
          ) : null}
          {activeStep === "layer" ? (
            <>
              <Check aria-hidden="true" /> {actionLabel}
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </footer>
    </section>
  );
}
