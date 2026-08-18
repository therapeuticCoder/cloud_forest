import { List, Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

export type HumanForestView = "timeline" | "curator";

type ViewSwitcherProps = {
  activeView: HumanForestView;
  onViewChange: (view: HumanForestView) => void;
};

const viewOptions = [
  { icon: List, label: "Timeline", value: "timeline" as const },
  { icon: Sprout, label: "Curator", value: "curator" as const },
];

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  return (
    <nav aria-label="Human Forest view" className="timeline-view-switcher">
      {viewOptions.map((option) => {
        const isActive = option.value === activeView;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            aria-current={isActive ? "page" : undefined}
            aria-label={option.label}
            className={cn(isActive && "is-active")}
            onClick={() => onViewChange(option.value)}
            type="button"
          >
            <Icon aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
