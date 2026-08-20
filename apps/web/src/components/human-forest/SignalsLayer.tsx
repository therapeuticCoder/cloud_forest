import {
  Building2,
  Clapperboard,
  FlaskConical,
  Music2,
  Palette,
  RadioTower,
} from "lucide-react";

import type {
  CuratorSelection,
  CuratorSignal,
  CuratorSignalCategory,
} from "@/types/curator";

import { CuratorTile } from "./CuratorTile";

type SignalsLayerProps = {
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  signals: CuratorSignal[];
};

const categoryIcons: Record<CuratorSignalCategory, typeof Building2> = {
  art: Palette,
  film: Clapperboard,
  "local-civic": Building2,
  music: Music2,
  politics: Building2,
  science: FlaskConical,
  technology: RadioTower,
};

export function SignalsLayer({ onSelect, signals }: SignalsLayerProps) {
  return (
    <div
      aria-label="Signals"
      className="grid h-full w-full grid-cols-2 grid-rows-5 gap-1.5 sm:grid-cols-5 sm:grid-rows-2 sm:gap-2.5"
    >
      {signals.map((signal) => {
        const SignalIcon = categoryIcons[signal.category];

        return (
          <CuratorTile
            key={signal.id}
            id={`signal-${signal.id}`}
            labelClassName="line-clamp-2 whitespace-normal leading-tight"
            label={signal.name}
            onSelect={(trigger) =>
              onSelect({ layer: "signal", item: signal }, trigger)
            }
            tone="signal"
            visual={<SignalIcon strokeWidth={1.5} />}
            visualClassName="[&_svg]:size-[clamp(2rem,7vmin,5rem)]"
          />
        );
      })}
    </div>
  );
}
