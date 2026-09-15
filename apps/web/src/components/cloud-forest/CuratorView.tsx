import { Cloud, CloudOff, RadioTower, UsersRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  CarePersonId,
  ReceiveCareRequest,
} from "@/types/careRequest";
import {
  hasActiveConnection,
  type CuratorPerson,
  type CuratorSelection,
} from "@/types/curator";

import {
  AddPartyMemberWizard,
  type AddPartyMemberDraft,
} from "./AddPartyMemberWizard";
import { CuratorDetailView } from "./CuratorDetailView";
import {
  layerBackgrounds,
  layerOuterBackgrounds,
  type CuratorLayerLabel,
} from "./curatorLayerStyles";
import { GuildsLayer } from "./GuildsLayer";
import { HoldingLayer } from "./HoldingLayer";
import { PartyActions, PartyLayer, Portrait } from "./PartyLayer";
import { SignalsLayer } from "./SignalsLayer";
import { TribeLayer } from "./TribeLayer";

type CuratorLayerSectionProps = {
  addDisabled: boolean;
  careActionsDisabled?: boolean;
  children: React.ReactNode;
  count?: string;
  curatedPeopleOffline: boolean;
  label: CuratorLayerLabel;
  nextLayer?: "Party" | "Tribe" | "Guilds" | "Signals";
  onAddPartyMember: () => void;
  onGive: (returnFocusSelector?: string) => void;
  onNavigateToTimeline: () => void;
  onOpenMyCare: (returnFocusSelector: string) => void;
  onReceive: () => void;
  user: CuratorPerson;
};

type CuratorViewProps = {
  addDestination: "holding" | "party" | "tribe";
  addSubmission: { pending: boolean; error?: string };
  addWizardOpen: boolean;
  activeCareRequests: ReceiveCareRequest[];
  careViewerId: CarePersonId;
  characterSubmission: { pending: boolean; error?: string };
  curatedPeopleStatus: "loading" | "ready" | "error";
  curatedPeopleError?: string;
  curatedPeopleCached: boolean;
  curatedPeopleOffline: boolean;
  onAddPartyMember: (
    destination: "holding" | "party" | "tribe",
    slotIndex?: number,
  ) => void;
  onBlockCharacter: (person: CuratorPerson) => Promise<boolean>;
  onCancelAdd: () => void;
  onCompleteAdd: (
    draft: AddPartyMemberDraft,
  ) => void | boolean | Promise<void | boolean>;
  onDeleteCharacter: (person: CuratorPerson) => Promise<boolean>;
  onEndConnection: (
    person: CuratorPerson,
    deleteCharacter: boolean,
  ) => Promise<boolean>;
  onRetryCuratedPeople: () => void;
  onGive: (returnFocusSelector?: string) => void;
  onUpdateCharacter: (
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
  ) => Promise<CuratorPerson | null>;
  onNavigateToTimeline: () => void;
  onOpenMyCare: (returnFocusSelector: string) => void;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onRecordCompleted: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted: (request: ReceiveCareRequest) => void;
  onReceive: () => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
  onStartConnection: (person: CuratorPerson) => Promise<void>;
  onUnblockCharacter: (person: CuratorPerson) => Promise<boolean>;
  onWithdraw: (requestId: string) => void;
  partyPeople: CuratorPerson[];
  blockedPeople: CuratorPerson[];
  holdingPeople: CuratorPerson[];
  tribePeople: CuratorPerson[];
  user: CuratorPerson;
};

const curatorLayerPositions = {
  holding: 0,
  party: 1,
  tribe: 2,
} as const;

function LayerContinuation({
  nextLayer,
}: {
  nextLayer: NonNullable<CuratorLayerSectionProps["nextLayer"]>;
}) {
  const Icon = nextLayer === "Signals" ? RadioTower : UsersRound;
  const tone =
    nextLayer === "Signals" ? "text-cyan-100/70" : "text-lime-100/65";

  return (
    <div
      aria-label={`Continue to ${nextLayer}`}
      className={`mt-3 grid grid-cols-[1fr_auto_auto_1fr] items-center gap-2 ${tone}`}
    >
      <span className="h-px bg-current/30" />
      <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
      <strong className="text-sm font-medium">{nextLayer}</strong>
      <span className="h-px bg-current/30" />
    </div>
  );
}

