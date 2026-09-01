import { Sprout } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { curatorUser } from "@/data/cloudForest";

import { CuratorView } from "./CuratorView";
import { PartyActions, Portrait } from "./PartyLayer";
import { TimelineView } from "./TimelineView";
import { type CloudForestView } from "./ViewSwitcher";

export function DashboardShell() {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
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
    <main className="cloud-forest-app" data-active-view={activeView}>
      <div
        className="timeline-chrome timeline-chrome--top global-view-chrome"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <header className="party-header">
          <span className="party-self global-view-self">
            <Portrait personId={curatorUser.id} small />
          </span>
          <h1>Timeline</h1>
          <button
            aria-label="Go to Curator"
            className="party-wordmark"
            onClick={() => setActiveView("curator")}
            type="button"
          >
            Curator <Sprout aria-hidden="true" strokeWidth={1.5} />
          </button>
        </header>
      </div>
      {activeView === "timeline" ? (
        <TimelineView />
      ) : (
        <CuratorView onNavigateToTimeline={() => setActiveView("timeline")} />
      )}
      <div
        className="timeline-chrome timeline-chrome--bottom"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <PartyActions activeView={activeView} />
      </div>
    </main>
  );
}
