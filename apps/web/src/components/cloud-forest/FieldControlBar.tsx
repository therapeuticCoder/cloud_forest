import {
  CircleDot,
  Clock3,
  Map,
  Radio,
  Sprout,
  Users,
  type LucideIcon,
} from "lucide-react";

type ViewControl = "timeline" | "map";

type FieldControlBarProps = {
  viewControl: ViewControl;
};

type ControlItem = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const layerControls: ControlItem[] = [
  {
    label: "Party",
    icon: CircleDot,
    className:
      "border-lime-200/25 bg-lime-200/10 text-lime-100 shadow-[0_0_30px_rgba(190,242,100,0.12)]",
  },
  {
    label: "Tribe",
    icon: Users,
    className:
      "border-sky-200/25 bg-sky-200/10 text-sky-100 shadow-[0_0_30px_rgba(125,211,252,0.11)]",
  },
  {
    label: "Guilds",
    icon: Sprout,
    className:
      "border-violet-200/25 bg-violet-200/10 text-violet-100 shadow-[0_0_30px_rgba(167,139,250,0.11)]",
  },
  {
    label: "Signals",
    icon: Radio,
    className:
      "border-amber-200/25 bg-amber-200/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.12)]",
  },
];

const viewControls: Record<ViewControl, ControlItem> = {
  timeline: {
    label: "Timeline",
    icon: Clock3,
    className:
      "border-emerald-200/25 bg-emerald-200/10 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.12)]",
  },
  map: {
    label: "Map",
    icon: Map,
    className:
      "border-emerald-200/25 bg-emerald-200/10 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.12)]",
  },
};

export function FieldControlBar({ viewControl }: FieldControlBarProps) {
  const controls = [...layerControls, viewControls[viewControl]];

  return (
    <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-end gap-3 rounded-lg border border-white/10 bg-slate-950/45 px-4 py-3 backdrop-blur-md">
      {controls.map((control) => {
        const Icon = control.icon;

        return (
          <button
            key={control.label}
            className="group grid min-w-14 place-items-center gap-1 text-center"
            type="button"
          >
            <span
              className={`grid h-12 w-12 place-items-center rounded-lg border transition group-hover:-translate-y-0.5 group-hover:bg-white/12 ${control.className}`}
            >
              <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <span className="text-[0.65rem] font-medium leading-none text-slate-300">
              {control.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