function CuratorLayerSection({
  children,
  addDisabled,
  careActionsDisabled = false,
  count,
  curatedPeopleOffline,
  label,
  nextLayer,
  onAddPartyMember,
  onGive,
  onNavigateToTimeline,
  onOpenMyCare,
  onReceive,
  user,
}: CuratorLayerSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.55 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={sectionRef}
      aria-label={`${label} layer`}
      className={cn(
        "h-[100svh] snap-start snap-always px-4 pb-2 pt-4 transition-[opacity,transform] duration-500 ease-out sm:px-4 sm:pb-4",
        layerOuterBackgrounds[label],
        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-75",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
      )}
    >
      <section
        className={cn(
          "relative mx-auto flex h-full w-full max-w-3xl flex-col overflow-visible rounded-[2rem] border px-4 pb-4 pt-1 shadow-2xl shadow-black/35 sm:px-8 sm:pb-8 sm:pt-2",
          layerBackgrounds[label],
        )}
      >
        <header
          className={cn(
            "grid items-center gap-2 pb-4",
            count
              ? "grid-cols-[3rem_minmax(0,1fr)_auto_auto]"
              : "grid-cols-[3rem_minmax(0,1fr)_auto]",
          )}
        >
          <button
            aria-label={
              curatedPeopleOffline ? "Open My Care (offline)" : "Open My Care"
            }
            className="party-self"
            data-my-care-trigger={`curator-${label.toLowerCase()}`}
            title={
              curatedPeopleOffline ? "Offline — showing cached data" : undefined
            }
            onClick={() =>
              onOpenMyCare(
                `[data-my-care-trigger="curator-${label.toLowerCase()}"]`,
              )
            }
            type="button"
          >
            {curatedPeopleOffline ? (
              <CloudOff aria-hidden="true" className="size-7 text-amber-100" />
            ) : (
              <Portrait
                initials={user.initials}
                personId={user.id}
                showInitials
                small
              />
            )}
          </button>
          <h1 className="min-w-0 truncate text-3xl font-medium tracking-tight sm:text-4xl">
            {label}
          </h1>
          {count ? (
            <span className="rounded-full border border-current/20 bg-black/10 px-2.5 py-1 text-xs font-medium text-current/80 sm:text-sm">
              {count}
            </span>
          ) : null}
          <button
            aria-label="Go to Timeline"
            className="flex items-center gap-1 text-xs font-medium text-current/75 transition hover:text-current focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current sm:text-sm"
            onClick={onNavigateToTimeline}
            type="button"
          >
            <Cloud aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <PartyActions
          activeView="curator"
          addDisabled={addDisabled}
          careActionsDisabled={careActionsDisabled}
          onAdd={onAddPartyMember}
          onGive={() =>
            onGive(`[aria-label="${label} layer"] [data-party-action="give"]`)
          }
          onReceive={onReceive}
        />
        {nextLayer ? <LayerContinuation nextLayer={nextLayer} /> : null}
      </section>
    </article>
  );
}

