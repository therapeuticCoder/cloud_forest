import { useCareActions } from "../features/care/useCareActions";
import { isActiveCareStatus } from "@cloud-forest/domain";
import { useCharacterActions } from "../features/curator/useCharacterActions";
import { CloudOff, Gift, HandHeart } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitials } from "@/lib/personPresentation";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { CuratorView } from "../features/curator/CuratorView";
import { ConnectionPairingView } from "../features/pairing/ConnectionPairingView";
import { createConnectionPairing } from "../features/pairing/connectionPairingClient";
import type { CharacterDraft } from "@/types/curator";
import {
  curationErrorMessage,
  useCuratedPeople,
  type CuratedPersonApiClient,
} from "../features/curator/useCuratedPeople";
import {
  careErrorMessage,
  type CareApiClient,
} from "../features/care/useCares";
import {
  PartyAction,
  PartyActions,
  Portrait,
} from "../features/curator/PartyLayer";
import { TimelineView } from "../features/timeline/TimelineView";
import type { TimelineError } from "../features/timeline/TimelinePanel";
import { type CloudForestView, ViewSwitcher } from "./ViewSwitcher";
import type { CuratorLayerLabel } from "../features/curator/curatorLayerStyles";
import { CareWizard } from "../features/care/CareWizard";
import type { CareDraft } from "@/types/care";
import { CareDetailView } from "../features/care/CareDetailView";
import { ClaimCareView } from "../features/care/ClaimCareView";
import { CareGratitudeWizard } from "../features/care/CareGratitudeWizard";
import { CareWithdrawalWizard } from "../features/care/CareWithdrawalWizard";
import { MyCareView } from "../features/care/MyCareView";
import { useCareNavigation } from "../features/care/useCareNavigation";
import {
  clearPendingConnectionPairing,
  rememberPendingConnectionPairing,
} from "@/lib/pendingConnectionPairing";

const curatorSelectionLayerLabels: Record<
  CuratorSelection["layer"],
  CuratorLayerLabel
> = {
  guild: "Guilds",
  holding: "Holding",
  party: "Party",
  signal: "Signals",
  tribe: "Tribe",
};

export type { CuratedPersonApiClient } from "../features/curator/useCuratedPeople";
export type { CareApiClient } from "../features/care/useCares";

