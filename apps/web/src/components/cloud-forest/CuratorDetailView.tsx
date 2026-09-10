import {
  ArrowLeft,
  HandHeart,
  Layers3,
  RadioTower,
  Sprout,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  canPassCareRequest,
  selectCareRequestPresentation,
  selectProfileCareRequests,
} from "@/lib/careLifecycle";
import type {
  CareLifecycleState,
  CarePersonId,
  ReceiveCareRequest,
} from "@/types/careRequest";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

import { CareRequestCard } from "./CareRequestCard";
import { Portrait } from "./PartyLayer";

type CuratorDetailViewProps = {
  careLifecycle: CareLifecycleState;
  characterSubmission: { pending: boolean; error?: string };
  onBack: () => void;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onRecordCompleted: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
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
  onWithdraw: (requestId: string) => void;
  selection: CuratorSelection;
  viewerId: CarePersonId;
};

const layerLabels = {
  party: "Party",
  tribe: "Tribe",
  holding: "Holding",
  guild: "Guild",
  signal: "Signal",
} as const;

function getSelectionName(selection: CuratorSelection) {
  return "displayName" in selection.item
    ? selection.item.displayName
    : selection.item.name;
}

function SelectionVisual({
  portraitUrl,
  selection,
}: {
  portraitUrl?: string;
  selection: CuratorSelection;
}) {
  if (
    selection.layer === "party" ||
    selection.layer === "tribe" ||
    selection.layer === "holding"
  ) {
    return (
      <Portrait
        initials={selection.item.initials}
        personId={selection.item.id}
        portraitUrl={portraitUrl}
      />
    );
  }

  if (selection.layer === "guild") {
    return <Layers3 aria-hidden="true" />;
  }

  return <RadioTower aria-hidden="true" />;
}

const layerStyles = {
  party: "border-amber-200/60 text-amber-100",
  tribe: "border-lime-200/60 text-lime-100",
  holding: "border-amber-100/50 text-amber-100",
  guild: "border-cyan-200/60 text-cyan-100",
  signal: "border-slate-200/60 text-slate-100",
} as const;

function isCharacterSelection(
  selection: CuratorSelection,
): selection is Extract<
  CuratorSelection,
  { layer: "party" | "tribe" | "holding" }
> {
  return (
    selection.layer === "party" ||
    selection.layer === "tribe" ||
    selection.layer === "holding"
  );
}

