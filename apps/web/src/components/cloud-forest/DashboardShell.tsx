import { CloudOff, Gift, HandHeart } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitials, curatorUser } from "@/data/cloudForest";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { CuratorView } from "./CuratorView";
import { ConnectionPairingView } from "./ConnectionPairingView";
import { createConnectionPairing } from "./connectionPairingClient";
import {
  blockCuratedPerson,
  endConnection as endCharacterConnection,
  unblockCuratedPerson,
} from "./relationshipExitClient";
import type { AddPartyMemberDraft } from "./AddPartyMemberWizard";
import {
  curationErrorMessage,
  curatedPersonToCuratorPerson,
  useCuratedPeople,
  type CuratedPersonApiClient,
} from "./useCuratedPeople";
import {
  careGratitudeErrorMessage,
  careRequestErrorMessage,
  useCareRequests,
  type CareRequestApiClient,
} from "./useCareRequests";
import {
  careOfferErrorMessage,
  useCareOffers,
  type CareOfferApiClient,
} from "./useCareOffers";
import { PartyAction, PartyActions, Portrait } from "./PartyLayer";
import { TimelineView } from "./TimelineView";
import type { TimelineError } from "./TimelinePanel";
import { type CloudForestView, ViewSwitcher } from "./ViewSwitcher";
import type { CuratorLayerLabel } from "./curatorLayerStyles";
import { ReceiveCareWizard, type ReceiveCareDraft } from "./ReceiveCareWizard";
import { GiveCareWizard, type GiveCareDraft } from "./GiveCareWizard";
import { ClaimCareView } from "./ClaimCareView";
import {
  CareGratitudeWizard,
  type CareGratitudeDraft,
  type CareGratitudeResult,
} from "./CareGratitudeWizard";
import { MyCareView, type MyCareTab } from "./MyCareView";
import {
  clearPendingConnectionPairing,
  rememberPendingConnectionPairing,
} from "@/lib/pendingConnectionPairing";

type CareDestination =
  | { kind: "claim"; request: ReceiveCareRequest }
  | {
      kind: "my-care";
      initialTab?: MyCareTab;
    };

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

export type { CuratedPersonApiClient } from "./useCuratedPeople";
export type { CareRequestApiClient } from "./useCareRequests";
export type { CareOfferApiClient } from "./useCareOffers";

