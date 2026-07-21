import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type CuratorTileTone = "party" | "tribe" | "guild" | "signal";

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
    "border-emerald-300/65 bg-emerald-300/[0.04] text-emerald-300 hover:border-emerald-200 focus-visible:ring-emerald-300/75 active:bg-emerald-300/10",
  tribe:
    "border-cyan-300/60 bg-cyan-300/[0.035] text-cyan-300 hover:border-cyan-200 focus-visible:ring-cyan-300/75 active:bg-cyan-300/10",
  guild:
    "border-violet-300/60 bg-violet-300/[0.035] text-violet-300 hover:border-violet-200 focus-visible:ring-violet-300/75 active:bg-violet-300/10",
  signal:
    "border-amber-300/55 bg-amber-300/[0.025] text-amber-300 hover:border-amber-200 focus-visible:ring-amber-300/75 active:bg-amber-300/10",
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
