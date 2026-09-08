import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleHelp,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Portrait } from "@/components/cloud-forest/PartyLayer";

import "./mutual-connection-review.css";

type ReviewState =
  | "entry"
  | "choice"
  | "show"
  | "scan"
  | "confirm"
  | "success"
  | "declined"
  | "expired"
  | "wrong-account";

const privatePerson = {
  name: "Scooter",
  initials: "SC",
  nickname: "Scoot",
  shape: "A steady, easygoing presence",
  meaning: "my safe harbor on ordinary days",
};

const counterpart = {
  name: "Rowan Lee",
  initials: "RL",
};

const stateLabels: Record<ReviewState, string> = {
  entry: "Cloud Forest character",
  choice: "Choose a way",
  show: "Show code",
  scan: "Scan code",
  confirm: "Confirm identity",
  success: "Connected",
  declined: "Not connected",
  expired: "Expired code",
  "wrong-account": "Wrong account",
};

function ReviewControls({
  state,
  onChange,
}: {
  state: ReviewState;
  onChange: (nextState: ReviewState) => void;
}) {
  return (
    <details className="mutual-review__controls">
      <summary>Review prototype states</summary>
      <div
        aria-label="Prototype state controls"
        className="mutual-review__state-list"
      >
        {(Object.keys(stateLabels) as ReviewState[]).map((nextState) => (
          <button
            aria-pressed={state === nextState}
            key={nextState}
            onClick={() => onChange(nextState)}
            type="button"
          >
            {stateLabels[nextState]}
          </button>
        ))}
      </div>
    </details>
  );
}

function PrivatePersonCard() {
  return (
    <article className="mutual-review__private-card">
      <div className="mutual-review__person-row">
        <Portrait initials={privatePerson.initials} personId="scooter" small />
        <div>
          <span className="mutual-review__eyebrow">Cloud Forest character</span>
          <h2>{privatePerson.name}</h2>
        </div>
      </div>
      <dl>
        <div>
          <dt>What you call them</dt>
          <dd>{privatePerson.nickname}</dd>
        </div>
        <div>
          <dt>Relationship shape</dt>
          <dd>{privatePerson.shape}</dd>
        </div>
        <div>
          <dt>Who they are to you</dt>
          <dd>{privatePerson.meaning}</dd>
        </div>
      </dl>
    </article>
  );
}

function SafeIdentityCard() {
  return (
    <article className="mutual-review__identity-card">
      <Portrait initials={counterpart.initials} personId="rowan" small />
      <div>
        <span className="mutual-review__eyebrow">Safe account identity</span>
        <h2>{counterpart.name}</h2>
        <p>Invited Cloud Forest pilot account</p>
      </div>
      <ShieldCheck aria-hidden="true" />
    </article>
  );
}

function FakeQrCode() {
  const cells = Array.from({ length: 81 }, (_, index) => {
    const row = Math.floor(index / 9);
    const column = index % 9;
    const finder =
      (row < 3 && column < 3) ||
      (row < 3 && column > 5) ||
      (row > 5 && column < 3);
    const edge = row === 0 || row === 2 || column === 0 || column === 2;
    const center = row === 1 && column === 1;
    return finder ? edge || center : (row * 7 + column * 11) % 5 < 2;
  });

  return (
    <div aria-label="A simulated pairing QR code" className="mutual-review__qr">
      {cells.map((filled, index) => (
        <span className={filled ? "is-filled" : ""} key={index} />
      ))}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="mutual-review__back" onClick={onClick} type="button">
      <ArrowLeft aria-hidden="true" />
      Back
    </button>
  );
}

