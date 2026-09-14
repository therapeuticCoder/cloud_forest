import { ShieldAlert, Sprout } from "lucide-react";

import {
  hasActiveConnection,
  type CuratorPerson,
  type CuratorSelection,
} from "@/types/curator";

import { Portrait } from "./PartyLayer";

type HoldingLayerProps = {
  activeTab: "characters" | "blocks";
  blockedPeople: CuratorPerson[];
  onRetry: () => void;
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  onTabChange: (tab: "characters" | "blocks") => void;
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
  const isConnection = hasActiveConnection(person);
  const isBlocked = person.relationshipState === "blocked";

  return (
    <button
      aria-label={`Open ${person.displayName}`}
      className={`group grid min-h-20 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border bg-[#25140d]/70 px-3 text-left shadow-[inset_0_1px_rgba(255,230,185,0.06)] transition hover:-translate-y-0.5 hover:bg-[#311a0f] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-100 ${isBlocked ? "border-rose-200/45 bg-rose-950/20 hover:border-rose-100/70" : isConnection ? "border-amber-200/60 hover:border-amber-100" : "border-amber-100/15 hover:border-amber-100/35"}`}
      data-curator-tile={`holding-${person.id}`}
      onClick={(event) => onSelect(event.currentTarget)}
      type="button"
    >
      <span className="grid size-14 place-items-center overflow-hidden rounded-full border border-amber-100/20 bg-[#120905] text-lg font-medium text-amber-100">
        <Portrait
          grayscale={!isConnection}
          initials={person.initials}
          layer="holding"
          personId={person.id}
          portraitUrl={person.portraitUrl}
          showInitials
          small
        />
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-base font-medium text-stone-100">
          {person.displayName}
        </strong>
        <span className="mt-0.5 block truncate text-sm text-amber-100/65">
          {isBlocked ? "Blocked user" : person.relationshipTitle}
        </span>
      </span>
    </button>
  );
}

export function HoldingLayer({
  activeTab,
  blockedPeople,
  onRetry,
  onSelect,
  onTabChange,
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
      {peopleState === "ready" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            aria-label="Holding sections"
            className="grid grid-cols-2 gap-2 border-b border-amber-100/15 pb-3 pt-3"
            role="tablist"
          >
            <button
              aria-controls="holding-characters-panel"
              aria-selected={activeTab === "characters"}
              className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-100 ${activeTab === "characters" ? "border-amber-100/45 bg-amber-100/15 text-amber-50" : "border-transparent text-amber-100/60 hover:border-amber-100/20 hover:text-amber-50"}`}
              onClick={() => onTabChange("characters")}
              role="tab"
              type="button"
            >
              Characters{" "}
              <span className="text-xs opacity-70">{people.length}/5</span>
            </button>
            <button
              aria-controls="holding-blocks-panel"
              aria-selected={activeTab === "blocks"}
              className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-100 ${activeTab === "blocks" ? "border-rose-200/45 bg-rose-950/30 text-rose-100" : "border-transparent text-rose-100/60 hover:border-rose-100/20 hover:text-rose-50"}`}
              onClick={() => onTabChange("blocks")}
              role="tab"
              type="button"
            >
              Blocks{" "}
              <span className="text-xs opacity-70">{blockedPeople.length}</span>
            </button>
          </div>
          {activeTab === "characters" ? (
            <div
              aria-label="Holding Characters"
              className="flex min-h-0 flex-1 flex-col"
              id="holding-characters-panel"
              role="tabpanel"
              tabIndex={0}
            >
              {people.length === 0 ? (
                <div className="m-auto max-w-md text-center">
                  <Sprout
                    aria-hidden="true"
                    className="mx-auto mb-4 text-amber-100/70"
                  />
                  <h2 className="text-xl font-medium">
                    A quiet place to begin.
                  </h2>
                  <p className="mt-2 leading-6 text-stone-300">
                    Characters you are still considering will appear here. Move
                    one to Party or Tribe when the time is right.
                  </p>
                </div>
              ) : (
                <div className="grid content-start gap-2 overflow-y-auto py-5">
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
              )}
            </div>
          ) : (
            <div
              aria-label="Holding Blocks"
              className="flex min-h-0 flex-1 flex-col"
              id="holding-blocks-panel"
              role="tabpanel"
              tabIndex={0}
            >
              <p className="px-1 pt-4 text-sm text-stone-300">
                Blocked people are kept here. Blocks have no limit.
              </p>
              {blockedPeople.length === 0 ? (
                <div className="m-auto max-w-md text-center">
                  <ShieldAlert
                    aria-hidden="true"
                    className="mx-auto mb-4 text-rose-100/70"
                  />
                  <h2 className="text-xl font-medium">No blocked people.</h2>
                  <p className="mt-2 leading-6 text-stone-300">
                    No people are blocked right now.
                  </p>
                </div>
              ) : (
                <div className="grid content-start gap-2 overflow-y-auto py-5">
                  {blockedPeople.map((person) => (
                    <HoldingCharacterRow
                      key={person.id}
                      onSelect={(trigger) =>
                        onSelect({ layer: "holding", item: person }, trigger)
                      }
                      person={person}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
