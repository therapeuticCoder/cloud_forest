import { Newspaper, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

export type CloudForestView = "timeline" | "curator";

type ViewSwitcherProps = {
  activeView: CloudForestView;
  onViewChange: (view: CloudForestView) => void;
};

const viewOptions = [
  { icon: Newspaper, label: "Timeline", value: "timeline" as const },
  { icon: UsersRound, label: "Curator", value: "curator" as const },
];

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  return (
    <nav aria-label="Cloud Forest views" className="timeline-view-switcher">
      {viewOptions.map((option) => {
        const isActive = option.value === activeView;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            aria-current={isActive ? "page" : undefined}
            aria-label={
              isActive
                ? `Current view: ${option.label}`
                : `Go to ${option.label}`
            }
            className={cn(isActive && "is-active")}
            data-primary-view={option.value}
            onClick={() => onViewChange(option.value)}
            type="button"
          >
            <Icon aria-hidden="true" />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
