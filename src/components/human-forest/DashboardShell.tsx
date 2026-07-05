import { useState } from "react";

import { CuratorView } from "./CuratorView";
import { TimelineView } from "./TimelineView";
import { type HumanForestView, ViewSwitcher } from "./ViewSwitcher";

export function DashboardShell() {
  const [activeView, setActiveView] = useState<HumanForestView>("timeline");

  return (
    <main className="min-h-screen bg-[#05070d] text-slate-100">
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
        <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      </div>

      {activeView === "timeline" ? <TimelineView /> : <CuratorView />}
    </main>
  );
}
