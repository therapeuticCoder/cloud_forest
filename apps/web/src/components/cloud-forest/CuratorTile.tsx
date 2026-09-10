import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type CuratorTileTone =
  | "party"
  | "tribe"
  | "holding"
  | "guild"
  | "signal";

type CuratorTileProps = {
  id: string;
  label: string;
  onSelect: (trigger: HTMLButtonElement) => void;
  tone: CuratorTileTone;
  visual: ReactNode;
  className?: string;
  labelClassName?: string;
  visualClassName?: string;
};

const toneClassNames: Record<CuratorTileTone, string> = {
  party:
    "border-amber-200/50 bg-amber-100/[0.035] text-amber-100 hover:border-amber-100 focus-visible:ring-amber-100/75 active:bg-amber-100/10",
  tribe:
    "border-lime-200/45 bg-lime-100/[0.035] text-lime-100 hover:border-lime-100 focus-visible:ring-lime-100/75 active:bg-lime-100/10",
  holding:
    "border-lime-200/35 bg-lime-100/[0.035] text-lime-100 hover:border-lime-100 focus-visible:ring-lime-100/75 active:bg-lime-100/10",
  guild:
    "border-cyan-200/50 bg-cyan-100/[0.04] text-cyan-100 hover:border-cyan-100 focus-visible:ring-cyan-100/75 active:bg-cyan-100/10",
  signal:
    "border-slate-200/45 bg-slate-100/[0.08] text-slate-100 hover:border-slate-100 focus-visible:ring-slate-100/75 active:bg-slate-100/10",
};

export function CuratorTile({
  id,
  label,
  onSelect,
  tone,
  visual,
  className,
  labelClassName,
  visualClassName,
}: CuratorTileProps) {
  return (
    <button
      aria-label={`Open ${label}`}
      className={cn(
        "group flex min-h-0 min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-2 py-3 text-center transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none",
        toneClassNames[tone],
        className,
      )}
      data-curator-tile={id}
      onClick={(event) => onSelect(event.currentTarget)}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid min-h-0 flex-1 place-items-center text-[clamp(1.5rem,7vmin,5rem)] font-medium tracking-tight",
          visualClassName,
        )}
      >
        {visual}
      </span>
      <span
        className={cn(
          "w-full shrink-0 truncate text-xs font-medium text-slate-100 sm:text-sm",
          labelClassName,
        )}
      >
        {label}
      </span>
    </button>
  );
}
