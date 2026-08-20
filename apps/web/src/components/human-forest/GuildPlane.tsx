import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type {
  HumanForestGuild,
  HumanForestGuildType,
} from "@/types/humanForest";

type GuildPlaneProps = {
  guild: HumanForestGuild;
};

const toneClasses: Record<HumanForestGuildType, string> = {
  care: "human-forest-guild-plane-green border-emerald-200/40 bg-emerald-300/10 text-emerald-100 shadow-[0_0_96px_rgba(52,211,153,0.2)]",
  builder:
    "human-forest-guild-plane-cyan border-cyan-200/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_90px_rgba(34,211,238,0.18)]",
  learning:
    "human-forest-guild-plane-violet border-violet-200/38 bg-violet-300/10 text-violet-100 shadow-[0_0_86px_rgba(167,139,250,0.18)]",
  civic:
    "human-forest-guild-plane-green border-emerald-200/40 bg-emerald-300/10 text-emerald-100 shadow-[0_0_96px_rgba(52,211,153,0.2)]",
  creative:
    "human-forest-guild-plane-violet border-violet-200/38 bg-violet-300/10 text-violet-100 shadow-[0_0_86px_rgba(167,139,250,0.18)]",
  other:
    "human-forest-guild-plane-cyan border-cyan-200/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_90px_rgba(34,211,238,0.18)]",
};

const labelPositionClass = "right-0 top-1/2 translate-x-1/2 -translate-y-1/2";

export function GuildPlane({ guild }: GuildPlaneProps) {
  const style = {
    left: `${guild.position.x}%`,
    top: `${guild.position.y}%`,
    width: `${guild.size.width}%`,
    height: `${guild.size.height}%`,
    transform: `translate(-50%, -50%) rotate(${guild.rotation ?? 0}deg)`,
  } satisfies CSSProperties;

  return (
    <div
      className={cn(
        "absolute z-10 rounded-full border backdrop-blur-[1px]",
        toneClasses[guild.guildType],
      )}
      style={style}
    >
      <span className="human-forest-guild-plane absolute inset-0 overflow-hidden rounded-full before:absolute before:inset-3 before:rounded-full before:border before:border-white/10 before:content-['']" />
      <span className="absolute inset-[16%] rounded-full border border-white/8 bg-white/[0.015]" />
      <span className="absolute left-[16%] top-1/2 h-px w-[68%] -translate-y-1/2 bg-white/14" />
      <div
        className={cn(
          "absolute z-10 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em]",
          labelPositionClass,
        )}
      >
        {guild.name}
      </div>
    </div>
  );
}