export function DashboardShell({
  apiClient,
  careApiClient,
  careOfferApiClient,
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
  careApiClient?: CareRequestApiClient;
  careOfferApiClient?: CareOfferApiClient;
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
      ...curatorUser,
      displayName,
      id: currentPersonId,
      initials: createInitials(displayName),
    }),
    [currentPersonId, displayName],
  );
  const {
    claim: claimCareRequest,
    complete: completeCareRequest,
    create: createCareRequest,
    load: loadCareRequests,
    pass: passCareRequest,
    recordGratitude: recordCareGratitude,
    state: durableCareRequestsState,
  } = useCareRequests(careApiClient, careViewerId);
  const {
    claim: claimCareOffer,
    create: createCareOffer,
    load: loadCareOffers,
    pass: passCareOffer,
    state: careOffersState,
    withdraw: withdrawCareOffer,
  } = useCareOffers(careOfferApiClient);
  const [careDestination, setCareDestination] =
    useState<CareDestination | null>(null);
  const [careGratitudeRequest, setCareGratitudeRequest] =
    useState<ReceiveCareRequest | null>(null);
  const [carePassAnnouncement, setCarePassAnnouncement] = useState<string>();
  const carePassAnnouncementTimeoutRef = useRef<number | undefined>(undefined);
  const {
    add: addCuratedPerson,
    blockedPeople,
    holdingPeople,
    load: loadCuratedPeople,
    remove: removeCuratedPerson,
    partyPeople,
    people: curatedPeople,
    tribePeople,
    update: updateCuratedPerson,
  } = useCuratedPeople(apiClient, activeView === "curator", currentPersonId);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );
  const [timelineApiOffline, setTimelineApiOffline] = useState(false);
  const deviceIsOffline = sessionOffline || !isOnline;
  const appIsOffline =
    deviceIsOffline || (activeView === "timeline" && timelineApiOffline);
  const wasOnlineRef = useRef(isOnline);
  useEffect(
    () => () => {
      if (carePassAnnouncementTimeoutRef.current !== undefined) {
        window.clearTimeout(carePassAnnouncementTimeoutRef.current);
      }
    },
    [],
  );
  const [addSubmission, setAddSubmission] = useState<{
    pending: boolean;
    error?: string;
  }>({ pending: false });
  const [addDestination, setAddDestination] = useState<
    "holding" | "party" | "tribe"
  >("party");
  const [characterSubmission, setCharacterSubmission] = useState<{
    pending: boolean;
    error?: string;
  }>({ pending: false });
  const focusTargetIdRef = useRef<string | null>(null);
  const careReturnFocusSelectorRef = useRef<string | null>(null);
  const careReturnScrollYRef = useRef(0);
  const ignoreNextCarePopStateRef = useRef(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const lastScrollY = useRef(0);
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
  const completeAdd = async (draft: AddPartyMemberDraft) => {
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
  const updateCharacter = async (
    person: CuratorPerson,
    update: {
      firstName: string;
      lastName: string;
      nickname: string;
      placement: "holding" | "party" | "tribe";
      privateDescription: string;
      portraitUrl?: string;
      relationshipShape: string;
    },
  ) => {
    if (person.version === undefined || !canEditCuratedPeople) return null;
    setCharacterSubmission({ pending: true });
    const result = await updateCuratedPerson(person.id, {
      ...update,
      expectedVersion: person.version,
    });
    if (!result.ok) {
      setCharacterSubmission({
        pending: false,
        error: curationErrorMessage(result),
      });
      return null;
    }
    setCharacterSubmission({ pending: false });
    const updatedPerson = result.value.data.people.find(
      (candidate) => candidate.id === person.id,
    );
    return updatedPerson ? curatedPersonToCuratorPerson(updatedPerson) : null;
  };

  const deleteCharacter = async (person: CuratorPerson) => {
    if (person.version === undefined || !canEditCuratedPeople) {
      setCharacterSubmission({
        pending: false,
        error:
          "Your private Characters are unavailable right now. Try again when you’re back online.",
      });
      return false;
    }
    setCharacterSubmission({ pending: true });
    const result = await removeCuratedPerson(person.id, {
      expectedVersion: person.version,
    });
    if (!result.ok) {
      setCharacterSubmission({
        pending: false,
        error: curationErrorMessage(result),
      });
      return false;
    }
    setCharacterSubmission({ pending: false });
    return true;
  };

  const endConnection = async (
    person: CuratorPerson,
    deleteLocalCharacter: boolean,
  ) => {
    if (!canEditCuratedPeople) {
      setCharacterSubmission({
        pending: false,
        error:
          "Your private relationships are unavailable right now. Try again when you’re back online.",
      });
      return false;
    }
    setCharacterSubmission({ pending: true });
    const result = await endCharacterConnection(
      person.id,
      deleteLocalCharacter,
    );
    if (!result.ok) {
      setCharacterSubmission({ pending: false, error: result.message });
      return false;
    }
    setCharacterSubmission({ pending: false });
    await loadCuratedPeople();
    return true;
  };

  const blockCharacter = async (person: CuratorPerson) => {
    if (!canEditCuratedPeople) {
      setCharacterSubmission({
        pending: false,
        error:
          "Your private relationships are unavailable right now. Try again when you’re back online.",
      });
      return false;
    }
    setCharacterSubmission({ pending: true });
    const result = await blockCuratedPerson(person.id);
    if (!result.ok) {
      setCharacterSubmission({ pending: false, error: result.message });
      return false;
    }
    setCharacterSubmission({ pending: false });
    await loadCuratedPeople();
    return true;
  };

  const unblockCharacter = async (person: CuratorPerson) => {
    const blockedUserId = person.blockedUserId ?? person.linkedUserId;
    if (!blockedUserId || !canEditCuratedPeople) {
      setCharacterSubmission({
        pending: false,
        error: "This relationship is no longer available.",
      });
      return false;
    }
    setCharacterSubmission({ pending: true });
    const result = await unblockCuratedPerson(person.id, blockedUserId);
    if (!result.ok) {
      setCharacterSubmission({ pending: false, error: result.message });
      return false;
    }
    setCharacterSubmission({ pending: false });
    await loadCuratedPeople();
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

  const completeReceive = async (draft: ReceiveCareDraft) => {
    const result = await createCareRequest(draft);
    if (!result.ok) {
      return { ok: false as const, message: careRequestErrorMessage(result) };
    }
    setReceiveWizardOpen(false);
    navigateToView("timeline");
    return { ok: true as const };
  };
  const completeGive = async (draft: GiveCareDraft) => {
    const result = await createCareOffer(draft);
    if (!result.ok) {
      return { ok: false as const, message: careOfferErrorMessage(result) };
    }
    setGiveWizardOpen(false);
    navigateToView("timeline");
    return { ok: true as const };
  };
  const announceCarePass = () => {
    setCarePassAnnouncement(
      "Passed privately. This Care won’t appear again unless your relationship layer changes.",
    );
    if (carePassAnnouncementTimeoutRef.current !== undefined) {
      window.clearTimeout(carePassAnnouncementTimeoutRef.current);
    }
    carePassAnnouncementTimeoutRef.current = window.setTimeout(() => {
      setCarePassAnnouncement(undefined);
      carePassAnnouncementTimeoutRef.current = undefined;
    }, 5_000);
  };
  const claimGiveOffer = async (offerId: string) => {
    const result = await claimCareOffer(offerId);
    if (result.ok) {
      await loadCareRequests();
    }
  };
  const handlePassCareRequest = async (request: ReceiveCareRequest) => {
    const result = await passCareRequest(request.id);
    if (result.ok) {
      announceCarePass();
    }
  };
  const handlePassCareOffer = async (offer: GiveCareOffer) => {
    const result = await passCareOffer(offer.id);
    if (result.ok) {
      announceCarePass();
    }
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

  const openCareDestination = (
    destination: CareDestination,
    returnFocusSelector: string,
  ) => {
    careReturnFocusSelectorRef.current = returnFocusSelector;
    careReturnScrollYRef.current = window.scrollY;
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
      setChromeHidden(false);
      setCareDestination(returnToMyCare ? { kind: "my-care" } : null);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, careReturnScrollYRef.current);
          if (focusSelector) {
            document.querySelector<HTMLElement>(focusSelector)?.focus();
          }
        });
      });
    },
    [],
  );

  const rewindCareHistory = useCallback(() => {
    ignoreNextCarePopStateRef.current = true;
    window.history.back();
    window.setTimeout(() => {
      window.scrollTo(0, careReturnScrollYRef.current);
      ignoreNextCarePopStateRef.current = false;
    }, 100);
  }, []);

  const backFromCareDestination = useCallback(() => {
    restoreFromCareDestination(careReturnFocusSelectorRef.current);
    rewindCareHistory();
  }, [restoreFromCareDestination, rewindCareHistory]);

  const confirmCareClaim = async () => {
    if (careDestination?.kind !== "claim") {
      return {
        ok: false as const,
        message: "This Care request is no longer available.",
      };
    }

    const result = await claimCareRequest(careDestination.request.id);
    if (!result.ok) {
      return { ok: false as const, message: careRequestErrorMessage(result) };
    }
    restoreFromCareDestination(
      `[data-care-claim-status="${careDestination.request.id}"]`,
    );
    rewindCareHistory();
    return { ok: true as const };
  };

  const recordCareCompleted = async (request: ReceiveCareRequest) => {
    const result = await completeCareRequest(request.id);
    if (
      result.ok &&
      request.requester.id === careViewerId &&
      request.gratitude === undefined
    ) {
      setCareGratitudeRequest(request);
    }
  };

  const skipCareGratitude = () => {
    setCareGratitudeRequest(null);
  };

  const saveCareGratitude = async (
    draft: CareGratitudeDraft,
  ): Promise<CareGratitudeResult> => {
    if (!careGratitudeRequest) {
      return { ok: false, message: "Care is no longer available." };
    }
    const result = await recordCareGratitude(careGratitudeRequest.id, draft);
    if (!result.ok) {
      return { ok: false, message: careGratitudeErrorMessage(result) };
    }
    setCareGratitudeRequest(null);
    return { ok: true };
  };

  useEffect(() => {
    if (!careDestination) return;

    const handlePopState = () => {
      if (ignoreNextCarePopStateRef.current) {
        ignoreNextCarePopStateRef.current = false;
        return;
      }
      restoreFromCareDestination(careReturnFocusSelectorRef.current);
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

  useEffect(() => {
    void loadCareRequests();
    void loadCareOffers();
  }, [activeView, careDestination?.kind, loadCareOffers, loadCareRequests]);

  const durableCareRequestRecords = durableCareRequestsState.requests;
  const durableCareRequests = durableCareRequestRecords.filter(
    (request) => request.status === "open" || request.status === "claimed",
  );
  const durableCompletedRequests = durableCareRequestRecords.filter(
    (request) => request.status === "completed",
  );
  const durableExpiredRequests = durableCareRequestRecords.filter(
    (request) => request.status === "expired",
  );
  const durableClaimedRequestIds = useMemo(
    () =>
      new Set(
        durableCareRequests
          .filter((request) => request.status === "claimed")
          .map((request) => request.id),
      ),
    [durableCareRequests],
  );
  const durableClaimedRequests = useMemo(
    () =>
      durableCareRequests.filter(
        (request) => request.claimant?.id === careViewerId,
      ),
    [careViewerId, durableCareRequests],
  );
  const durableSelfProfileRequests = useMemo(
    () =>
      durableCareRequests.filter(
        (request) => request.requester.id === careViewerId,
      ),
    [careViewerId, durableCareRequests],
  );
  const durableViewerClaimedRequestIds = useMemo(
    () => new Set(durableClaimedRequests.map((request) => request.id)),
    [durableClaimedRequests],
  );
  const durableViewerCompletedRequestIds = useMemo(
    () =>
      new Set(
        durableCareRequests
          .filter((request) =>
            request.requester.id === careViewerId
              ? request.requesterCompletedAt !== undefined
              : request.claimant?.id === careViewerId &&
                request.claimantCompletedAt !== undefined,
          )
          .map((request) => request.id),
      ),
    [careViewerId, durableCareRequests],
  );
  const durableOtherParticipantCompletedRequestIds = useMemo(
    () =>
      new Set(
        durableCareRequests
          .filter((request) =>
            request.requester.id === careViewerId
              ? request.claimantCompletedAt !== undefined
              : request.claimant?.id === careViewerId &&
                request.requesterCompletedAt !== undefined,
          )
          .map((request) => request.id),
      ),
    [careViewerId, durableCareRequests],
  );
  const durableViewerCareOffers = useMemo(
    () =>
      careOffersState.offers.filter(
        (offer) =>
          offer.giver.id === careViewerId && offer.status === "available",
      ),
    [careOffersState.offers, careViewerId],
  );
  const durableExpiredCareOffers = useMemo(
    () =>
      careOffersState.offers.filter(
        (offer) =>
          offer.giver.id === careViewerId && offer.status === "expired",
      ),
    [careOffersState.offers, careViewerId],
  );
  const passableRequestIds = useMemo(
    () =>
      new Set(
        durableCareRequests
          .filter(
            (request) =>
              request.status === "open" &&
              request.requester.id !== careViewerId,
          )
          .map((request) => request.id),
      ),
    [careViewerId, durableCareRequests],
  );
  const passableOfferIds = useMemo(
    () =>
      new Set(
        careOffersState.offers
          .filter(
            (offer) =>
              offer.status === "available" && offer.giver.id !== careViewerId,
          )
          .map((offer) => offer.id),
      ),
    [careOffersState.offers, careViewerId],
  );
  const durableCareError: TimelineError | undefined =
    durableCareRequestsState.status === "error"
      ? {
          code: durableCareRequestsState.errorCode,
          message: durableCareRequestsState.message,
        }
      : careOffersState.status === "error"
        ? {
            code: careOffersState.errorCode,
            message: careOffersState.message,
          }
        : undefined;
  const durableCareOfferStatusMessage =
    careOffersState.status === "error" ? careOffersState.message : undefined;
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
        careGratitudeRequest ? "gratitude" : careDestination?.kind
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
        <ReceiveCareWizard
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
            aria-hidden={
              careDestination || careGratitudeRequest ? true : undefined
            }
            inert={careDestination || careGratitudeRequest ? true : undefined}
          >
            {activeView === "timeline" ? (
              <TimelineView
                cacheOwnerId={currentPersonId}
                onOfflineChange={setTimelineApiOffline}
                careOffers={careOffersState.offers.filter(
                  (offer) => offer.status === "available",
                )}
                careGratitudes={[]}
                careGratitudeRequests={durableCareRequests}
                careRequests={durableCareRequests}
                careError={durableCareError}
                offline={deviceIsOffline}
                postComposerOpen={timelinePostComposerOpen}
                onClosePostComposer={closeTimelinePostComposer}
                claimedRequestIds={durableClaimedRequestIds}
                onOfferHelp={(request) =>
                  openCareDestination(
                    { kind: "claim", request },
                    `[data-care-claim-action="${request.id}"]`,
                  )
                }
                onClaimOffer={(offerId) => void claimGiveOffer(offerId)}
                onPassOffer={(offer) => void handlePassCareOffer(offer)}
                onRecordCompleted={recordCareCompleted}
                onPass={handlePassCareRequest}
                onWithdrawOffer={(offerId) => void withdrawCareOffer(offerId)}
                viewerClaimedRequestIds={durableViewerClaimedRequestIds}
                viewerCompletedRequestIds={durableViewerCompletedRequestIds}
                otherParticipantCompletedRequestIds={
                  durableOtherParticipantCompletedRequestIds
                }
                viewerId={careViewerId}
                passableRequestIds={passableRequestIds}
                passableOfferIds={passableOfferIds}
                passAnnouncement={carePassAnnouncement}
              />
            ) : (
              <CuratorView
                addDestination={addDestination}
                addSubmission={addSubmission}
                addWizardOpen={addWizardOpen}
                activeCareRequests={durableCareRequests}
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
                onAddPartyMember={openAddWizard}
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
                onOfferHelp={(request) =>
                  openCareDestination(
                    { kind: "claim", request },
                    `[data-care-claim-action="${request.id}"]`,
                  )
                }
                onPass={handlePassCareRequest}
                onRecordCompleted={recordCareCompleted}
                onRecordNotCompleted={() => undefined}
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
          {careGratitudeRequest ? (
            <CareGratitudeWizard
              onBack={skipCareGratitude}
              onComplete={saveCareGratitude}
              onSkip={skipCareGratitude}
              request={careGratitudeRequest}
            />
          ) : careDestination?.kind === "claim" ? (
            <ClaimCareView
              onBack={backFromCareDestination}
              onConfirm={confirmCareClaim}
              request={careDestination.request}
            />
          ) : careDestination?.kind === "my-care" ? (
            <MyCareView
              initialTab={careDestination.initialTab}
              activeRequests={durableSelfProfileRequests}
              claimedRequests={durableClaimedRequests}
              completedRequests={durableCompletedRequests}
              expiredRequests={durableExpiredRequests}
              offers={durableViewerCareOffers}
              expiredOffers={durableExpiredCareOffers}
              careOfferStatusMessage={durableCareOfferStatusMessage}
              viewerDisplayName={displayName}
              onBack={backFromCareDestination}
              isAdmin={role === "admin"}
              onCreateSignupCode={onCreateSignupCode}
              onRecordCompleted={recordCareCompleted}
              onWithdrawOffer={(offerId) => void withdrawCareOffer(offerId)}
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
      !careGratitudeRequest &&
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
