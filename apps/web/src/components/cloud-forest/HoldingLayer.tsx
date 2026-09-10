import { Sprout } from "lucide-react";

import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { Portrait } from "./PartyLayer";

type HoldingLayerProps = {
  onRetry: () => void;
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  people: CuratorPerson[];
  peopleState: "loading" | "ready" | "error";
  peopleStateMessage?: string;
};

function HoldingCharacterRow({
  onSelect,
  person,
}: {
  onSelect: (trigger: HTMLButtonElement) => void;
  person: CuratorPerson;
}) {
  return (
    <button
      aria-label={`Open ${person.displayName}`}
      className="group grid min-h-20 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-amber-100/15 bg-[#25140d]/70 px-3 text-left shadow-[inset_0_1px_rgba(255,230,185,0.06)] transition hover:-translate-y-0.5 hover:border-amber-100/35 hover:bg-[#311a0f] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
      data-curator-tile={`holding-${person.id}`}
      onClick={(event) => onSelect(event.currentTarget)}
      type="button"
    >
      <span className="grid size-14 place-items-center overflow-hidden rounded-full border border-amber-100/20 bg-[#120905] text-lg font-medium text-amber-100">
        <Portrait
          initials={person.initials}
          personId={person.id}
          portraitUrl={person.portraitUrl}
          small
        />
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-base font-medium text-stone-100">
          {person.displayName}
        </strong>
        <span className="mt-0.5 block truncate text-sm text-amber-100/65">
          {person.relationshipTitle}
        </span>
      </span>
    </button>
  );
}

export function HoldingLayer({
  onRetry,
  onSelect,
  people,
  peopleState,
  peopleStateMessage,
}: HoldingLayerProps) {
  return (
    <div className="flex h-full min-h-0 flex-col text-stone-100">
      {peopleState === "loading" ? (
        <p className="m-auto text-stone-300" role="status">
          Loading your private Characters…
        </p>
      ) : null}
      {peopleState === "error" ? (
        <div
          className="m-auto grid max-w-md justify-items-center gap-3 text-center text-stone-300"
          role="alert"
        >
          <p>
            {peopleStateMessage ??
              "Your private Characters are temporarily unavailable."}
          </p>
          <button
            className="rounded-full border border-amber-100/30 px-4 py-2 text-amber-100"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : null}
      {peopleState === "ready" && people.length === 0 ? (
        <div className="m-auto max-w-md text-center">
          <Sprout
            aria-hidden="true"
            className="mx-auto mb-4 text-amber-100/70"
          />
          <h2 className="text-xl font-medium">A quiet place to begin.</h2>
          <p className="mt-2 leading-6 text-stone-300">
            Characters you are still considering will appear here. Move one to
            Party or Tribe when the time is right.
          </p>
        </div>
      ) : null}
      {peopleState === "ready" && people.length > 0 ? (
        <div
          aria-label="Holding Characters"
          className="grid flex-1 content-start gap-2 overflow-y-auto py-5"
        >
          {people.map((person) => (
            <HoldingCharacterRow
              key={person.id}
              onSelect={(trigger) =>
                onSelect({ layer: "holding", item: person }, trigger)
              }
              person={person}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
