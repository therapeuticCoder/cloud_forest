import { Cloud, RadioTower, UsersRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { curatorGuilds, curatorSignals } from "@/data/cloudForest";
import { cn } from "@/lib/utils";
import type {
  CareLifecycleState,
  CarePersonId,
  ReceiveCareRequest,
} from "@/types/careRequest";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import {
  AddPartyMemberWizard,
  type AddPartyMemberDraft,
} from "./AddPartyMemberWizard";
import { CuratorDetailView } from "./CuratorDetailView";
import { GuildsLayer } from "./GuildsLayer";
import { HoldingLayer } from "./HoldingLayer";
import { PartyActions, PartyLayer, Portrait } from "./PartyLayer";
import { SignalsLayer } from "./SignalsLayer";
import { TribeLayer } from "./TribeLayer";

type CuratorLayerSectionProps = {
  addDisabled: boolean;
  careActionsDisabled?: boolean;
  children: React.ReactNode;
  count: string;
  label: string;
  nextLayer?: "Party" | "Tribe" | "Guilds" | "Signals";
  onAddPartyMember: () => void;
  onGive: (returnFocusSelector?: string) => void;
  onNavigateToTimeline: () => void;
  onOpenMyCare: (returnFocusSelector: string) => void;
  onReceive: () => void;
  partyIsFull: boolean;
  user: CuratorPerson;
};

const layerBackgrounds: Record<string, string> = {
  Guilds:
    "border-lime-100/20 bg-[radial-gradient(circle_at_18%_10%,rgba(190,242,100,0.2),transparent_28%),linear-gradient(180deg,#1d542d,#075985)] text-slate-100",
  Holding:
    "border-amber-100/15 bg-[radial-gradient(circle_at_85%_15%,rgba(120,53,15,0.28),transparent_26%),linear-gradient(180deg,#050403,#180b05_44%,#55260d)] text-stone-100",
  Party:
    "border-amber-100/20 bg-[radial-gradient(circle_at_82%_78%,rgba(74,130,58,0.5),transparent_36%),linear-gradient(180deg,#210d06,#4a210d_55%,#123a28)] text-stone-100",
  Signals:
    "border-slate-100/20 bg-[radial-gradient(circle_at_70%_18%,rgba(226,232,240,0.2),transparent_30%),linear-gradient(180deg,#475569,#0f172a)] text-slate-100",
  Tribe:
    "border-lime-100/15 bg-[radial-gradient(circle_at_82%_14%,rgba(163,230,53,0.2),transparent_26%),linear-gradient(180deg,#174c2d,#062e1d)] text-slate-100",
};

const layerOuterBackgrounds: Record<string, string> = {
  Guilds: "bg-[#0b5a68]",
  Holding: "bg-[#1b0c05]",
  Party: "bg-[#251006]",
  Signals: "bg-[#263b4a]",
  Tribe: "bg-[#0b3c25]",
};

type CuratorViewProps = {
  addDestination: "holding" | "party";
  addSubmission: { pending: boolean; error?: string };
  addWizardOpen: boolean;
  careLifecycle: CareLifecycleState;
  careViewerId: CarePersonId;
  characterSubmission: { pending: boolean; error?: string };
  curatedPeopleStatus: "loading" | "ready" | "error";
  curatedPeopleError?: string;
  onAddPartyMember: (slotIndex?: number) => void;
  onCancelAdd: () => void;
  onCompleteAdd: (
    draft: AddPartyMemberDraft,
  ) => void | boolean | Promise<void | boolean>;
  onRetryCuratedPeople: () => void;
  onGive: (returnFocusSelector?: string) => void;
  onUpdateCharacter: (
    person: CuratorPerson,
    update: {
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
  onWithdraw: (requestId: string) => void;
  partyPeople: CuratorPerson[];
  holdingPeople: CuratorPerson[];
  tribePeople: CuratorPerson[];
  user: CuratorPerson;
};

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
  label,
  nextLayer,
  onAddPartyMember,
  onGive,
  onNavigateToTimeline,
  onOpenMyCare,
  onReceive,
  partyIsFull,
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
        <header className="grid grid-cols-[3rem_minmax(0,1fr)_auto_auto] items-center gap-2 pb-4">
          <button
            aria-label="Open My Care"
            className="party-self"
            data-my-care-trigger={`curator-${label.toLowerCase()}`}
            onClick={() =>
              onOpenMyCare(
                `[data-my-care-trigger="curator-${label.toLowerCase()}"]`,
              )
            }
            type="button"
          >
            <Portrait initials={user.initials} personId={user.id} small />
          </button>
          <h1 className="min-w-0 truncate text-3xl font-medium tracking-tight sm:text-4xl">
            {label}
          </h1>
          <span className="rounded-full border border-current/20 bg-black/10 px-2.5 py-1 text-xs font-medium text-current/80 sm:text-sm">
            {count}
          </span>
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
          partyIsFull={partyIsFull}
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
  careLifecycle,
  careViewerId,
  characterSubmission,
  curatedPeopleError,
  curatedPeopleStatus,
  onAddPartyMember,
  onCancelAdd,
  onCompleteAdd,
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
  onWithdraw,
  partyPeople,
  holdingPeople,
  tribePeople,
  user,
}: CuratorViewProps) {
  const partyIsFull =
    curatedPeopleStatus !== "ready" || partyPeople.length >= 5;
  const [selection, setSelection] = useState<CuratorSelection | null>(null);
  const triggerIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.clientHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const restoreCurator = useCallback(() => {
    setSelection(null);

    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPositionRef.current;
      }
      if (triggerIdRef.current) {
        const trigger = document.querySelector<HTMLButtonElement>(
          `[data-curator-tile="${triggerIdRef.current}"]`,
        );
        trigger?.focus();
      }
    });
  }, []);

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
    restoreCurator();
    window.history.back();
  }, [restoreCurator]);

  useEffect(() => {
    if (!selection) {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.curatorSelection) return;
      restoreCurator();
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
        destination={addDestination === "holding" ? "Holding" : "Party"}
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
        careLifecycle={careLifecycle}
        characterSubmission={characterSubmission}
        onBack={handleBack}
        onOfferHelp={onOfferHelp}
        onPass={onPass}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onSetRequestMinimized={onSetRequestMinimized}
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
        addDisabled={holdingPeople.length >= 5}
        count={`${holdingPeople.length}/5`}
        label="Holding"
        nextLayer="Party"
        onAddPartyMember={() => onAddPartyMember()}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        partyIsFull={partyIsFull}
        user={user}
      >
        <HoldingLayer
          onRetry={onRetryCuratedPeople}
          onSelect={handleSelect}
          people={holdingPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
        />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled={partyPeople.length >= 5}
        count={`${partyPeople.length}/5`}
        label="Party"
        nextLayer="Tribe"
        onAddPartyMember={() => onAddPartyMember()}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        partyIsFull={partyIsFull}
        user={user}
      >
        <PartyLayer
          onAdd={onAddPartyMember}
          onSelect={handleSelect}
          onRetry={onRetryCuratedPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
          people={partyPeople}
        />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled={tribePeople.length >= 100}
        count={`${tribePeople.length}/100`}
        label="Tribe"
        nextLayer="Guilds"
        onAddPartyMember={() => onAddPartyMember()}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        partyIsFull={partyIsFull}
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
        addDisabled={curatorGuilds.length >= 5}
        count={`${curatorGuilds.length}/5`}
        label="Guilds"
        nextLayer="Signals"
        onAddPartyMember={() => onAddPartyMember()}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        partyIsFull={partyIsFull}
        user={user}
      >
        <GuildsLayer guilds={curatorGuilds} onSelect={handleSelect} />
      </CuratorLayerSection>
      <CuratorLayerSection
        addDisabled={curatorSignals.length >= 10}
        careActionsDisabled
        count={`${curatorSignals.length}/10`}
        label="Signals"
        onAddPartyMember={() => onAddPartyMember()}
        onGive={onGive}
        onNavigateToTimeline={onNavigateToTimeline}
        onOpenMyCare={onOpenMyCare}
        onReceive={onReceive}
        partyIsFull={partyIsFull}
        user={user}
      >
        <SignalsLayer onSelect={handleSelect} signals={curatorSignals} />
      </CuratorLayerSection>
    </section>
  );
}