export function CuratorView({
  addDestination,
  addSubmission,
  addWizardOpen,
  activeCareRequests,
  careViewerId,
  characterSubmission,
  curatedPeopleCached,
  curatedPeopleError,
  curatedPeopleOffline,
  curatedPeopleStatus,
  onAddPartyMember,
  onBlockCharacter,
  onCancelAdd,
  onCompleteAdd,
  onDeleteCharacter,
  onEndConnection,
  onRetryCuratedPeople,
  onGive,
  onUpdateCharacter,
  onNavigateToTimeline,
  onOpenMyCare,
  onOfferHelp,
  onPass,
  onRecordCompleted,
  onRecordNotCompleted,
  onReceive,
  onSetRequestMinimized,
  onStartConnection,
  onUnblockCharacter,
  onWithdraw,
  partyPeople,
  blockedPeople,
  holdingPeople,
  tribePeople,
  user,
}: CuratorViewProps) {
  const [selection, setSelection] = useState<CuratorSelection | null>(null);
  const [holdingTab, setHoldingTab] = useState<"characters" | "blocks">(
    "characters",
  );
  const triggerIdRef = useRef<string | null>(null);
  const restoreLayerRef = useRef<
    keyof typeof curatorLayerPositions | undefined
  >(undefined);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);
  const partyHasConnection = partyPeople.some(hasActiveConnection);
  const tribeHasConnection = tribePeople.some(hasActiveConnection);
  const addDisabled = curatedPeopleOffline || curatedPeopleStatus !== "ready";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.clientHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const restoreCurator = useCallback(
    (targetLayer?: keyof typeof curatorLayerPositions) => {
      setSelection(null);

      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            targetLayer === undefined
              ? scrollPositionRef.current
              : curatorLayerPositions[targetLayer] *
                scrollContainerRef.current.clientHeight;
        }
        if (triggerIdRef.current) {
          const trigger = document.querySelector<HTMLButtonElement>(
            `[data-curator-tile="${triggerIdRef.current}"]`,
          );
          trigger?.focus();
        }
      });
    },
    [],
  );

  const handleSelect = useCallback(
    (nextSelection: CuratorSelection, trigger: HTMLButtonElement) => {
      scrollPositionRef.current = scrollContainerRef.current?.scrollTop ?? 0;
      triggerIdRef.current = trigger.dataset.curatorTile ?? null;
      window.history.pushState(
        { ...window.history.state, curatorSelection: true },
        "",
      );
      setSelection(nextSelection);
    },
    [],
  );

  const handleBack = useCallback(() => {
    restoreLayerRef.current = undefined;
    restoreCurator();
    window.history.back();
  }, [restoreCurator]);

  const handleBackToLayer = useCallback(
    (
      targetLayer: keyof typeof curatorLayerPositions,
      targetHoldingTab: "characters" | "blocks" = "characters",
    ) => {
      restoreLayerRef.current = targetLayer;
      setHoldingTab(targetHoldingTab);
      restoreCurator(targetLayer);
      window.history.back();
    },
    [restoreCurator],
  );

  useEffect(() => {
    if (!selection) {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.curatorSelection) return;
      const targetLayer = restoreLayerRef.current;
      restoreLayerRef.current = undefined;
      restoreCurator(targetLayer);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleBack, restoreCurator, selection]);

  if (addWizardOpen) {
    return (
      <AddPartyMemberWizard
        destination={
          addDestination === "holding"
            ? "Holding"
            : addDestination === "tribe"
              ? "Tribe"
              : "Party"
        }
        errorMessage={addSubmission.error}
        isSubmitting={addSubmission.pending}
        onCancel={onCancelAdd}
        onComplete={onCompleteAdd}
      />
    );
  }

  if (selection) {
    return (
      <CuratorDetailView
        activeCareRequests={activeCareRequests}
        characterSubmission={characterSubmission}
        onBlockCharacter={onBlockCharacter}
        onBack={handleBack}
        onBackToLayer={handleBackToLayer}
        onDeleteCharacter={onDeleteCharacter}
        onEndConnection={onEndConnection}
        onOfferHelp={onOfferHelp}
        onPass={onPass}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onSetRequestMinimized={onSetRequestMinimized}
        isOffline={curatedPeopleOffline || curatedPeopleCached}
        onStartConnection={onStartConnection}
        onUnblockCharacter={onUnblockCharacter}
        onUpdateCharacter={onUpdateCharacter}
        onWithdraw={onWithdraw}
        selection={selection}
        viewerId={careViewerId}
      />
    );
  }

  return (
    <section
      ref={scrollContainerRef}
      aria-label="Curator view"
      className="h-screen snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-slate-950 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <CuratorLayerSection
        addDisabled={addDisabled || holdingPeople.length >= 5}
        count={`${holdingPeople.length}/5`}
        label="Holding"
        nextLayer="Party"
        onAddPartyMember={() => onAddPartyMember("holding")}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        curatedPeopleOffline={curatedPeopleOffline}
        user={user}
      >
        <HoldingLayer
          activeTab={holdingTab}
          blockedPeople={blockedPeople}
          onRetry={onRetryCuratedPeople}
          onSelect={handleSelect}
          onTabChange={setHoldingTab}
          people={holdingPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
        />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled={addDisabled || partyPeople.length >= 5}
        careActionsDisabled={!partyHasConnection}
        count={`${partyPeople.length}/5`}
        label="Party"
        nextLayer="Tribe"
        onAddPartyMember={() => onAddPartyMember("party")}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        curatedPeopleOffline={curatedPeopleOffline}
        user={user}
      >
        <PartyLayer
          addDisabled={addDisabled}
          onAdd={(slotIndex) => onAddPartyMember("party", slotIndex)}
          onSelect={handleSelect}
          onRetry={onRetryCuratedPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
          people={partyPeople}
        />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled={addDisabled || tribePeople.length >= 100}
        careActionsDisabled={!tribeHasConnection}
        count={`${tribePeople.length}/100`}
        label="Tribe"
        nextLayer="Guilds"
        onAddPartyMember={() => onAddPartyMember("tribe")}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        curatedPeopleOffline={curatedPeopleOffline}
        user={user}
      >
        <TribeLayer
          onSelect={handleSelect}
          onRetry={onRetryCuratedPeople}
          people={tribePeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
        />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled
        label="Guilds"
        nextLayer="Signals"
        onAddPartyMember={() => undefined}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        curatedPeopleOffline={curatedPeopleOffline}
        user={user}
      >
        <GuildsLayer />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled
        careActionsDisabled
        curatedPeopleOffline={curatedPeopleOffline}
        label="Signals"
        onAddPartyMember={() => undefined}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        user={user}
      >
        <SignalsLayer />
      </CuratorLayerSection>
    </section>
  );
}
