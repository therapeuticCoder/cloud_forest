import { ArrowLeft, Layers3, RadioTower, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CuratorSelection } from "@/types/curator";

type CuratorDetailViewProps = {
  onBack: () => void;
  selection: CuratorSelection;
};

const layerLabels = {
  party: "Party",
  tribe: "Tribe",
  guild: "Guild",
  signal: "Signal",
} as const;

function getSelectionName(selection: CuratorSelection) {
  return "displayName" in selection.item
    ? selection.item.displayName
    : selection.item.name;
}

function SelectionVisual({ selection }: { selection: CuratorSelection }) {
  if (selection.layer === "party" || selection.layer === "tribe") {
    return <span>{selection.item.initials}</span>;
  }

  if (selection.layer === "guild") {
    return <Layers3 aria-hidden="true" />;
  }

  return <RadioTower aria-hidden="true" />;
}

const layerStyles = {
  party: "border-emerald-300/65 text-emerald-300",
  tribe: "border-cyan-300/60 text-cyan-300",
  guild: "border-violet-300/60 text-violet-300",
  signal: "border-amber-300/55 text-amber-300",
} as const;

export function CuratorDetailView({
  onBack,
  selection,
}: CuratorDetailViewProps) {
  const selectionName = getSelectionName(selection);

  return (
    <section
      aria-label={`${selectionName} details`}
      className="flex h-[100svh] flex-col bg-slate-950 px-5 pb-8 pt-20 text-slate-100 sm:px-8"
    >
      <Button
        aria-label="Back to Curator"
        className="absolute left-4 top-4 text-slate-100 hover:bg-white/10"
        onClick={onBack}
        size="icon"
        type="button"
        variant="ghost"
      >
        <ArrowLeft aria-hidden="true" />
      </Button>

      <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center gap-6">
        <div
          className={`grid aspect-square w-[min(48vw,14rem)] place-items-center rounded-2xl border bg-slate-900/35 text-[clamp(3rem,14vw,7rem)] font-medium ${layerStyles[selection.layer]}`}
        >
          <SelectionVisual selection={selection} />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {selectionName}
          </h1>
          <p className={layerStyles[selection.layer]}>
            {layerLabels[selection.layer]}
          </p>
        </div>

        <div className="mt-4 flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 text-slate-500">
          <Sprout aria-hidden="true" />
          <p>Details coming next</p>
        </div>
      </div>
    </section>
  );
}
