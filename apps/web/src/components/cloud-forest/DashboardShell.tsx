import { Gift, HandHeart, Sprout } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  curatorPartyPeople,
  curatorTribeNeighborhoods,
  curatorUser,
  incomingCareRequests,
} from "@/data/cloudForest";
import {
  CURRENT_CARE_VIEWER_ID,
  expireDueCareRequests,
  selectCareRequestPresentation,
  selectNextCareRequestExpiration,
  selectTimelineCareRequests,
  transitionCareLifecycle,
  type CareLifecycleAction,
} from "@/lib/careLifecycle";
import {
  loadCareLifecycleState,
  saveCareLifecycleState,
} from "@/lib/careLifecycleStorage";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";
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
  const [careOffers, setCareOffers] = useState<GiveCareOffer[]>([]);
  const [careLifecycle, setCareLifecycle] = useState(() =>
    loadCareLifecycleState(incomingCareRequests),
  );
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

  const applyCareLifecycleAction = (action: CareLifecycleAction) => {
    setCareLifecycle((currentState) => {
      const transition = transitionCareLifecycle(currentState, action);
      if (!transition.ok) return currentState;
      saveCareLifecycleState(transition.state);
      return transition.state;
    });
  };

  const completeReceive = (request: ReceiveCareRequest) => {
    applyCareLifecycleAction({ type: "publish-request", request });
    setReceiveWizardOpen(false);
    setActiveView("timeline");
  };
  const completeGive = (offer: GiveCareOffer) => {
    setCareOffers((currentOffers) => [offer, ...currentOffers]);
    setGiveWizardOpen(false);
    setActiveView("timeline");
  };
  const withdrawCareRequest = (requestId: string) => {
    applyCareLifecycleAction({
      type: "withdraw-request",
      requestId,
      actorId: CURRENT_CARE_VIEWER_ID,
      withdrawnAt: new Date().toISOString(),
    });
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
    const claimedAt = new Date().toISOString();
    applyCareLifecycleAction({
      type: "claim-request",
      claim: {
        id: `care-claim-${request.id}-${CURRENT_CARE_VIEWER_ID}`,
        requestId: request.id,
        claimerId: CURRENT_CARE_VIEWER_ID,
        claimedAt,
      },
    });
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
    () => new Set(careLifecycle.claims.map((claim) => claim.requestId)),
    [careLifecycle.claims],
  );
  const claimedRequests = useMemo(
    () =>
      careLifecycle.requests.filter((request) =>
        careLifecycle.claims.some(
          (claim) =>
            claim.requestId === request.id &&
            claim.claimerId === CURRENT_CARE_VIEWER_ID,
        ),
      ),
    [careLifecycle.claims, careLifecycle.requests],
  );
  const timelineCareRequests = useMemo(
    () =>
      selectTimelineCareRequests(
        careLifecycle,
        CURRENT_CARE_VIEWER_ID,
        new Date().toISOString(),
      ),
    [careLifecycle],
  );
  const minimizedRequestIds = useMemo(
    () =>
      new Set(
        timelineCareRequests
          .filter(
            (request) =>
              selectCareRequestPresentation(
                careLifecycle,
                request.id,
                CURRENT_CARE_VIEWER_ID,
              ).minimized,
          )
          .map((request) => request.id),
      ),
    [careLifecycle, timelineCareRequests],
  );
  const careAudienceSnapshot = useMemo(
    () => ({
      partyMemberIds: partyPeople.map((person) => person.id),
      tribeMemberIds: curatorTribeNeighborhoods.flatMap((neighborhood) =>
        neighborhood.people.map((person) => person.id),
      ),
    }),
    [partyPeople],
  );

  useEffect(() => {
    let timeout: number | undefined;
    const synchronizeExpirations = () => {
      const now = new Date().toISOString();
      setCareLifecycle((currentState) => {
        const nextState = expireDueCareRequests(currentState, now);
        if (nextState === currentState) return currentState;
        saveCareLifecycleState(nextState);
        return nextState;
      });
    };
    const scheduleNextExpirationCheck = () => {
      const now = new Date().toISOString();
      const nextExpiry = selectNextCareRequestExpiration(careLifecycle, now);
      if (nextExpiry === undefined) return;

      const maximumTimeout = 2_147_483_647;
      timeout = window.setTimeout(
        () => {
          synchronizeExpirations();
          scheduleNextExpirationCheck();
        },
        Math.min(Math.max(nextExpiry - Date.parse(now), 0), maximumTimeout),
      );
    };

    synchronizeExpirations();
    scheduleNextExpirationCheck();
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [careLifecycle]);

  const setCareRequestMinimized = (requestId: string, minimized: boolean) => {
    const changedAt = new Date().toISOString();
    const presentation = selectCareRequestPresentation(
      careLifecycle,
      requestId,
      CURRENT_CARE_VIEWER_ID,
    );
    applyCareLifecycleAction(
      presentation.seen
        ? {
            type: "set-seen-minimized",
            requestId,
            viewerId: CURRENT_CARE_VIEWER_ID,
            minimized,
            changedAt,
          }
        : {
            type: "mark-seen",
            seenState: {
              id: `care-seen-${requestId}-${CURRENT_CARE_VIEWER_ID}`,
              requestId,
              viewerId: CURRENT_CARE_VIEWER_ID,
              seenAt: changedAt,
              minimized,
            },
          },
    );
  };

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
      {receiveWizardOpen ? (
        <ReceiveCareWizard
          audienceSnapshot={careAudienceSnapshot}
          onCancel={() => setReceiveWizardOpen(false)}
          onComplete={completeReceive}
        />
      ) : giveWizardOpen ? (
        <GiveCareWizard
          onCancel={() => setGiveWizardOpen(false)}
          onComplete={completeGive}
        />
      ) : (
        <>
          <div
            aria-hidden={careDestination ? true : undefined}
            inert={careDestination ? true : undefined}
          >
            {activeView === "timeline" ? (
              <TimelineView
                careOffers={careOffers}
                careRequests={timelineCareRequests}
                claimedRequestIds={claimedRequestIds}
                minimizedRequestIds={minimizedRequestIds}
                onOfferHelp={(request) =>
                  openCareDestination(
                    { kind: "claim", request },
                    `[data-care-claim-action="${request.id}"]`,
                  )
                }
                onSetRequestMinimized={setCareRequestMinimized}
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
          ) : null}
        </>
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
