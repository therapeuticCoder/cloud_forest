import { HandHeart, Sprout } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { curatorPartyPeople, curatorUser } from "@/data/cloudForest";
import type { ReceiveCareRequest } from "@/types/careRequest";
import type { CuratorPerson } from "@/types/curator";

import { CuratorView } from "./CuratorView";
import type { AddPartyMemberDraft } from "./AddPartyMemberWizard";
import { PartyAction, PartyActions, Portrait } from "./PartyLayer";
import { TimelineView } from "./TimelineView";
import { type CloudForestView } from "./ViewSwitcher";
import { ReceiveCareWizard } from "./ReceiveCareWizard";

export function DashboardShell() {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
  const [addWizardOpen, setAddWizardOpen] = useState(false);
  const [receiveWizardOpen, setReceiveWizardOpen] = useState(false);
  const [careRequests, setCareRequests] = useState<ReceiveCareRequest[]>([]);
  const [partyPeople, setPartyPeople] = useState<CuratorPerson[]>(() =>
    curatorPartyPeople.slice(0, 4),
  );
  const focusTargetIdRef = useRef<string | null>(null);
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
      focusTargetIdRef.current = "party-add";
      setAddWizardOpen(true);
    }
  };
  const completeAdd = (draft: AddPartyMemberDraft) => {
    const newMemberId = `party-member-${Date.now()}`;
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
        id: newMemberId,
        initials,
        recentStatus: "Newly added",
      },
    ]);
    focusTargetIdRef.current = `party-${newMemberId}`;
    setAddWizardOpen(false);
  };

  const completeReceive = (request: ReceiveCareRequest) => {
    setCareRequests((currentRequests) => [request, ...currentRequests]);
    setReceiveWizardOpen(false);
    setActiveView("timeline");
  };
  const withdrawCareRequest = (requestId: string) => {
    setCareRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== requestId),
    );
  };
  const openReceiveWizard = () => {
    focusTargetIdRef.current = "receive";
    setReceiveWizardOpen(true);
  };

  useEffect(() => {
    if (addWizardOpen || receiveWizardOpen || !focusTargetIdRef.current) {
      return;
    }

    const focusTargetId = focusTargetIdRef.current;
    focusTargetIdRef.current = null;
    requestAnimationFrame(() => {
      const selector =
        focusTargetId === "receive"
          ? '[data-party-action="receive"]'
          : `[data-curator-tile="${focusTargetId}"]`;
      document.querySelector<HTMLButtonElement>(selector)?.focus();
    });
  }, [addWizardOpen, partyPeople.length, receiveWizardOpen]);

  return (
    <main
      className="cloud-forest-app"
      data-active-view={activeView}
      data-receive-open={receiveWizardOpen}
    >
      <div
        className="timeline-chrome timeline-chrome--top global-view-chrome"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <header className="party-header timeline-header">
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
          {!receiveWizardOpen && activeView === "timeline" ? (
            <PartyAction
              className="timeline-desktop-receive"
              icon={HandHeart}
              onClick={openReceiveWizard}
              tone="quiet"
            >
              Receive
            </PartyAction>
          ) : null}
        </header>
      </div>
      {receiveWizardOpen ? (
        <ReceiveCareWizard
          onCancel={() => setReceiveWizardOpen(false)}
          onComplete={completeReceive}
        />
      ) : activeView === "timeline" ? (
        <TimelineView
          careRequests={careRequests}
          onWithdraw={withdrawCareRequest}
        />
      ) : (
        <CuratorView
          addWizardOpen={addWizardOpen}
          onAddPartyMember={openAddWizard}
          onCancelAdd={() => setAddWizardOpen(false)}
          onCompleteAdd={completeAdd}
          onNavigateToTimeline={() => setActiveView("timeline")}
          partyPeople={partyPeople}
        />
      )}
      {!receiveWizardOpen && (activeView === "timeline" || !addWizardOpen) ? (
        <div
          className="timeline-chrome timeline-chrome--bottom"
          data-hidden={chromeHidden}
          onFocusCapture={revealChrome}
        >
          <PartyActions
            activeView={activeView}
            onAdd={openAddWizard}
            onReceive={openReceiveWizard}
            partyIsFull={activeView === "curator" && partyPeople.length >= 5}
          />
        </div>
      ) : null}
    </main>
  );
}
