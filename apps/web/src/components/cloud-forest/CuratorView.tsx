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
import { PartyLayer } from "./PartyLayer";
import { SignalsLayer } from "./SignalsLayer";
import { TribeLayer } from "./TribeLayer";

type CuratorLayerSectionProps = {
  children: React.ReactNode;
  label: string;
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
  onAddHoldingCharacter: () => void;
  onCancelAdd: () => void;
  onCompleteAdd: (
    draft: AddPartyMemberDraft,
  ) => void | boolean | Promise<void | boolean>;
  onRetryCuratedPeople: () => void;
  onDetailOpenChange: (open: boolean) => void;
  onUpdateCharacter: (
    person: CuratorPerson,
    update: {
      nickname: string;
      placement: "holding" | "party" | "tribe";
      privateDescription: string;
      relationshipShape: string;
    },
  ) => Promise<CuratorPerson | null>;
  onNavigateToTimeline: () => void;
  onOpenMyCare: () => void;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onRecordCompleted: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
  onWithdraw: (requestId: string) => void;
  partyPeople: CuratorPerson[];
  holdingPeople: CuratorPerson[];
  tribePeople: CuratorPerson[];
  user: CuratorPerson;
};

function CuratorLayerSection({ children, label }: CuratorLayerSectionProps) {
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
        "h-[100svh] snap-start snap-always px-2 pb-2 pt-16 transition-[opacity,transform] duration-500 ease-out sm:px-4 sm:pb-4",
        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-75",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
      )}
    >
      {children}
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
  onAddHoldingCharacter,
  onCancelAdd,
  onCompleteAdd,
  onRetryCuratedPeople,
  onDetailOpenChange,
  onUpdateCharacter,
  onNavigateToTimeline,
  onOpenMyCare,
  onOfferHelp,
  onPass,
  onRecordCompleted,
  onRecordNotCompleted,
  onSetRequestMinimized,
  onWithdraw,
  partyPeople,
  holdingPeople,
  tribePeople,
  user,
}: CuratorViewProps) {
  const [selection, setSelection] = useState<CuratorSelection | null>(null);
  const triggerIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    onDetailOpenChange(Boolean(selection));
    return () => onDetailOpenChange(false);
  }, [onDetailOpenChange, selection]);

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
      <CuratorLayerSection label="Holding">
        <HoldingLayer
          onAdd={onAddHoldingCharacter}
          onRetry={onRetryCuratedPeople}
          onSelect={handleSelect}
          people={holdingPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
        />
      </CuratorLayerSection>
      <CuratorLayerSection label="Party">
        <PartyLayer
          onAdd={onAddPartyMember}
          onNavigateToTimeline={onNavigateToTimeline}
          onOpenMyCare={onOpenMyCare}
          onSelect={handleSelect}
          onRetry={onRetryCuratedPeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
          people={partyPeople}
          user={user}
        />
      </CuratorLayerSection>
      <CuratorLayerSection label="Tribe">
        <TribeLayer
          onSelect={handleSelect}
          onRetry={onRetryCuratedPeople}
          people={tribePeople}
          peopleState={curatedPeopleStatus}
          peopleStateMessage={curatedPeopleError}
        />
      </CuratorLayerSection>
      <CuratorLayerSection label="Guilds">
        <GuildsLayer guilds={curatorGuilds} onSelect={handleSelect} />
      </CuratorLayerSection>
      <CuratorLayerSection label="Signals">
        <SignalsLayer onSelect={handleSelect} signals={curatorSignals} />
      </CuratorLayerSection>
    </section>
  );
}
