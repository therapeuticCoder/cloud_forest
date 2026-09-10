import { Plus, Sprout } from "lucide-react";

import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { CuratorTile } from "./CuratorTile";

type HoldingLayerProps = {
  onAdd: () => void;
  onRetry: () => void;
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  people: CuratorPerson[];
  peopleState: "loading" | "ready" | "error";
  peopleStateMessage?: string;
};

export function HoldingLayer({
  onAdd,
  onRetry,
  onSelect,
  people,
  peopleState,
  peopleStateMessage,
}: HoldingLayerProps) {
  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-[2rem] border border-lime-100/15 bg-[linear-gradient(145deg,rgba(21,47,30,0.96),rgba(8,25,18,0.98))] p-5 text-slate-100 shadow-2xl shadow-black/20 sm:p-8">
      <header className="flex items-start justify-between gap-5 border-b border-lime-100/15 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200/70">
            Private curation
          </p>
          <h1 className="mt-1 text-4xl font-medium tracking-tight sm:text-5xl">
            Holding
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Keep Characters here while their place in your Forest is still
            undecided.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-lime-200 px-4 py-2 font-medium text-slate-950 transition hover:bg-lime-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime-100"
          data-curator-tile="holding-add"
          onClick={onAdd}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Character
        </button>
      </header>

      {peopleState === "loading" ? (
        <p className="m-auto text-slate-300" role="status">
          Loading your private Characters…
        </p>
      ) : null}
      {peopleState === "error" ? (
        <div
          className="m-auto grid max-w-md justify-items-center gap-3 text-center text-slate-300"
          role="alert"
        >
          <p>
            {peopleStateMessage ??
              "Your private Characters are temporarily unavailable."}
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
          <h2 className="text-xl font-medium">A quiet place to begin.</h2>
          <p className="mt-2 leading-6 text-slate-300">
            Add a private Character now. You can move them to Party or Tribe
            when the time is right.
          </p>
        </div>
      ) : null}
      {peopleState === "ready" && people.length > 0 ? (
        <div
          aria-label="Holding Characters"
          className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 overflow-y-auto pt-5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {people.map((person) => (
            <CuratorTile
              key={person.id}
              id={`holding-${person.id}`}
              label={person.displayName}
              onSelect={(trigger) =>
                onSelect({ layer: "holding", item: person }, trigger)
              }
              tone="holding"
              visual={person.initials}
              visualClassName="text-[clamp(1.5rem,5vmin,3rem)]"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
