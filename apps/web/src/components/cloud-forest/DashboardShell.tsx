import { Sprout } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { curatorPartyPeople, curatorUser } from "@/data/cloudForest";
import type { CuratorPerson } from "@/types/curator";

import { CuratorView } from "./CuratorView";
import type { AddPartyMemberDraft } from "./AddPartyMemberWizard";
import { PartyActions, Portrait } from "./PartyLayer";
import { TimelineView } from "./TimelineView";
import { type CloudForestView } from "./ViewSwitcher";

export function DashboardShell() {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
  const [addWizardOpen, setAddWizardOpen] = useState(false);
  const [activeCuratorLayer, setActiveCuratorLayer] = useState("party");
  const [partyPeople, setPartyPeople] = useState<CuratorPerson[]>(() =>
    curatorPartyPeople.slice(0, 4),
  );
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
  const openAddWizard = () => {
    if (partyPeople.length < 5) {
      setAddWizardOpen(true);
    }
  };
  const completeAdd = (draft: AddPartyMemberDraft) => {
    const initials = draft.displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

    setPartyPeople((currentPeople) => [
      ...currentPeople,
      {
        ...draft,
        id: `party-member-${Date.now()}`,
        initials,
        recentStatus: "Newly added",
      },
    ]);
    setActiveCuratorLayer("party");
    setAddWizardOpen(false);
  };
  const handleLayerActiveChange = (label: string, isActive: boolean) => {
    if (isActive) {
      setActiveCuratorLayer(label);
    }
  };

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
        <CuratorView
          addWizardOpen={addWizardOpen}
          onAddPartyMember={openAddWizard}
          onCancelAdd={() => setAddWizardOpen(false)}
          onCompleteAdd={completeAdd}
          onLayerActiveChange={handleLayerActiveChange}
          onNavigateToTimeline={() => setActiveView("timeline")}
          partyPeople={partyPeople}
        />
      )}
      {activeView === "timeline" || !addWizardOpen ? (
        <div
          className="timeline-chrome timeline-chrome--bottom"
          data-hidden={chromeHidden}
          onFocusCapture={revealChrome}
        >
          <PartyActions
            activeView={activeView}
            onAdd={openAddWizard}
            partyIsFull={
              activeView === "curator" &&
              activeCuratorLayer !== "tribe" &&
              partyPeople.length >= 5
            }
          />
        </div>
      ) : null}
    </main>
  );
}
