import { Gift, HandHeart, Sprout } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  curatorPartyPeople,
  curatorUser,
  incomingCareRequests,
} from "@/data/cloudForest";
import { loadCareClaims, saveCareClaims } from "@/lib/careClaimStorage";
import type {
  CareClaim,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";
import type { CuratorPerson } from "@/types/curator";

import { CuratorView } from "./CuratorView";
import type { AddPartyMemberDraft } from "./AddPartyMemberWizard";
import { PartyAction, PartyActions, Portrait } from "./PartyLayer";
import { TimelineView } from "./TimelineView";
import { type CloudForestView } from "./ViewSwitcher";
import { ReceiveCareWizard } from "./ReceiveCareWizard";
import { GiveCareWizard } from "./GiveCareWizard";
import { ClaimCareView } from "./ClaimCareView";
import { MyCareView } from "./MyCareView";

type CareDestination =
  | { kind: "claim"; request: ReceiveCareRequest }
  | { kind: "my-care" };

export function DashboardShell() {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
  const [addWizardOpen, setAddWizardOpen] = useState(false);
  const [receiveWizardOpen, setReceiveWizardOpen] = useState(false);
  const [giveWizardOpen, setGiveWizardOpen] = useState(false);
  const [careRequests, setCareRequests] = useState<ReceiveCareRequest[]>([]);
  const [careOffers, setCareOffers] = useState<GiveCareOffer[]>([]);
  const [careClaims, setCareClaims] = useState<CareClaim[]>(loadCareClaims);
  const [careDestination, setCareDestination] =
    useState<CareDestination | null>(null);
  const [partyPeople, setPartyPeople] = useState<CuratorPerson[]>(() =>
    curatorPartyPeople.slice(0, 4),
  );
  const focusTargetIdRef = useRef<string | null>(null);
  const careReturnFocusSelectorRef = useRef<string | null>(null);
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
  const completeGive = (offer: GiveCareOffer) => {
    setCareOffers((currentOffers) => [offer, ...currentOffers]);
    setGiveWizardOpen(false);
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
  const openGiveWizard = () => {
    focusTargetIdRef.current = "give";
    setGiveWizardOpen(true);
  };

  const openCareDestination = (
    destination: CareDestination,
    returnFocusSelector: string,
  ) => {
    careReturnFocusSelectorRef.current = returnFocusSelector;
    window.history.pushState(
      { ...window.history.state, careDestination: destination.kind },
      "",
    );
    setCareDestination(destination);
  };

  const restoreFromCareDestination = useCallback(
    (focusSelector = careReturnFocusSelectorRef.current) => {
      careReturnFocusSelectorRef.current = null;
      setCareDestination(null);

      if (focusSelector) {
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>(focusSelector)?.focus();
        });
      }
    },
    [],
  );

  const backFromCareDestination = useCallback(() => {
    restoreFromCareDestination();
    window.history.back();
  }, [restoreFromCareDestination]);

  const confirmCareClaim = () => {
    if (careDestination?.kind !== "claim") return;

    const request = careDestination.request;
    const nextClaims = careClaims.some(
      (claim) => claim.listingId === request.id,
    )
      ? careClaims
      : [
          ...careClaims,
          {
            listingId: request.id,
            state: "claimed" as const,
            claimedAt: new Date().toISOString(),
          },
        ];

    setCareClaims(nextClaims);
    saveCareClaims(nextClaims);
    restoreFromCareDestination(`[data-care-claim-status="${request.id}"]`);
    window.history.back();
  };

  useEffect(() => {
    if (!careDestination) return;

    const handlePopState = () => restoreFromCareDestination();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") backFromCareDestination();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [backFromCareDestination, careDestination, restoreFromCareDestination]);

  useEffect(() => {
    if (
      addWizardOpen ||
      receiveWizardOpen ||
      giveWizardOpen ||
      !focusTargetIdRef.current
    ) {
      return;
    }

    const focusTargetId = focusTargetIdRef.current;
    focusTargetIdRef.current = null;
    requestAnimationFrame(() => {
      if (focusTargetId === "receive" || focusTargetId === "give") {
        const actionButtons = [
          ...document.querySelectorAll<HTMLButtonElement>(
            `[data-party-action="${focusTargetId}"]`,
          ),
        ];
        const visibleAction =
          actionButtons.find(
            (button) =>
              !button.disabled &&
              (button.getClientRects().length > 0 || button.offsetParent),
          ) ?? actionButtons.at(-1);
        visibleAction?.focus();
        return;
      }

      document
        .querySelector<HTMLButtonElement>(
          `[data-curator-tile="${focusTargetId}"]`,
        )
        ?.focus();
    });
  }, [addWizardOpen, giveWizardOpen, partyPeople.length, receiveWizardOpen]);

  const claimedRequestIds = useMemo(
    () => new Set(careClaims.map((claim) => claim.listingId)),
    [careClaims],
  );
  const claimedRequests = useMemo(
    () =>
      incomingCareRequests.filter((request) =>
        claimedRequestIds.has(request.id),
      ),
    [claimedRequestIds],
  );
  const timelineCareRequests = useMemo(
    () => [...incomingCareRequests, ...careRequests],
    [careRequests],
  );

  return (
    <main
      className="cloud-forest-app"
      data-active-view={activeView}
      data-receive-open={receiveWizardOpen}
      data-give-open={giveWizardOpen}
      data-care-destination={careDestination?.kind}
    >
      <div
        className="timeline-chrome timeline-chrome--top global-view-chrome"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <header className="party-header timeline-header">
          <button
            aria-label="Open My Care"
            className="party-self global-view-self"
            data-my-care-trigger="timeline"
            onClick={() =>
              openCareDestination(
                { kind: "my-care" },
                '[data-my-care-trigger="timeline"]',
              )
            }
            type="button"
          >
            <Portrait personId={curatorUser.id} small />
          </button>
          <h1>Timeline</h1>
          <button
            aria-label="Go to Curator"
            className="party-wordmark"
            onClick={() => setActiveView("curator")}
            type="button"
          >
            Curator <Sprout aria-hidden="true" strokeWidth={1.5} />
          </button>
          {!receiveWizardOpen &&
          !giveWizardOpen &&
          activeView === "timeline" ? (
            <div className="timeline-desktop-care-actions">
              <PartyAction icon={Gift} onClick={openGiveWizard} tone="quiet">
                Give
              </PartyAction>
              <PartyAction
                icon={HandHeart}
                onClick={openReceiveWizard}
                tone="quiet"
              >
                Receive
              </PartyAction>
            </div>
          ) : null}
        </header>
      </div>
      {careDestination?.kind === "claim" ? (
        <ClaimCareView
          onBack={backFromCareDestination}
          onConfirm={confirmCareClaim}
          request={careDestination.request}
        />
      ) : careDestination?.kind === "my-care" ? (
        <MyCareView
          claimedRequests={claimedRequests}
          onBack={backFromCareDestination}
        />
      ) : receiveWizardOpen ? (
        <ReceiveCareWizard
          onCancel={() => setReceiveWizardOpen(false)}
          onComplete={completeReceive}
        />
      ) : giveWizardOpen ? (
        <GiveCareWizard
          onCancel={() => setGiveWizardOpen(false)}
          onComplete={completeGive}
        />
      ) : activeView === "timeline" ? (
        <TimelineView
          careOffers={careOffers}
          careRequests={timelineCareRequests}
          claimedRequestIds={claimedRequestIds}
          onOfferHelp={(request) =>
            openCareDestination(
              { kind: "claim", request },
              `[data-care-claim-action="${request.id}"]`,
            )
          }
          onWithdraw={withdrawCareRequest}
          onWithdrawOffer={(offerId) =>
            setCareOffers((currentOffers) =>
              currentOffers.filter((offer) => offer.id !== offerId),
            )
          }
        />
      ) : (
        <CuratorView
          addWizardOpen={addWizardOpen}
          onAddPartyMember={openAddWizard}
          onCancelAdd={() => setAddWizardOpen(false)}
          onCompleteAdd={completeAdd}
          onNavigateToTimeline={() => setActiveView("timeline")}
          onOpenMyCare={() =>
            openCareDestination(
              { kind: "my-care" },
              '[data-my-care-trigger="curator"]',
            )
          }
          partyPeople={partyPeople}
        />
      )}
      {!receiveWizardOpen &&
      !giveWizardOpen &&
      !careDestination &&
      (activeView === "timeline" || !addWizardOpen) ? (
        <div
          className="timeline-chrome timeline-chrome--bottom"
          data-hidden={chromeHidden}
          onFocusCapture={revealChrome}
        >
          <PartyActions
            activeView={activeView}
            onAdd={openAddWizard}
            onGive={openGiveWizard}
            onReceive={openReceiveWizard}
            partyIsFull={activeView === "curator" && partyPeople.length >= 5}
          />
        </div>
      ) : null}
    </main>
  );
}
