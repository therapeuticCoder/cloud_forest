import { PenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CuratorView } from "./CuratorView";
import { TimelineView } from "./TimelineView";
import { type HumanForestView, ViewSwitcher } from "./ViewSwitcher";

export function DashboardShell() {
  const [activeView, setActiveView] = useState<HumanForestView>("timeline");
  const [chromeHidden, setChromeHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      setChromeHidden(nextScrollY > lastScrollY.current && nextScrollY > 48);
      lastScrollY.current = nextScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const revealChrome = () => setChromeHidden(false);

  return (
    <main className="human-forest-app">
      <div
        className="timeline-chrome timeline-chrome--top"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <div className="timeline-brand">Human Forest</div>
        <div className="timeline-desktop-nav">
          <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
        </div>
        <button className="timeline-compose" type="button">
          <PenLine aria-hidden="true" />
          Write
        </button>
      </div>
      {activeView === "timeline" ? <TimelineView /> : <CuratorView />}
      <div
        className="timeline-chrome timeline-chrome--bottom"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      </div>
    </main>
  );
}
