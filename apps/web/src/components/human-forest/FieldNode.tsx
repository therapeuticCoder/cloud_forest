import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { HumanForestActor, HumanForestLayer } from "@/types/humanForest";

export type FieldMapActor = HumanForestActor & {
  layer: Exclude<HumanForestLayer, "guild">;
};

type FieldNodeProps = {
  node: FieldMapActor;
};

const layerClasses: Record<Exclude<HumanForestLayer, "guild">, string> = {
  self: "h-24 w-24 border-emerald-200/80 bg-emerald-100/18 text-emerald-50 shadow-[0_0_70px_rgba(94,234,212,0.58)]",
  party:
    "h-18 w-18 border-amber-100/85 bg-amber-200/22 text-amber-50 shadow-[0_0_64px_rgba(251,191,36,0.54)]",
  tribe:
    "h-8 w-8 border-sky-200/30 bg-sky-300/8 text-sky-100/80 opacity-80 shadow-[0_0_18px_rgba(125,211,252,0.14)]",
  signal:
    "h-7 w-7 border-teal-100/45 bg-teal-200/8 text-teal-50/70 shadow-[0_0_46px_rgba(45,212,191,0.32)]",
};

function getSignalLabelPosition(node: FieldMapActor) {
  const verticalPosition =
    node.position.y > 80 ? "bottom-full mb-2" : "top-full mt-2";

  if (node.position.x < 18) {
    return `${verticalPosition} left-0`;
  }

  if (node.position.x > 82) {
    return `${verticalPosition} right-0`;
  }

  return `${verticalPosition} left-1/2 -translate-x-1/2`;
}

export function FieldNode({ node }: FieldNodeProps) {
  const style = {
    left: `${node.position.x}%`,
    top: `${node.position.y}%`,
  } satisfies CSSProperties;
  const layerLabel = node.layer === "party" ? "Party" : node.layer;

  return (
    <div
      aria-label={`${node.displayName}, ${layerLabel} node`}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={style}
    >
      <div
        className={cn(
          "grid place-items-center rounded-full border backdrop-blur-md transition-transform duration-300 hover:scale-105",
          layerClasses[node.layer],
        )}
      >
        <span
          className={cn(
            "max-w-[4.75rem] text-center font-medium leading-none",
            node.layer === "self" && "text-base",
            node.layer === "party" && "text-xs",
            node.layer === "tribe" && "text-[0.56rem]",
            node.layer === "signal" && "sr-only",
          )}
        >
          {node.displayName}
        </span>
      </div>
      {node.layer === "party" ? (
        <>
          <span className="absolute left-1/2 top-1/2 -z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/10 blur-xl" />
          <span className="absolute left-1/2 top-1/2 -z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/14" />
        </>
      ) : null}
      {node.layer === "signal" ? (
        <>
          <span className="absolute left-1/2 top-1/2 -z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-teal-100/12" />
          <span className="absolute left-1/2 top-1/2 -z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-200/6 blur-md" />
          <span
            className={cn(
              "absolute w-28 rounded-full border border-teal-100/12 bg-slate-950/50 px-2 py-1 text-center text-[0.58rem] font-medium leading-tight text-teal-50/75 backdrop-blur-md",
              getSignalLabelPosition(node),
            )}
          >
            {node.displayName}
          </span>
        </>
      ) : null}
    </div>
  );
}
