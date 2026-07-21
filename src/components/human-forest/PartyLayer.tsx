import { UserRound } from "lucide-react";

import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { CuratorTile } from "./CuratorTile";

type PartyLayerProps = {
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  people: CuratorPerson[];
  user: CuratorPerson;
};

export function PartyLayer({ onSelect, people, user }: PartyLayerProps) {
  return (
    <div
      aria-label="Party people"
      className="grid h-full w-full grid-cols-2 grid-rows-3 gap-2 sm:gap-3 lg:grid-cols-3 lg:grid-rows-2"
    >
      {people.map((person) => (
        <CuratorTile
          key={person.id}
          id={`party-${person.id}`}
          label={person.displayName}
          onSelect={(trigger) =>
            onSelect({ layer: "party", item: person }, trigger)
          }
          tone="party"
          visual={person.initials}
        />
      ))}
      <CuratorTile
        id={`party-${user.id}`}
        label={user.displayName}
        onSelect={(trigger) =>
          onSelect({ layer: "party", item: user }, trigger)
        }
        tone="party"
        visual={<UserRound strokeWidth={1.5} />}
        visualClassName="[&_svg]:size-[clamp(3rem,10vmin,7rem)]"
      />
    </div>
  );
}