export function CuratorDetailView({
  careLifecycle,
  characterSubmission,
  onBack,
  onOfferHelp,
  onPass,
  onRecordCompleted,
  onRecordNotCompleted,
  onSetRequestMinimized,
  onUpdateCharacter,
  onWithdraw,
  selection,
  viewerId,
}: CuratorDetailViewProps) {
  const selectionName = getSelectionName(selection);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isPerson = isCharacterSelection(selection);
  const initialCharacter =
    isPerson && selection.item.version !== undefined ? selection.item : null;
  const [character, setCharacter] = useState(initialCharacter);
  const [draft, setDraft] = useState(() =>
    character
      ? {
          nickname: character.displayName,
          placement: selection.layer as "holding" | "party" | "tribe",
          privateDescription:
            character.privateDescription ?? character.relationshipTitle,
          portraitUrl: character.portraitUrl,
          relationshipShape:
            character.relationshipShape ?? character.relationshipNote,
        }
      : null,
  );
  const activeLayer = character && draft ? draft.placement : selection.layer;
  const profileOwnerId = isPerson ? selection.item.id : undefined;
  const now = new Date().toISOString();
  const careRequests = useMemo(
    () =>
      profileOwnerId
        ? selectProfileCareRequests(
            careLifecycle,
            profileOwnerId,
            viewerId,
            now,
          )
        : [],
    [careLifecycle, now, profileOwnerId, viewerId],
  );

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  const saveCharacter = async (
    placement: "holding" | "party" | "tribe" = draft?.placement ?? "holding",
  ) => {
    if (!character || !draft) return;
    const saved = await onUpdateCharacter(character, { ...draft, placement });
    if (saved) {
      setCharacter(saved);
      setDraft((current) => (current ? { ...current, placement } : current));
    }
  };

  return (
    <section
      aria-label={`${selectionName} details`}
      className="curator-detail-view flex min-h-[100svh] flex-col overflow-y-auto bg-slate-950 px-5 pb-8 pt-20 text-slate-100 sm:px-8"
    >
      <Button
        aria-label="Back to Curator"
        className="absolute left-4 top-4 text-slate-100 hover:bg-white/10"
        onClick={onBack}
        size="icon"
        type="button"
        variant="ghost"
      >
        <ArrowLeft aria-hidden="true" />
      </Button>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
        <div
          className={`relative grid aspect-square w-[min(48vw,14rem)] place-items-center overflow-hidden rounded-2xl border bg-slate-900/35 text-[clamp(3rem,14vw,7rem)] font-medium ${layerStyles[activeLayer]}`}
        >
          <SelectionVisual
            portraitUrl={character?.portraitUrl}
            selection={selection}
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1
            className="text-3xl font-medium tracking-tight sm:text-4xl"
            ref={headingRef}
            tabIndex={-1}
          >
            {selectionName}
          </h1>
          <p className={layerStyles[activeLayer]}>{layerLabels[activeLayer]}</p>
        </div>

        {character && draft ? (
          <section className="w-full rounded-2xl border border-lime-100/20 bg-lime-100/[0.035] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-200/75">
              Private Character
            </p>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5 text-sm text-slate-300">
                Name or nickname
                <input
                  className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base text-slate-100"
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, nickname: event.target.value }
                        : current,
                    )
                  }
                  value={draft.nickname}
                />
              </label>
              <label className="grid gap-1.5 text-sm text-slate-300">
                Relationship shape
                <input
                  className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base text-slate-100"
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, relationshipShape: event.target.value }
                        : current,
                    )
                  }
                  value={draft.relationshipShape}
                />
              </label>
              <label className="grid gap-1.5 text-sm text-slate-300">
                Private note
                <textarea
                  className="min-h-24 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base text-slate-100"
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, privateDescription: event.target.value }
                        : current,
                    )
                  }
                  value={draft.privateDescription}
                />
              </label>
              <Button
                className="bg-lime-200 text-slate-950 hover:bg-lime-100"
                disabled={
                  characterSubmission.pending ||
                  !draft.nickname.trim() ||
                  !draft.relationshipShape.trim()
                }
                onClick={() => void saveCharacter()}
                type="button"
              >
                Save private details
              </Button>
              <div className="border-t border-lime-100/15 pt-4">
                <p className="text-sm text-slate-300">Move this Character</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["holding", "party", "tribe"] as const).map((placement) => (
                    <Button
                      className="border border-lime-100/25 text-slate-100 hover:bg-lime-100/10"
                      disabled={
                        characterSubmission.pending ||
                        draft.placement === placement
                      }
                      key={placement}
                      onClick={() => void saveCharacter(placement)}
                      type="button"
                      variant="ghost"
                    >
                      {layerLabels[placement]}
                    </Button>
                  ))}
                </div>
              </div>
              {characterSubmission.error ? (
                <p className="text-sm text-rose-200" role="status">
                  {characterSubmission.error}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {isPerson ? (
          <section
            aria-labelledby="profile-care-heading"
            className="curator-profile-care"
          >
            <div className="curator-profile-care__heading">
              <HandHeart aria-hidden="true" />
              <div>
                <span>Active care</span>
                <h2
                  data-care-profile-heading
                  id="profile-care-heading"
                  tabIndex={-1}
                >
                  Care with {selectionName}
                </h2>
              </div>
            </div>

            {careRequests.length > 0 ? (
              careRequests.map((request) => {
                const claim = careLifecycle.claims.find(
                  (candidate) => candidate.requestId === request.id,
                );
                const viewerCompletion = careLifecycle.completions.find(
                  (completion) =>
                    completion.requestId === request.id &&
                    completion.participantId === viewerId,
                );
                const otherParticipantCompleted =
                  careLifecycle.completions.some(
                    (completion) =>
                      completion.requestId === request.id &&
                      completion.participantId !== viewerId &&
                      completion.decision === "completed",
                  );
                return (
                  <CareRequestCard
                    canPass={canPassCareRequest(
                      careLifecycle,
                      request.id,
                      viewerId,
                      now,
                    )}
                    claimed={Boolean(claim)}
                    key={request.id}
                    minimized={
                      selectCareRequestPresentation(
                        careLifecycle,
                        request.id,
                        viewerId,
                      ).minimized
                    }
                    onOfferHelp={onOfferHelp}
                    onPass={onPass}
                    onRecordCompleted={onRecordCompleted}
                    onRecordNotCompleted={onRecordNotCompleted}
                    onSetMinimized={onSetRequestMinimized}
                    onWithdraw={onWithdraw}
                    request={request}
                    viewerId={viewerId}
                    viewerCompletion={viewerCompletion?.decision}
                    viewerIsClaimer={claim?.claimerId === viewerId}
                    otherParticipantCompleted={otherParticipantCompleted}
                  />
                );
              })
            ) : (
              <p className="curator-profile-care__empty">
                There isn’t any active care to respond to here.
              </p>
            )}
          </section>
        ) : (
          <div className="mt-4 flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 text-slate-500">
            <Sprout aria-hidden="true" />
            <p>Details coming next</p>
          </div>
        )}
      </div>
    </section>
  );
}