function StateHeading({
  eyebrow,
  heading,
  description,
}: {
  eyebrow?: string;
  heading: string;
  description?: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [heading]);

  return (
    <header className="mutual-review__heading">
      {eyebrow ? (
        <span className="mutual-review__eyebrow">{eyebrow}</span>
      ) : null}
      <h1 ref={headingRef} tabIndex={-1}>
        {heading}
      </h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

function EntryState({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <StateHeading
        description="Your nickname and notes stay the same. Making the connection mutual adds safety and functionality."
        heading="Make this connection intentional"
      />
      <PrivatePersonCard />
      <div className="mutual-review__note">
        <Sprout aria-hidden="true" />
        <p>Nothing changes until both parties agree to the change.</p>
      </div>
      <button
        className="mutual-review__primary"
        onClick={onContinue}
        type="button"
      >
        Make it mutual
      </button>
    </>
  );
}

function ChoiceState({
  onBack,
  onScan,
  onShow,
}: {
  onBack: () => void;
  onScan: () => void;
  onShow: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <StateHeading
        description="This code initiates a mutual connection request only."
        eyebrow="Choose your connection method"
        heading="Is this person nearby?"
      />
      <div className="mutual-review__choice-grid">
        <button
          className="mutual-review__choice"
          onClick={onShow}
          type="button"
        >
          <QrCode aria-hidden="true" />
          <strong>Show code</strong>
          <span>Let the other person scan your request.</span>
        </button>
        <button
          className="mutual-review__choice"
          onClick={onScan}
          type="button"
        >
          <ScanLine aria-hidden="true" />
          <strong>Scan code</strong>
          <span>Scan a request from the other person.</span>
        </button>
      </div>
      <p className="mutual-review__privacy-line">
        No search, email lookup, or character details are involved.
      </p>
    </>
  );
}

function ShowState({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <StateHeading
        description="Your code is a short-lived invitation for the person in front of you. It does not reveal your nickname or notes."
        eyebrow="Your consent starts here"
        heading="Let’s make it real"
      />
      <div className="mutual-review__consent-card">
        <QrCode aria-hidden="true" />
        <FakeQrCode />
        <p>I consent to a connection. Let’s make it real.</p>
        <span>This code is for one intentional exchange.</span>
      </div>
      <div className="mutual-review__actions">
        <button
          className="mutual-review__primary"
          onClick={onContinue}
          type="button"
        >
          Continue to confirmation
        </button>
        <button
          className="mutual-review__secondary"
          onClick={onBack}
          type="button"
        >
          Cancel this offer
        </button>
      </div>
    </>
  );
}

function ScanState({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <StateHeading
        description="Point your camera at the other person’s code. Scanning only reads a request; it does not connect you."
        eyebrow="Request"
        heading="Scan their code"
      />
      <div className="mutual-review__scan-card">
        <div className="mutual-review__scan-frame">
          <ScanLine aria-hidden="true" />
          <span>Camera preview</span>
          <small>Prototype scan area</small>
        </div>
        <p>
          When the code is read, you’ll see the safe account identity first.
        </p>
      </div>
      <div className="mutual-review__actions">
        <button
          className="mutual-review__primary"
          onClick={onContinue}
          type="button"
        >
          Use scanned code
        </button>
        <button
          className="mutual-review__secondary"
          onClick={onBack}
          type="button"
        >
          Cancel scan
        </button>
      </div>
    </>
  );
}

function ConfirmState({
  onConfirm,
  onDecline,
  onWrongAccount,
}: {
  onConfirm: () => void;
  onDecline: () => void;
  onWrongAccount: () => void;
}) {
  return (
    <>
      <StateHeading
        eyebrow="One clear choice"
        heading="Is this the person you mean?"
      />
      <SafeIdentityCard />
      <div className="mutual-review__boundary-card">
        <ShieldCheck aria-hidden="true" />
        <p>
          This will approve a connection between your accounts. You will be able
          to choose where you put them in your personal Cloud Forest.
        </p>
      </div>
      <div className="mutual-review__actions">
        <button
          className="mutual-review__primary"
          onClick={onConfirm}
          type="button"
        >
          Confirm connection
        </button>
        <button
          className="mutual-review__secondary"
          onClick={onWrongAccount}
          type="button"
        >
          This isn’t the right person
        </button>
        <button
          className="mutual-review__text-button"
          onClick={onDecline}
          type="button"
        >
          Not now
        </button>
      </div>
    </>
  );
}

function OutcomeState({
  kind,
  onReturn,
  onTryAgain,
}: {
  kind: "success" | "declined" | "expired" | "wrong-account";
  onReturn: () => void;
  onTryAgain: () => void;
}) {
  const content = {
    success: {
      icon: <Check aria-hidden="true" />,
      eyebrow: "Mutual connection made",
      heading: `Connected with ${counterpart.name}`,
      description:
        "Scooter remains your Cloud Forest character but now enriched by the trusted connection.",
      action: "Back to Scooter",
    },
    declined: {
      icon: <Sprout aria-hidden="true" />,
      eyebrow: "No connection made",
      heading: "Scooter is unchanged",
      description: "Your character is still here.",
      action: "Back to Scooter",
    },
    expired: {
      icon: <CircleHelp aria-hidden="true" />,
      eyebrow: "No connection made",
      heading: "That code has expired",
      description:
        "Short-lived codes protect an intentional exchange. Ask the other person to show a new one.",
      action: "Back to Scooter",
    },
    "wrong-account": {
      icon: <AlertTriangle aria-hidden="true" />,
      eyebrow: "No connection made",
      heading: "That wasn’t the right person",
      description:
        "No link was created. This is why Cloud Forest asks for a clear confirmation before connecting.",
      action: "Back to Scooter",
    },
  }[kind];

  return (
    <>
      <div className={`mutual-review__outcome mutual-review__outcome--${kind}`}>
        <span className="mutual-review__outcome-icon">{content.icon}</span>
        <StateHeading
          description={content.description}
          eyebrow={content.eyebrow}
          heading={content.heading}
        />
      </div>
      {kind === "success" ? <PrivatePersonCard /> : null}
      <div className="mutual-review__actions">
        <button
          className="mutual-review__primary"
          onClick={onReturn}
          type="button"
        >
          {content.action}
        </button>
        {kind !== "success" && kind !== "declined" ? (
          <button
            className="mutual-review__secondary"
            onClick={onTryAgain}
            type="button"
          >
            Try another code
          </button>
        ) : null}
      </div>
    </>
  );
}

export function MutualConnectionReview() {
  const [state, setState] = useState<ReviewState>("entry");

  return (
    <main className="mutual-review">
      <header className="mutual-review__topbar">
        <div className="mutual-review__brand">
          <span className="mutual-review__brand-mark">✦</span>
          <span>Cloud Forest</span>
        </div>
        <span className="mutual-review__topbar-label">Mutual connection</span>
      </header>

      <ReviewControls onChange={setState} state={state} />

      <section
        aria-label="Mutual connection review"
        className="mutual-review__surface"
      >
        <div className="mutual-review__content">
          {state === "entry" ? (
            <EntryState onContinue={() => setState("choice")} />
          ) : null}
          {state === "choice" ? (
            <ChoiceState
              onBack={() => setState("entry")}
              onScan={() => setState("scan")}
              onShow={() => setState("show")}
            />
          ) : null}
          {state === "show" ? (
            <ShowState
              onBack={() => setState("choice")}
              onContinue={() => setState("confirm")}
            />
          ) : null}
          {state === "scan" ? (
            <ScanState
              onBack={() => setState("choice")}
              onContinue={() => setState("confirm")}
            />
          ) : null}
          {state === "confirm" ? (
            <ConfirmState
              onConfirm={() => setState("success")}
              onDecline={() => setState("declined")}
              onWrongAccount={() => setState("wrong-account")}
            />
          ) : null}
          {state === "success" ||
          state === "declined" ||
          state === "expired" ||
          state === "wrong-account" ? (
            <OutcomeState
              kind={state}
              onReturn={() => setState("entry")}
              onTryAgain={() => setState("choice")}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