export function DashboardShell({
  apiClient,
  careApiClient,
  currentPersonId,
  displayName,
  role,
  sessionOffline = false,
  onCreateSignupCode,
  onSignOut,
  signOutError,
  signingOut,
}: {
  apiClient?: CuratedPersonApiClient;
  careApiClient?: CareApiClient;
  currentPersonId: string;
  displayName: string;
  role: "admin" | "user";
  sessionOffline?: boolean;
  onCreateSignupCode: () => Promise<
    { ok: true; link: string } | { ok: false; message: string }
  >;
  onSignOut: () => void;
  signOutError?: string;
  signingOut: boolean;
}) {
  const [activeView, setActiveView] = useState<CloudForestView>("timeline");
  const [activeCuratorLayer, setActiveCuratorLayer] =
    useState<CuratorLayerLabel>("Party");
  const [curatorSelection, setCuratorSelection] =
    useState<CuratorSelection | null>(null);
  const [pairingToken, setPairingToken] = useState(() =>
    new URL(window.location.href).searchParams.get("pairing"),
  );
  const [addWizardOpen, setAddWizardOpen] = useState(false);
  const [receiveWizardOpen, setReceiveWizardOpen] = useState(false);
  const [giveWizardOpen, setGiveWizardOpen] = useState(false);
  const [timelinePostComposerOpen, setTimelinePostComposerOpen] =
    useState(false);
  const careViewerId = currentPersonId;
  const currentUser = useMemo(
    () => ({
      displayName,
      id: currentPersonId,
      initials: createInitials(displayName),
    }),
    [currentPersonId, displayName],
  );
  const curated = useCuratedPeople(
    apiClient,
    activeView === "curator",
    currentPersonId,
  );
  const {
    add: addCuratedPerson,
    blockedPeople,
    holdingPeople,
    load: loadCuratedPeople,
    partyPeople,
    people: curatedPeople,
    tribePeople,
  } = curated;
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );
  const [timelineApiOffline, setTimelineApiOffline] = useState(false);
  const deviceIsOffline = sessionOffline || !isOnline;
  const appIsOffline =
    deviceIsOffline || (activeView === "timeline" && timelineApiOffline);
  const wasOnlineRef = useRef(isOnline);
  const [addSubmission, setAddSubmission] = useState<{
    pending: boolean;
    error?: string;
  }>({ pending: false });
  const [addDestination, setAddDestination] = useState<
    "holding" | "party" | "tribe"
  >("party");
  const focusTargetIdRef = useRef<string | null>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const lastScrollY = useRef(0);
  const {
    careDestination,
    openCareDestination,
    restoreFromCareDestination,
    rewindCareHistory,
    backFromCareDestination,
  } = useCareNavigation(setChromeHidden);
  const {
    caresState,
    claimCare,
    createCare,
    withdrawCare,
    careGratitude,
    careWithdrawal,
    setCareWithdrawal,
    carePassAnnouncement,
    handlePassCare,
    recordCareCompleted,
    skipCareGratitude,
    saveCareGratitude,
    saveCareWithdrawal,
  } = useCareActions(
    careApiClient,
    careViewerId,
    `${activeView}:${careDestination?.kind ?? ""}`,
  );
  const curatorIsOffline =
    appIsOffline || curatedPeople.offline || curatedPeople.source === "cache";
  const profileIsOffline =
    activeView === "curator" ? curatorIsOffline : appIsOffline;
  const currentCuratorLayer = curatorSelection
    ? curatorSelectionLayerLabels[curatorSelection.layer]
    : activeCuratorLayer;
  const canEditCuratedPeople =
    !curatorIsOffline &&
    curatedPeople.status === "ready" &&
    curatedPeople.source === "live";
  const {
    characterSubmission,
    setCharacterSubmission,
    updateCharacter,
    deleteCharacter,
    endConnection,
    blockCharacter,
    unblockCharacter,
  } = useCharacterActions(curated, canEditCuratedPeople);
  const activeCuratorLayerCount =
    currentCuratorLayer === "Holding"
      ? `${holdingPeople.length}/5`
      : currentCuratorLayer === "Party"
        ? `${partyPeople.length}/5`
        : currentCuratorLayer === "Tribe"
          ? `${tribePeople.length}/100`
          : undefined;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const cameOnline = !wasOnlineRef.current && isOnline;
    wasOnlineRef.current = isOnline;
    if (cameOnline && activeView === "curator") {
      void loadCuratedPeople();
    }
  }, [activeView, isOnline, loadCuratedPeople]);

  const navigateToView = useCallback(
    (view: CloudForestView) => {
      if (activeView === view) return;

      const url = new URL(window.location.href);
      url.searchParams.delete("view");

      window.history.pushState(
        { ...window.history.state, cloudForestView: view },
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      if (view === "curator") setActiveCuratorLayer("Party");
      setActiveView(view);
    },
    [activeView],
  );

  useEffect(() => {
    const handleViewPopState = () => {
      const nextView: CloudForestView =
        window.history.state?.cloudForestView === "curator"
          ? "curator"
          : "timeline";
      if (nextView === "curator") setActiveCuratorLayer("Party");
      setActiveView(nextView);
      setPairingToken(
        new URL(window.location.href).searchParams.get("pairing"),
      );
    };
    window.addEventListener("popstate", handleViewPopState);
    return () => window.removeEventListener("popstate", handleViewPopState);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("view")) return;

    url.searchParams.delete("view");
    window.history.replaceState(
      { ...window.history.state, cloudForestView: "timeline" },
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

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
  const openAddWizard = (
    destination: "holding" | "party" | "tribe",
    slotIndex?: number,
  ) => {
    const destinationPeople =
      destination === "holding"
        ? holdingPeople
        : destination === "tribe"
          ? tribePeople
          : partyPeople;
    const capacity = destination === "tribe" ? 100 : 5;

    if (canEditCuratedPeople && destinationPeople.length < capacity) {
      const firstEmptySlot = Math.min(partyPeople.length, 4);
      focusTargetIdRef.current =
        destination === "party"
          ? `party-add-${(slotIndex ?? firstEmptySlot) + 1}`
          : null;
      setAddSubmission({ pending: false });
      setAddDestination(destination);
      setAddWizardOpen(true);
    }
  };
  const completeAdd = async (draft: CharacterDraft) => {
    if (!canEditCuratedPeople) {
      setAddSubmission({
        pending: false,
        error: "Adding a Character requires a connection.",
      });
      return false;
    }
    setAddSubmission({ pending: true });
    const result = await addCuratedPerson({
      firstName: draft.firstName,
      lastName: draft.lastName,
      nickname: draft.nickname,
      relationshipShape: draft.relationshipNote,
      privateDescription: draft.relationshipTitle,
      portraitUrl: draft.portraitUrl,
      placement: addDestination,
    });
    if (!result.ok) {
      setAddSubmission({ pending: false, error: curationErrorMessage(result) });
      return false;
    }
    focusTargetIdRef.current = `${addDestination}-${result.value.data.changedPersonId}`;
    setAddSubmission({ pending: false });
    setAddWizardOpen(false);
    return true;
  };
  const startConnection = async (person: CuratorPerson) => {
    setCharacterSubmission({ pending: true });
    const result = await createConnectionPairing(person.id);
    if (!result.ok) {
      setCharacterSubmission({ pending: false, error: result.message });
      return;
    }
    if (result.value.state === "already-connected") {
      setCharacterSubmission({
        pending: false,
        error: "Doh! You already have this connection.",
      });
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("pairing", result.value.token);
    url.searchParams.set("signup", result.value.signupCode);
    window.history.pushState(
      { ...window.history.state, cloudForestView: "curator" },
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    rememberPendingConnectionPairing(
      result.value.token,
      result.value.signupCode,
    );
    setCharacterSubmission({ pending: false });
    setPairingToken(result.value.token);
  };

  const closePairing = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("pairing");
    url.searchParams.delete("signup");
    window.history.pushState(
      { ...window.history.state, cloudForestView: "curator" },
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    clearPendingConnectionPairing();
    setActiveView("curator");
    setPairingToken(null);
    void loadCuratedPeople();
  };

  const completeReceive = async (draft: CareDraft) => {
    const result = await createCare({ ...draft, direction: "receive" });
    if (!result.ok) {
      return { ok: false as const, message: careErrorMessage(result) };
    }
    setReceiveWizardOpen(false);
    navigateToView("timeline");
    return { ok: true as const };
  };
  const completeGive = async (draft: CareDraft) => {
    const result = await createCare({ ...draft, direction: "give" });
    if (!result.ok) {
      return { ok: false as const, message: careErrorMessage(result) };
    }
    setGiveWizardOpen(false);
    navigateToView("timeline");
    return { ok: true as const };
  };
  const openReceiveWizard = () => {
    focusTargetIdRef.current = "receive";
    setReceiveWizardOpen(true);
  };
  const openTimelinePostComposer = () => {
    setTimelinePostComposerOpen(true);
  };
  const closeTimelinePostComposer = () => {
    setTimelinePostComposerOpen(false);
  };
  const openGiveWizard = (returnFocusSelector?: string) => {
    focusTargetIdRef.current =
      typeof returnFocusSelector === "string" ? returnFocusSelector : "give";
    setGiveWizardOpen(true);
  };

  const confirmCareClaim = async () => {
    if (careDestination?.kind !== "claim") {
      return {
        ok: false as const,
        message: "This Care is no longer available.",
      };
    }

    const result = await claimCare(careDestination.care.id);
    if (!result.ok) {
      return { ok: false as const, message: careErrorMessage(result) };
    }
    restoreFromCareDestination(
      `[data-care-claim-status="${careDestination.care.id}"]`,
    );
    rewindCareHistory();
    return { ok: true as const };
  };

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
      if (focusTargetId.startsWith("[")) {
        document.querySelector<HTMLButtonElement>(focusTargetId)?.focus();
        return;
      }

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

  const durableCareRecords = caresState.cares;
  const durableCares = durableCareRecords.filter((care) =>
    isActiveCareStatus(care.status),
  );
  const passableCareIds = useMemo(
    () =>
      new Set(
        durableCares
          .filter(
            (care) =>
              care.status === "open" && care.originator.id !== careViewerId,
          )
          .map((care) => care.id),
      ),
    [careViewerId, durableCares],
  );
  const durableCareError: TimelineError | undefined =
    caresState.status === "error"
      ? {
          code: caresState.errorCode,
          message: caresState.message,
        }
      : undefined;
  if (pairingToken) {
    return (
      <ConnectionPairingView onClose={closePairing} token={pairingToken} />
    );
  }

  return (
    <main
      className="cloud-forest-app"
      data-active-view={activeView}
      data-curator-layer={
        activeView === "curator" ? currentCuratorLayer : undefined
      }
      data-receive-open={receiveWizardOpen}
      data-give-open={giveWizardOpen}
      data-timeline-post-open={timelinePostComposerOpen}
      data-care-destination={
        careWithdrawal
          ? "withdrawal"
          : careGratitude
            ? "gratitude"
            : careDestination?.kind
      }
    >
      <div
        className="timeline-chrome timeline-chrome--top global-view-chrome"
        data-hidden={chromeHidden}
        onFocusCapture={revealChrome}
      >
        <header className="party-header timeline-header">
          <button
            aria-label={
              profileIsOffline ? "Open My Care (offline)" : "Open My Care"
            }
            className="party-self global-view-self"
            data-my-care-trigger="timeline"
            title={
              profileIsOffline ? "Offline — showing cached data" : undefined
            }
            onClick={() =>
              openCareDestination(
                { kind: "my-care", initialTab: "profile" },
                '[data-my-care-trigger="timeline"]',
              )
            }
            type="button"
          >
            {profileIsOffline ? (
              <CloudOff aria-hidden="true" className="size-7 text-amber-100" />
            ) : (
              <Portrait
                initials={currentUser.initials}
                personId={currentUser.id}
                showInitials
                small
              />
            )}
          </button>
          <h1>
            {activeView === "timeline" ? "Timeline" : currentCuratorLayer}
          </h1>
          <div className="global-view-tools">
            {activeView === "curator" && activeCuratorLayerCount ? (
              <span
                aria-label={`${currentCuratorLayer} count`}
                className="global-view-layer-count"
              >
                {activeCuratorLayerCount}
              </span>
            ) : null}
            <ViewSwitcher
              activeView={activeView}
              onViewChange={navigateToView}
            />
          </div>
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
        <CareWizard
          direction="receive"
          onCancel={() => setReceiveWizardOpen(false)}
          onComplete={completeReceive}
        />
      ) : giveWizardOpen ? (
        <CareWizard
          direction="give"
          onCancel={() => setGiveWizardOpen(false)}
          onComplete={completeGive}
        />
      ) : (
        <>
          <div
            aria-hidden={
              careDestination || careGratitude || careWithdrawal
                ? true
                : undefined
            }
            inert={
              careDestination || careGratitude || careWithdrawal
                ? true
                : undefined
            }
          >
            {activeView === "timeline" ? (
              <TimelineView
                cacheOwnerId={currentPersonId}
                onOfflineChange={setTimelineApiOffline}
                cares={durableCares}
                careError={durableCareError}
                offline={deviceIsOffline}
                postComposerOpen={timelinePostComposerOpen}
                onClosePostComposer={closeTimelinePostComposer}
                onOpenCareDetails={(care) =>
                  openCareDestination(
                    { kind: "detail", careId: care.id },
                    `[data-care-detail-action="${care.id}"]`,
                  )
                }
                onCommitToCare={(care) =>
                  openCareDestination(
                    { kind: "claim", care },
                    `[data-care-claim-action="${care.id}"]`,
                  )
                }
                onRecordCompleted={recordCareCompleted}
                onRecordNotCompleted={setCareWithdrawal}
                onPass={handlePassCare}
                onWithdraw={(careId) =>
                  void withdrawCare(careId, {
                    statementId: "meal-something-changed",
                    message: "",
                  })
                }
                viewerId={careViewerId}
                passableCareIds={passableCareIds}
                passAnnouncement={carePassAnnouncement}
              />
            ) : (
              <CuratorView
                addDestination={addDestination}
                addSubmission={addSubmission}
                addWizardOpen={addWizardOpen}
                activeCares={durableCares}
                careViewerId={careViewerId}
                characterSubmission={characterSubmission}
                curatedPeopleCached={curatedPeople.source === "cache"}
                curatedPeopleOffline={curatorIsOffline}
                curatedPeopleStatus={curatedPeople.status}
                curatedPeopleError={
                  curatedPeople.status === "error"
                    ? curatedPeople.message
                    : undefined
                }
                initialSelection={curatorSelection}
                onAddCharacter={openAddWizard}
                onBlockCharacter={blockCharacter}
                onCancelAdd={() => setAddWizardOpen(false)}
                onCompleteAdd={completeAdd}
                onDeleteCharacter={deleteCharacter}
                onEndConnection={endConnection}
                onRetryCuratedPeople={() => void loadCuratedPeople()}
                onGive={openGiveWizard}
                onUpdateCharacter={updateCharacter}
                onActiveLayerChange={setActiveCuratorLayer}
                onSelectionChange={setCuratorSelection}
                onCommitToCare={(care) =>
                  openCareDestination(
                    { kind: "claim", care },
                    `[data-care-claim-action="${care.id}"]`,
                  )
                }
                onPass={handlePassCare}
                onRecordCompleted={recordCareCompleted}
                onRecordNotCompleted={setCareWithdrawal}
                onReceive={openReceiveWizard}
                onStartConnection={startConnection}
                onUnblockCharacter={unblockCharacter}
                onWithdraw={() => undefined}
                blockedPeople={blockedPeople}
                partyPeople={partyPeople}
                holdingPeople={holdingPeople}
                tribePeople={tribePeople}
              />
            )}
          </div>
          {careWithdrawal ? (
            <CareWithdrawalWizard
              onBack={() => setCareWithdrawal(null)}
              onComplete={saveCareWithdrawal}
              care={careWithdrawal}
              viewerId={careViewerId}
            />
          ) : careGratitude ? (
            <CareGratitudeWizard
              onBack={skipCareGratitude}
              onComplete={saveCareGratitude}
              onSkip={skipCareGratitude}
              care={careGratitude}
            />
          ) : careDestination?.kind === "detail" ? (
            <CareDetailView
              care={durableCares.find(
                (care) => care.id === careDestination.careId,
              )}
              onBack={backFromCareDestination}
              viewerId={careViewerId}
            />
          ) : careDestination?.kind === "claim" ? (
            <ClaimCareView
              onBack={backFromCareDestination}
              onConfirm={confirmCareClaim}
              care={careDestination.care}
            />
          ) : careDestination?.kind === "my-care" ? (
            <MyCareView
              initialTab={careDestination.initialTab}
              cares={caresState.cares}
              viewerDisplayName={displayName}
              onBack={backFromCareDestination}
              isAdmin={role === "admin"}
              onCreateSignupCode={onCreateSignupCode}
              onRecordCompleted={recordCareCompleted}
              onRecordNotCompleted={setCareWithdrawal}
              onWithdraw={(careId) =>
                void withdrawCare(careId, {
                  statementId: "meal-something-changed",
                  message: "",
                })
              }
              onSignOut={onSignOut}
              viewerId={careViewerId}
              signOutError={signOutError}
              signingOut={signingOut}
            />
          ) : null}
        </>
      )}
      {!receiveWizardOpen &&
      !giveWizardOpen &&
      !careDestination &&
      !careGratitude &&
      !careWithdrawal &&
      activeView === "timeline" ? (
        <div
          className="timeline-chrome timeline-chrome--bottom"
          data-hidden={chromeHidden}
          onFocusCapture={revealChrome}
        >
          <PartyActions
            activeView={activeView}
            onAdd={() => openAddWizard("party")}
            onGive={openGiveWizard}
            onReceive={openReceiveWizard}
            onWrite={openTimelinePostComposer}
          />
        </div>
      ) : null}
    </main>
  );
}
