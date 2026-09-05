import { Gift, HandHeart, Sprout } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  curatorPartyPeople,
  curatorTribeNeighborhoods,
  curatorUser,
  incomingCareRequests,
} from "@/data/cloudForest";
import { carePerspectiveOptions } from "@/data/careLifecycleMockData";
import {
  canPassCareRequest,
  CURRENT_CARE_VIEWER_ID,
  expireDueCareRequests,
  haveAllPartyMembersPassed,
  selectCareRequestPresentation,
  selectNextCareRequestExpiration,
  selectPrivateCareHistory,
  selectPrivateCareGratitudes,
  selectProfileCareRequests,
  selectTimelineCareRequests,
  selectTribeCareGratitudes,
  transitionCareLifecycle,
  type CareLifecycleAction,
} from "@/lib/careLifecycle";
import {
  loadCareLifecycleState,
  saveCareLifecycleState,
} from "@/lib/careLifecycleStorage";
import type {
  CarePersonId,
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
import { NotCompletedCareView } from "./NotCompletedCareView";
import {
  CareGratitudeWizard,
  type CareGratitudeDraft,
} from "./CareGratitudeWizard";

type CareDestination =
  | { kind: "claim"; request: ReceiveCareRequest }
  | { kind: "my-care" }
  | {
      kind: "not-completed";
      actorId: CarePersonId;
      completionFocusSelector: string;
      parentReturnFocusSelector: string | null;
      request: ReceiveCareRequest;
      returnToMyCare: boolean;
    }
  | {
      kind: "gratitude";
      completionFocusSelector: string;
      parentReturnFocusSelector: string | null;
      receiverId: CarePersonId;
      request: ReceiveCareRequest;
      returnToMyCare: boolean;
    };

type CurrentPersonControl = {
  ariaLabel: string;
  initials: string;
  onOpen: () => void;
  personId: string;
  triggerRef?: RefObject<HTMLButtonElement | null>;
};

export function DashboardShell({
  currentPersonControl,
}: {
  currentPersonControl?: CurrentPersonControl;
}) {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
  const [addWizardOpen, setAddWizardOpen] = useState(false);
  const [receiveWizardOpen, setReceiveWizardOpen] = useState(false);
  const [giveWizardOpen, setGiveWizardOpen] = useState(false);
  const [careOffers, setCareOffers] = useState<GiveCareOffer[]>([]);
  const [careLifecycle, setCareLifecycle] = useState(() =>
    loadCareLifecycleState(incomingCareRequests),
  );
  const [carePassAnnouncement, setCarePassAnnouncement] = useState<
    string | undefined
  >();
  const [careViewerId, setCareViewerId] = useState(CURRENT_CARE_VIEWER_ID);
  const [careDestination, setCareDestination] =
    useState<CareDestination | null>(null);
  const [curatorDetailOpen, setCuratorDetailOpen] = useState(false);
  const [partyPeople, setPartyPeople] = useState<CuratorPerson[]>(() =>
    curatorPartyPeople.slice(0, 4),
  );
  const focusTargetIdRef = useRef<string | null>(null);
  const careReturnFocusSelectorRef = useRef<string | null>(null);
  const ignoreNextCarePopStateRef = useRef(false);
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
  const withdrawCareRequestAs = (requestId: string, actorId = careViewerId) => {
    applyCareLifecycleAction({
      type: "withdraw-request",
      requestId,
      actorId,
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
    (
      focusSelector = careReturnFocusSelectorRef.current,
      returnToMyCare = false,
      parentReturnFocusSelector: string | null = null,
    ) => {
      careReturnFocusSelectorRef.current = parentReturnFocusSelector;
      setCareDestination(returnToMyCare ? { kind: "my-care" } : null);

      if (focusSelector) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.querySelector<HTMLElement>(focusSelector)?.focus();
          });
        });
      }
    },
    [],
  );

  const rewindCareHistory = useCallback(() => {
    ignoreNextCarePopStateRef.current = true;
    window.history.back();
    window.setTimeout(() => {
      ignoreNextCarePopStateRef.current = false;
    }, 100);
  }, []);

  const backFromCareDestination = useCallback(() => {
    restoreFromCareDestination(
      careReturnFocusSelectorRef.current,
      (careDestination?.kind === "not-completed" &&
        careDestination.returnToMyCare) ||
        (careDestination?.kind === "gratitude" &&
          careDestination.returnToMyCare),
      careDestination?.kind === "not-completed" ||
        careDestination?.kind === "gratitude"
        ? careDestination.parentReturnFocusSelector
        : null,
    );
    rewindCareHistory();
  }, [careDestination, restoreFromCareDestination, rewindCareHistory]);

  const confirmCareClaim = () => {
    if (careDestination?.kind !== "claim") return;

    const request = careDestination.request;
    const claimedAt = new Date().toISOString();
    applyCareLifecycleAction({
      type: "claim-request",
      claim: {
        id: `care-claim-${request.id}-${careViewerId}`,
        requestId: request.id,
        claimerId: careViewerId,
        claimedAt,
      },
    });
    restoreFromCareDestination(`[data-care-claim-status="${request.id}"]`);
    rewindCareHistory();
  };

  const recordCareCompleted = (
    request: ReceiveCareRequest,
    participantId = careViewerId,
  ) => {
    const decidedAt = new Date().toISOString();
    const closedFocusSelector =
      careDestination?.kind === "my-care"
        ? '[data-my-care-section="commitments"]'
        : document.querySelector(".curator-detail-view")
          ? "[data-care-profile-heading]"
          : "[data-care-receive-filter]";
    let closesRequest = false;
    setCareLifecycle((currentState) => {
      const transition = transitionCareLifecycle(currentState, {
        type: "record-completion",
        completion: {
          id: `care-completion-${request.id}-${participantId}`,
          requestId: request.id,
          participantId,
          decision: "completed",
          decidedAt,
        },
      });
      if (!transition.ok) return currentState;
      closesRequest = transition.state.history.some(
        (entry) =>
          entry.requestId === request.id && entry.outcome === "completed",
      );
      saveCareLifecycleState(transition.state);
      return transition.state;
    });
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          closesRequest
            ? closedFocusSelector
            : `[data-care-outcome-status="${request.id}"]`,
        )
        ?.focus();
    });
  };

  const openNotCompleted = (
    request: ReceiveCareRequest,
    actorId = careViewerId,
  ) => {
    const returnToMyCare = careDestination?.kind === "my-care";
    const parentReturnFocusSelector = careReturnFocusSelectorRef.current;
    const completionFocusSelector = returnToMyCare
      ? '[data-my-care-section="commitments"]'
      : document.querySelector(".curator-detail-view")
        ? "[data-care-profile-heading]"
        : "[data-care-receive-filter]";
    const returnFocusSelector = returnToMyCare
      ? `.my-care-view [data-care-outcome-action="${request.id}"]`
      : document.querySelector(".curator-detail-view")
        ? `.curator-detail-view [data-care-outcome-action="${request.id}"]`
        : `[data-care-outcome-action="${request.id}"]`;
    openCareDestination(
      {
        kind: "not-completed",
        actorId,
        completionFocusSelector,
        parentReturnFocusSelector,
        request,
        returnToMyCare,
      },
      returnFocusSelector,
    );
  };

  const openGratitude = (
    request: ReceiveCareRequest,
    receiverId = careViewerId,
  ) => {
    const returnToMyCare = careDestination?.kind === "my-care";
    const parentReturnFocusSelector = careReturnFocusSelectorRef.current;
    const profileOpen = Boolean(document.querySelector(".curator-detail-view"));
    const completionFocusSelector = returnToMyCare
      ? `.my-care-view [data-care-outcome-status="${request.id}"]`
      : profileOpen
        ? `.curator-detail-view [data-care-outcome-status="${request.id}"]`
        : `[data-care-outcome-status="${request.id}"]`;
    const returnFocusSelector = returnToMyCare
      ? `.my-care-view [data-care-completed-action="${request.id}"]`
      : profileOpen
        ? `.curator-detail-view [data-care-completed-action="${request.id}"]`
        : `[data-care-completed-action="${request.id}"]`;
    openCareDestination(
      {
        kind: "gratitude",
        completionFocusSelector,
        parentReturnFocusSelector,
        receiverId,
        request,
        returnToMyCare,
      },
      returnFocusSelector,
    );
  };

  const recordCompletionOrOpenGratitude = (
    request: ReceiveCareRequest,
    participantId = careViewerId,
  ) => {
    if (participantId === request.requester.id) {
      openGratitude(request, participantId);
      return;
    }
    recordCareCompleted(request, participantId);
  };

  const confirmGratitude = (draft: CareGratitudeDraft) => {
    if (careDestination?.kind !== "gratitude") return;
    const {
      completionFocusSelector,
      parentReturnFocusSelector,
      receiverId,
      request,
      returnToMyCare,
    } = careDestination;
    const createdAt = new Date().toISOString();

    setCareLifecycle((currentState) => {
      const claim = currentState.claims.find(
        (candidate) => candidate.requestId === request.id,
      );
      if (!claim) return currentState;

      const gratitudeTransition = transitionCareLifecycle(currentState, {
        type: "record-gratitude",
        gratitude: {
          id: `care-gratitude-${request.id}-${receiverId}`,
          requestId: request.id,
          receiverId,
          giverId: claim.claimerId,
          statementId: draft.statementId,
          message: draft.message,
          postToTimeline: draft.postToTimeline,
          anonymized: draft.postToTimeline && draft.anonymized,
          createdAt,
        },
      });
      if (!gratitudeTransition.ok) return currentState;

      const completionTransition = transitionCareLifecycle(
        gratitudeTransition.state,
        {
          type: "record-completion",
          completion: {
            id: `care-completion-${request.id}-${receiverId}`,
            requestId: request.id,
            participantId: receiverId,
            decision: "completed",
            decidedAt: createdAt,
          },
        },
      );
      if (!completionTransition.ok) return currentState;
      saveCareLifecycleState(completionTransition.state);
      return completionTransition.state;
    });
    restoreFromCareDestination(
      completionFocusSelector,
      returnToMyCare,
      parentReturnFocusSelector,
    );
    rewindCareHistory();
  };

  const confirmNotCompleted = (reason: string, tryAgain: boolean) => {
    if (careDestination?.kind !== "not-completed") return;
    const {
      actorId,
      completionFocusSelector,
      parentReturnFocusSelector,
      request,
      returnToMyCare,
    } = careDestination;
    const disposedAt = new Date().toISOString();
    const successorRequest = tryAgain
      ? {
          ...request,
          id: `${request.id}-retry-${Date.now()}`,
          createdAt: disposedAt,
          expiresAt: new Date(
            Date.parse(disposedAt) + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }
      : undefined;

    setCareLifecycle((currentState) => {
      const completionTransition = transitionCareLifecycle(currentState, {
        type: "record-completion",
        completion: {
          id: `care-completion-${request.id}-${actorId}`,
          requestId: request.id,
          participantId: actorId,
          decision: "not-completed",
          decidedAt: disposedAt,
        },
      });
      if (!completionTransition.ok) return currentState;

      const dispositionId = `care-disposition-${request.id}-${actorId}`;
      const dispositionTransition = transitionCareLifecycle(
        completionTransition.state,
        {
          type: "record-disposition",
          disposition: {
            id: dispositionId,
            requestId: request.id,
            actorId,
            kind: tryAgain ? "retry" : "close",
            reason,
            disposedAt,
            ...(successorRequest
              ? { successorRequestId: successorRequest.id }
              : {}),
          },
          ...(successorRequest ? { successorRequest } : {}),
        },
      );
      if (!dispositionTransition.ok) return currentState;
      saveCareLifecycleState(dispositionTransition.state);
      return dispositionTransition.state;
    });
    restoreFromCareDestination(
      completionFocusSelector,
      returnToMyCare,
      parentReturnFocusSelector,
    );
    rewindCareHistory();
  };

  useEffect(() => {
    if (!careDestination) return;

    const handlePopState = () => {
      if (ignoreNextCarePopStateRef.current) {
        ignoreNextCarePopStateRef.current = false;
        return;
      }
      restoreFromCareDestination(
        careReturnFocusSelectorRef.current,
        (careDestination.kind === "not-completed" &&
          careDestination.returnToMyCare) ||
          (careDestination.kind === "gratitude" &&
            careDestination.returnToMyCare),
        careDestination.kind === "not-completed" ||
          careDestination.kind === "gratitude"
          ? careDestination.parentReturnFocusSelector
          : null,
      );
    };
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
      selectProfileCareRequests(
        careLifecycle,
        CURRENT_CARE_VIEWER_ID,
        CURRENT_CARE_VIEWER_ID,
        new Date().toISOString(),
      ).filter((request) =>
        careLifecycle.claims.some(
          (claim) =>
            claim.requestId === request.id &&
            claim.claimerId === CURRENT_CARE_VIEWER_ID,
        ),
      ),
    [careLifecycle],
  );
  const selfProfileRequests = useMemo(
    () =>
      selectProfileCareRequests(
        careLifecycle,
        CURRENT_CARE_VIEWER_ID,
        CURRENT_CARE_VIEWER_ID,
        new Date().toISOString(),
      ).filter((request) => request.requester.id === CURRENT_CARE_VIEWER_ID),
    [careLifecycle],
  );
  const selfCareHistory = useMemo(
    () =>
      selectPrivateCareHistory(
        careLifecycle,
        CURRENT_CARE_VIEWER_ID,
        CURRENT_CARE_VIEWER_ID,
      ),
    [careLifecycle],
  );
  const selfCareGratitudes = useMemo(
    () =>
      selectPrivateCareGratitudes(
        careLifecycle,
        CURRENT_CARE_VIEWER_ID,
        CURRENT_CARE_VIEWER_ID,
      ),
    [careLifecycle],
  );
  const tribeCareGratitudes = useMemo(
    () => selectTribeCareGratitudes(careLifecycle),
    [careLifecycle],
  );
  const viewerClaimedRequestIds = useMemo(
    () =>
      new Set(
        careLifecycle.claims
          .filter((claim) => claim.claimerId === careViewerId)
          .map((claim) => claim.requestId),
      ),
    [careLifecycle.claims, careViewerId],
  );
  const viewerCompletedRequestIds = useMemo(
    () =>
      new Set(
        careLifecycle.completions
          .filter(
            (completion) =>
              completion.participantId === careViewerId &&
              completion.decision === "completed",
          )
          .map((completion) => completion.requestId),
      ),
    [careLifecycle.completions, careViewerId],
  );
  const otherParticipantCompletedRequestIds = useMemo(
    () =>
      new Set(
        careLifecycle.completions
          .filter(
            (completion) =>
              completion.participantId !== careViewerId &&
              completion.decision === "completed",
          )
          .map((completion) => completion.requestId),
      ),
    [careLifecycle.completions, careViewerId],
  );
  const timelineCareRequests = useMemo(
    () =>
      selectTimelineCareRequests(
        careLifecycle,
        careViewerId,
        new Date().toISOString(),
      ),
    [careLifecycle, careViewerId],
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
                careViewerId,
              ).minimized,
          )
          .map((request) => request.id),
      ),
    [careLifecycle, careViewerId, timelineCareRequests],
  );
  const passableRequestIds = useMemo(() => {
    const now = new Date().toISOString();
    return new Set(
      timelineCareRequests
        .filter((request) =>
          canPassCareRequest(careLifecycle, request.id, careViewerId, now),
        )
        .map((request) => request.id),
    );
  }, [careLifecycle, careViewerId, timelineCareRequests]);
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
      careViewerId,
    );
    applyCareLifecycleAction(
      presentation.seen
        ? {
            type: "set-seen-minimized",
            requestId,
            viewerId: careViewerId,
            minimized,
            changedAt,
          }
        : {
            type: "mark-seen",
            seenState: {
              id: `care-seen-${requestId}-${careViewerId}`,
              requestId,
              viewerId: careViewerId,
              seenAt: changedAt,
              minimized,
            },
          },
    );
  };

  const passCareRequest = (request: ReceiveCareRequest) => {
    const transition = transitionCareLifecycle(careLifecycle, {
      type: "pass-request",
      pass: {
        id: `care-pass-${request.id}-${careViewerId}`,
        requestId: request.id,
        actorId: careViewerId,
        passedAt: new Date().toISOString(),
      },
    });
    if (!transition.ok) return;

    saveCareLifecycleState(transition.state);
    setCareLifecycle(transition.state);
    setCarePassAnnouncement(
      haveAllPartyMembersPassed(transition.state, request)
        ? `Your Party passed on ${request.requester.displayName.split(" ")[0]}’s request. It is now shared with the original Tribe audience.`
        : `You passed on ${request.requester.displayName.split(" ")[0]}’s request this time. Other Party members can still respond.`,
    );
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>("[data-care-receive-filter]")
        ?.focus();
    });
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
            aria-label={currentPersonControl?.ariaLabel ?? "Open My Care"}
            className="party-self global-view-self"
            data-my-care-trigger="timeline"
            data-prototype-current-person={
              currentPersonControl ? "true" : undefined
            }
            onClick={
              currentPersonControl?.onOpen ??
              (() =>
                openCareDestination(
                  { kind: "my-care" },
                  '[data-my-care-trigger="timeline"]',
                ))
            }
            ref={currentPersonControl?.triggerRef}
            type="button"
          >
            <Portrait
              initials={currentPersonControl?.initials}
              personId={currentPersonControl?.personId ?? curatorUser.id}
              small
            />
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
                careGratitudes={tribeCareGratitudes}
                careGratitudeRequests={careLifecycle.requests}
                careRequests={timelineCareRequests}
                claimedRequestIds={claimedRequestIds}
                minimizedRequestIds={minimizedRequestIds}
                onOfferHelp={(request) =>
                  openCareDestination(
                    { kind: "claim", request },
                    `[data-care-claim-action="${request.id}"]`,
                  )
                }
                onPass={passCareRequest}
                onRecordCompleted={recordCompletionOrOpenGratitude}
                onRecordNotCompleted={openNotCompleted}
                onSetRequestMinimized={setCareRequestMinimized}
                onWithdraw={withdrawCareRequestAs}
                onWithdrawOffer={(offerId) =>
                  setCareOffers((currentOffers) =>
                    currentOffers.filter((offer) => offer.id !== offerId),
                  )
                }
                passableRequestIds={passableRequestIds}
                passAnnouncement={carePassAnnouncement}
                perspectiveOptions={carePerspectiveOptions}
                viewerClaimedRequestIds={viewerClaimedRequestIds}
                viewerCompletedRequestIds={viewerCompletedRequestIds}
                otherParticipantCompletedRequestIds={
                  otherParticipantCompletedRequestIds
                }
                viewerId={careViewerId}
                onViewerChange={(viewerId) => {
                  setCarePassAnnouncement(undefined);
                  setCareViewerId(viewerId);
                }}
              />
            ) : (
              <CuratorView
                addWizardOpen={addWizardOpen}
                careLifecycle={careLifecycle}
                careViewerId={careViewerId}
                onAddPartyMember={openAddWizard}
                onCancelAdd={() => setAddWizardOpen(false)}
                onCompleteAdd={completeAdd}
                onDetailOpenChange={setCuratorDetailOpen}
                onNavigateToTimeline={() => setActiveView("timeline")}
                onOpenMyCare={() =>
                  openCareDestination(
                    { kind: "my-care" },
                    '[data-my-care-trigger="curator"]',
                  )
                }
                onOfferHelp={(request) =>
                  openCareDestination(
                    { kind: "claim", request },
                    `[data-care-claim-action="${request.id}"]`,
                  )
                }
                onPass={passCareRequest}
                onRecordCompleted={recordCompletionOrOpenGratitude}
                onRecordNotCompleted={openNotCompleted}
                onSetRequestMinimized={setCareRequestMinimized}
                onWithdraw={withdrawCareRequestAs}
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
              activeRequests={selfProfileRequests}
              careLifecycle={careLifecycle}
              claimedRequests={claimedRequests}
              history={selfCareHistory}
              gratitudes={selfCareGratitudes}
              onBack={backFromCareDestination}
              onSetRequestMinimized={(requestId, minimized) => {
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
              }}
              onRecordCompleted={(request) =>
                recordCompletionOrOpenGratitude(request, CURRENT_CARE_VIEWER_ID)
              }
              onRecordNotCompleted={(request) =>
                openNotCompleted(request, CURRENT_CARE_VIEWER_ID)
              }
              onWithdraw={(requestId) =>
                withdrawCareRequestAs(requestId, CURRENT_CARE_VIEWER_ID)
              }
            />
          ) : careDestination?.kind === "not-completed" ? (
            <NotCompletedCareView
              onBack={backFromCareDestination}
              onConfirm={confirmNotCompleted}
              request={careDestination.request}
            />
          ) : careDestination?.kind === "gratitude" ? (
            <CareGratitudeWizard
              onBack={backFromCareDestination}
              onComplete={confirmGratitude}
              request={careDestination.request}
            />
          ) : null}
        </>
      )}
      {!receiveWizardOpen &&
      !giveWizardOpen &&
      !careDestination &&
      (activeView === "timeline" || (!addWizardOpen && !curatorDetailOpen)) ? (
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
