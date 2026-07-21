import { useCallback, useEffect, useRef, useState } from "react";

import {
  curatorGuilds,
  curatorPartyPeople,
  curatorSignals,
  curatorTribeNeighborhoods,
  curatorUser,
} from "@/data/humanForest";
import { cn } from "@/lib/utils";
import type { CuratorSelection } from "@/types/curator";

import { CuratorDetailView } from "./CuratorDetailView";
import { GuildsLayer } from "./GuildsLayer";
import { PartyLayer } from "./PartyLayer";
import { SignalsLayer } from "./SignalsLayer";
import { TribeLayer } from "./TribeLayer";

type CuratorLayerSectionProps = {
  children: React.ReactNode;
  label: string;
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

export function CuratorView() {
  const [selection, setSelection] = useState<CuratorSelection | null>(null);
  const triggerIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);

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

    const handlePopState = () => restoreCurator();
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

  if (selection) {
    return <CuratorDetailView onBack={handleBack} selection={selection} />;
  }

  return (
    <section
      ref={scrollContainerRef}
      aria-label="Curator view"
      className="h-screen snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-slate-950 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <CuratorLayerSection label="Party">
        <PartyLayer
          onSelect={handleSelect}
          people={curatorPartyPeople}
          user={curatorUser}
        />
      </CuratorLayerSection>
      <CuratorLayerSection label="Tribe">
        <TribeLayer
          neighborhoods={curatorTribeNeighborhoods}
          onSelect={handleSelect}
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
