import { ArrowLeft, Check, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export type AddPartyMemberDraft = {
  displayName: string;
  portraitUrl?: string;
  relationshipNote: string;
  relationshipTitle: string;
};

type AddPartyMemberWizardProps = {
  onCancel: () => void;
  onComplete: (draft: AddPartyMemberDraft) => void;
};

const steps = ["Name", "Portrait", "Relationship", "Private note", "Preview"];

const relationshipOptions = [
  "Partner",
  "Friend",
  "Colleague",
  "Relative",
  "Chosen Family",
  "Something else",
];

function initialsFor(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function AddPartyMemberWizard({
  onCancel,
  onComplete,
}: AddPartyMemberWizardProps) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [portraitUrl, setPortraitUrl] = useState<string | undefined>(undefined);
  const [relationshipNote, setRelationshipNote] = useState("");
  const [relationshipTitle, setRelationshipTitle] = useState("");
  const portraitUrlRef = useRef<string | undefined>(undefined);

  const canContinue =
    (step === 0 && displayName.trim().length > 0) ||
    (step === 2 && relationshipNote.trim().length > 0) ||
    (step === 3 && relationshipTitle.trim().length > 0) ||
    (step === 1 && true) ||
    step === 4;

  const choosePortrait = (file: File | undefined) => {
    if (file) {
      if (portraitUrlRef.current) {
        URL.revokeObjectURL(portraitUrlRef.current);
      }
      const nextPortraitUrl = URL.createObjectURL(file);
      portraitUrlRef.current = nextPortraitUrl;
      setPortraitUrl(nextPortraitUrl);
    }
    setStep(2);
  };

  const skipPortrait = () => {
    if (portraitUrlRef.current) {
      URL.revokeObjectURL(portraitUrlRef.current);
      portraitUrlRef.current = undefined;
      setPortraitUrl(undefined);
    }
    setStep(2);
  };

  const handleCancel = () => {
    if (portraitUrlRef.current) {
      URL.revokeObjectURL(portraitUrlRef.current);
      portraitUrlRef.current = undefined;
    }
    onCancel();
  };

  const handleNext = () => {
    if (!canContinue) {
      return;
    }

    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    onComplete({
      displayName: displayName.trim(),
      portraitUrl,
      relationshipNote: relationshipNote.trim(),
      relationshipTitle: relationshipTitle.trim(),
    });
  };

  return (
    <section aria-label="Add a Party member" className="party-wizard">
      <header className="party-wizard__header">
        <Button
          aria-label={step === 0 ? "Close wizard" : "Back"}
          className="party-wizard__icon-button"
          onClick={
            step === 0 ? handleCancel : () => setStep((current) => current - 1)
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
          aria-label="Cancel adding Party member"
          className="party-wizard__cancel"
          onClick={handleCancel}
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
          <label className="party-wizard__question">
            <span className="party-wizard__title">What do you call them?</span>
            <span className="party-wizard__hint">
              A name or nickname is enough.
            </span>
            <input
              autoFocus
              className="party-wizard__input"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Their name"
              value={displayName}
            />
          </label>
        ) : null}

        {step === 1 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              Would you like to add a portrait?
            </h1>
            <p className="party-wizard__hint">
              You can take one or choose one from this device.
            </p>
            <div className="party-wizard__portrait-choice">
              <label className="party-wizard__upload">
                <ImagePlus aria-hidden="true" />
                <span>Take or upload</span>
                <input
                  accept="image/*"
                  capture="user"
                  onChange={(event) => choosePortrait(event.target.files?.[0])}
                  type="file"
                />
              </label>
              <Button
                className="party-wizard__skip"
                onClick={skipPortrait}
                size="lg"
                type="button"
                variant="outline"
              >
                Skip for now
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="party-wizard__question">
            <h1 className="party-wizard__title">
              What shape is the relationship?
            </h1>
            <span className="party-wizard__hint">
              Choose the shape that feels most true.
            </span>
            <div
              aria-label="Relationship shapes"
              className="party-wizard__options"
            >
              {relationshipOptions.map((option) => (
                <Button
                  aria-pressed={relationshipNote === option}
                  className="party-wizard__option"
                  key={option}
                  onClick={() => setRelationshipNote(option)}
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

        {step === 3 ? (
          <label className="party-wizard__question">
            <span className="party-wizard__title">Who are they to you?</span>
            <span className="party-wizard__hint">
              A short private answer for their Party card. For example: “my safe
              harbor,” “the one who gets it,” or “a steady light.”
            </span>
            <textarea
              autoFocus
              className="party-wizard__input party-wizard__textarea"
              onChange={(event) => setRelationshipTitle(event.target.value)}
              placeholder="They are..."
              value={relationshipTitle}
            />
          </label>
        ) : null}

        {step === 4 ? (
          <div className="party-wizard__question party-wizard__preview-wrap">
            <h1 className="party-wizard__title">
              {displayName.trim()} belongs in your party!
            </h1>
            <div className="party-wizard__preview">
              {portraitUrl ? (
                <img alt="" src={portraitUrl} />
              ) : (
                <span>{initialsFor(displayName)}</span>
              )}
              <strong>{displayName}</strong>
              <span>{relationshipTitle}</span>
              <small>{relationshipNote}</small>
            </div>
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
          {step === 4 ? "Add to Party" : "Continue"}
        </Button>
      </footer>
    </section>
  );
}
