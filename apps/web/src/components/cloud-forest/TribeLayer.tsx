import { Sprout } from "lucide-react";

import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { Portrait } from "./PartyLayer";

type TribeLayerProps = {
  people: CuratorPerson[];
  peopleState: "loading" | "ready" | "error";
  peopleStateMessage?: string;
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  onRetry: () => void;
};

function TribePerson({
  onSelect,
  person,
}: {
  onSelect: (trigger: HTMLButtonElement) => void;
  person: CuratorPerson;
}) {
  return (
    <button
      aria-label={`Open ${person.displayName}`}
      className="group flex min-h-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-lime-100/15 bg-emerald-950/35 px-2 py-2 text-center transition hover:-translate-y-0.5 hover:border-lime-100/35 hover:bg-emerald-900/45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime-100"
      data-curator-tile={`tribe-${person.id}`}
      onClick={(event) => onSelect(event.currentTarget)}
      type="button"
    >
      <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-lime-100/20 bg-emerald-950 text-sm font-medium text-lime-100 sm:size-12">
        <Portrait
          initials={person.initials}
          personId={person.id}
          portraitUrl={person.portraitUrl}
          small
        />
      </span>
      <span className="w-full truncate text-xs font-medium text-slate-100 sm:text-sm">
        {person.displayName}
      </span>
    </button>
  );
}

export function TribeLayer({
  onRetry,
  onSelect,
  people,
  peopleState,
  peopleStateMessage,
}: TribeLayerProps) {
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(people.length / 10)) },
    (_, pageIndex) => people.slice(pageIndex * 10, (pageIndex + 1) * 10),
  );

  return (
    <div className="flex h-full min-h-0 flex-col text-slate-100">
      {peopleState === "loading" ? (
        <p className="m-auto text-slate-200" role="status">
          Loading your Tribe…
        </p>
      ) : null}
      {peopleState === "error" ? (
        <div
          className="m-auto grid max-w-md justify-items-center gap-3 text-center text-slate-200"
          role="alert"
        >
          <p>
            {peopleStateMessage ??
              "Your private Tribe is temporarily unavailable."}
          </p>
          <button
            className="rounded-full border border-lime-100/30 px-4 py-2 text-lime-100"
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
            className="mx-auto mb-4 text-lime-200/70"
          />
          <h2 className="text-xl font-medium">Your Tribe is waiting.</h2>
          <p className="mt-2 leading-6 text-slate-200">
            Move a Character here from Holding when they belong in your broader
            circle.
          </p>
        </div>
      ) : null}
      {peopleState === "ready" && people.length > 0 ? (
        <div
          aria-label="Tribe people"
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((page, index) => (
            <div
              aria-label={`Tribe page ${index + 1}`}
              className="grid min-w-full snap-start snap-always grid-cols-2 grid-rows-5 gap-2"
              key={index}
            >
              {page.map((person) => (
                <TribePerson
                  key={person.id}
                  onSelect={(trigger) =>
                    onSelect({ layer: "tribe", item: person }, trigger)
                  }
                  person={person}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
