import {
  BookOpen,
  Hammer,
  HandHeart,
  Landmark,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CuratorGuild, CuratorSelection } from "@/types/curator";

import { CuratorTile } from "./CuratorTile";

type GuildsLayerProps = {
  guilds: CuratorGuild[];
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
};

const guildIcons = {
  "mutual-care": HandHeart,
  "studio-night": UsersRound,
  "local-builders": Hammer,
  "reading-room": BookOpen,
  "civic-table": Landmark,
} as const;

export function GuildsLayer({ guilds, onSelect }: GuildsLayerProps) {
  return (
    <div
      aria-label="Guilds"
      className="grid h-full w-full grid-cols-2 grid-rows-3 gap-2.5 sm:gap-3 lg:grid-cols-3 lg:grid-rows-2"
    >
      {guilds.map((guild, index) => {
        const GuildIcon =
          guildIcons[guild.id as keyof typeof guildIcons] ?? UsersRound;

        return (
          <CuratorTile
            key={guild.id}
            className={cn(
              index === guilds.length - 1 &&
                "col-span-2 w-[calc(50%_-_0.3125rem)] justify-self-center sm:w-[calc(50%_-_0.375rem)] lg:col-span-1 lg:col-start-2 lg:w-full",
            )}
            id={`guild-${guild.id}`}
            labelClassName="line-clamp-2 whitespace-normal leading-tight"
            label={guild.name}
            onSelect={(trigger) =>
              onSelect({ layer: "guild", item: guild }, trigger)
            }
            tone="guild"
            visual={<GuildIcon strokeWidth={1.5} />}
            visualClassName="[&_svg]:size-[clamp(3rem,10vmin,7rem)]"
          />
        );
      })}
    </div>
  );
}
