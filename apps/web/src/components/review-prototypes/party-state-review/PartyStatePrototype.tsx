import {
  AlertTriangle,
  Check,
  ChevronLeft,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import { Portrait } from "@/components/cloud-forest/PartyLayer";
import { AddPartyMemberWizard } from "@/components/cloud-forest/AddPartyMemberWizard";
import { partyRelationshipOptions } from "@/components/cloud-forest/partyRelationshipOptions";
import { curatorPartyPeople, curatorUser } from "@/data/cloudForest";
import type { CuratorPerson } from "@/types/curator";

import "./party-state-prototype.css";

type ReviewState =
  | "loading"
  | "empty"
  | "add"
  | "edit"
  | "remove"
  | "conflict"
  | "unavailable"
  | "retry";

const members: CuratorPerson[] = curatorPartyPeople;

const reviewStates: Array<{
  annotation: string;
  label: string;
  state: ReviewState;
}> = [
  {
    state: "loading",
    label: "Loading",
    annotation:
      "Keep the five-slot shape visible without implying stale people.",
  },
  {
    state: "empty",
    label: "Empty",
    annotation: "A quiet invitation, not a warning or an empty dashboard.",
  },
  {
    state: "add",
    label: "Add",
    annotation:
      "Relationship label and private note use the Party contract language.",
  },
  {
    state: "edit",
    label: "Edit",
    annotation:
      "Party member identity stays read-only while private relationship fields remain editable.",
  },
  {
    state: "remove",
    label: "Remove",
    annotation:
      "Removal names the person and its immediate access consequence.",
  },
  {
    state: "conflict",
    label: "Conflict",
    annotation:
      "STALE_WRITE_CONFLICT never overwrites a newer relationship silently.",
  },
  {
    state: "unavailable",
    label: "Unavailable",
    annotation:
      "Transport failure stays distinct from authorization and validation errors.",
  },
  {
    state: "retry",
    label: "Retrying",
    annotation:
      "Retry preserves context while making the in-progress state explicit.",
  },
];

function requestedReviewState(): ReviewState {
  const requestedState = new URLSearchParams(window.location.search).get(
    "state",
  );

  return reviewStates.some(({ state }) => state === requestedState)
    ? (requestedState as ReviewState)
    : "loading";
}

function ReviewControls({
  activeState,
  onChange,
}: {
  activeState: ReviewState;
  onChange: (state: ReviewState) => void;
}) {
  const active = reviewStates.find(({ state }) => state === activeState)!;

  return (
    <details className="party-state-review" open>
      <summary>Annotated Party states</summary>
      <div className="party-state-review__states">
        {reviewStates.map(({ label, state }) => (
          <button
            aria-pressed={state === activeState}
            key={state}
            onClick={() => onChange(state)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <p>
        <strong>{active.label}:</strong> {active.annotation}
      </p>
    </details>
  );
}

function PartyHeader({ title = "Party" }: { title?: string }) {
  return (
    <header className="party-state-header">
      <button aria-label="Open current person" type="button">
        <Portrait
          initials={curatorUser.initials}
          personId={curatorUser.id}
          small
        />
      </button>
      <h1 tabIndex={-1}>{title}</h1>
      <span aria-label="Party capacity">5 places</span>
    </header>
  );
}

function LoadingState() {
  return (
    <>
      <PartyHeader title="Your Party" />
      <p aria-live="polite" className="party-state-status">
        <LoaderCircle aria-hidden="true" className="party-state-spin" />
        Gathering your Party…
      </p>
      <div aria-hidden="true" className="party-state-grid">
        {Array.from({ length: 5 }, (_, index) => (
          <span className="party-state-skeleton" key={index} />
        ))}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <>
      <PartyHeader title="Your Party" />
      <section className="party-state-empty">
        <h2>Your closest people, chosen by you.</h2>
        <p>Your Party has five places. Start with one person you trust.</p>
        <button className="party-state-primary" type="button">
          <Plus aria-hidden="true" /> Add someone
        </button>
      </section>
    </>
  );
}

function Field({
  defaultValue,
  hint,
  label,
}: {
  defaultValue: string;
  hint?: string;
  label: string;
}) {
  return (
    <label className="party-state-field">
      <span>{label}</span>
      <input defaultValue={defaultValue} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function FormState({
  conflict = false,
  mode,
}: {
  conflict?: boolean;
  mode: "add" | "edit";
}) {
  const person = members[0];
  const [relationship, setRelationship] =
    useState<(typeof partyRelationshipOptions)[number]>("Friend");

  return (
    <>
      <PartyHeader title={mode === "add" ? "Add to Party" : "Edit Mira"} />
      <section className="party-state-form">
        <button className="party-state-back" type="button">
          <ChevronLeft aria-hidden="true" /> Party
        </button>
        {conflict ? (
          <div
            className="party-state-message party-state-message--conflict"
            role="alert"
          >
            <RefreshCw aria-hidden="true" />
            <div>
              <strong>This relationship changed somewhere else.</strong>
              <p>
                Your edits are still here. Review the latest version before
                saving.
              </p>
            </div>
          </div>
        ) : null}
        {mode === "edit" ? (
          <div className="party-state-person-row">
            <span className="party-state-person-portrait">
              <Portrait initials={person.initials} personId={person.id} />
            </span>
            <span>
              <strong>{person.displayName}</strong>
            </span>
          </div>
        ) : (
          <Field defaultValue="Anya Reed" label="Name" />
        )}
        <fieldset className="party-state-relationship">
          <legend>Relationship</legend>
          <span>Choose the shape that feels most true.</span>
          <div>
            {partyRelationshipOptions.map((option) => (
              <button
                aria-pressed={relationship === option}
                key={option}
                onClick={() => setRelationship(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <Field
          defaultValue={
            mode === "edit" ? person.relationshipTitle : "my steady north star"
          }
          hint="Only you can see this note."
          label="Private note"
        />
        <button className="party-state-primary" type="button">
          {mode === "add" ? (
            <Plus aria-hidden="true" />
          ) : (
            <Check aria-hidden="true" />
          )}
          {conflict
            ? "Review latest version"
            : mode === "add"
              ? "Add to Party"
              : "Save changes"}
        </button>
      </section>
    </>
  );
}

function RemoveState() {
  return (
    <>
      <PartyHeader title="Remove from Party?" />
      <section className="party-state-confirm">
        <Portrait initials={members[0].initials} personId={members[0].id} />
        <h2>Remove Mira?</h2>
        <p>
          Mira will immediately lose access that comes from being in your Party.
          Your private note will also be removed.
        </p>
        <button className="party-state-danger" type="button">
          <Trash2 aria-hidden="true" /> Remove Mira
        </button>
        <button className="party-state-secondary" type="button">
          Keep Mira
        </button>
      </section>
    </>
  );
}

function UnavailableState({
  onRetry,
  retrying = false,
}: {
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <>
      <PartyHeader title="Your Party" />
      <section className="party-state-unavailable" aria-busy={retrying}>
        {retrying ? (
          <LoaderCircle aria-hidden="true" className="party-state-spin" />
        ) : (
          <AlertTriangle aria-hidden="true" />
        )}
        <h2>
          {retrying ? "Trying again…" : "Your Party isn’t available right now."}
        </h2>
        <p>
          {retrying
            ? "We’ll keep this screen in place while we reconnect."
            : "Nothing has been changed. Check your connection and try again."}
        </p>
        {!retrying ? (
          <button
            className="party-state-primary"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" /> Try again
          </button>
        ) : null}
      </section>
    </>
  );
}

function StateContent({
  onChange,
  state,
}: {
  onChange: (state: ReviewState) => void;
  state: ReviewState;
}) {
  switch (state) {
    case "loading":
      return <LoadingState />;
    case "empty":
      return <EmptyState />;
    case "add":
      return (
        <AddPartyMemberWizard
          destination="Party"
          onCancel={() => onChange("empty")}
          onComplete={() => onChange("edit")}
        />
      );
    case "edit":
      return <FormState mode="edit" />;
    case "remove":
      return <RemoveState />;
    case "conflict":
      return <FormState conflict mode="edit" />;
    case "unavailable":
      return <UnavailableState onRetry={() => onChange("retry")} />;
    case "retry":
      return <UnavailableState retrying />;
  }
}

export function PartyStatePrototype() {
  const [activeState, setActiveState] =
    useState<ReviewState>(requestedReviewState);
  const surfaceRef = useRef<HTMLElement>(null);
  const showReviewControls =
    new URLSearchParams(window.location.search).get("review-controls") ===
    "true";

  const changeState = (state: ReviewState) => {
    setActiveState(state);
    requestAnimationFrame(() =>
      surfaceRef.current?.querySelector<HTMLElement>("h1")?.focus(),
    );
  };

  return (
    <div className="party-state-prototype" data-review-state={activeState}>
      <main className="party-state-surface" ref={surfaceRef}>
        <StateContent
          key={activeState}
          onChange={changeState}
          state={activeState}
        />
      </main>
      {/* Keep internal state-switching tools off the prototype surface unless a reviewer explicitly opts in. */}
      {showReviewControls ? (
        <ReviewControls activeState={activeState} onChange={changeState} />
      ) : null}
    </div>
  );
}
