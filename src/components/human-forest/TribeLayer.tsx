import type { CuratorNeighborhood, CuratorSelection } from "@/types/curator";

import { CuratorTile } from "./CuratorTile";

type TribeLayerProps = {
  neighborhoods: CuratorNeighborhood[];
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
};

export function TribeLayer({ neighborhoods, onSelect }: TribeLayerProps) {
  return (
    <div
      aria-label="Tribe neighborhoods"
      className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden"
    >
      {neighborhoods.map((neighborhood) => (
        <section
          key={neighborhood.id}
          aria-label={`${neighborhood.name} neighborhood`}
          className="grid h-full min-w-full snap-start snap-always grid-cols-4 grid-rows-5 gap-1.5 sm:grid-cols-5 sm:grid-rows-4 sm:gap-2"
        >
          {neighborhood.people.map((person) => (
            <CuratorTile
              key={person.id}
              id={`tribe-${person.id}`}
              label={person.displayName}
              onSelect={(trigger) =>
                onSelect({ layer: "tribe", item: person }, trigger)
              }
              tone="tribe"
              visual={person.initials}
              visualClassName="text-[clamp(1rem,4vmin,2.5rem)]"
            />
          ))}
        </section>
      ))}
    </div>
  );
}
