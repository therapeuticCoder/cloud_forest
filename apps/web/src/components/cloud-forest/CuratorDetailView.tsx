import {
  ArrowLeft,
  HandHeart,
  Layers3,
  Link2,
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
import { layerBackgrounds, layerOuterBackgrounds } from "./curatorLayerStyles";
import { partyRelationshipOptions } from "./partyRelationshipOptions";
import { Portrait } from "./PartyLayer";

type CuratorDetailViewProps = {
  careLifecycle: CareLifecycleState;
  characterSubmission: { pending: boolean; error?: string };
  isOffline: boolean;
  onBack: () => void;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass: (request: ReceiveCareRequest) => void;
  onRecordCompleted: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized: (requestId: string, minimized: boolean) => void;
  onStartConnection: (person: CuratorPerson) => Promise<void>;
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
  initials,
  portraitUrl,
  selection,
}: {
  initials?: string;
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
        grayscale={selection.item.linkedUserId == null}
        initials={initials ?? selection.item.initials}
        layer={selection.layer}
        personId={selection.item.id}
        portraitUrl={portraitUrl}
        showInitials
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

const layerThemeLabels = {
  party: "Party",
  tribe: "Tribe",
  holding: "Holding",
  guild: "Guilds",
  signal: "Signals",
} as const;

const layerControlStyles = {
  party: "border-amber-100/30 bg-[#210d06]/70 text-stone-100",
  tribe: "border-lime-100/30 bg-[#062e1d]/75 text-slate-100",
  holding: "border-amber-100/30 bg-[#180b05]/75 text-stone-100",
  guild: "border-lime-100/30 bg-[#123c2d]/75 text-slate-100",
  signal: "border-slate-100/30 bg-slate-950/60 text-slate-100",
} as const;

function editorRelationshipShape(value: string) {
  return partyRelationshipOptions.includes(
    value as (typeof partyRelationshipOptions)[number],
  )
    ? value
    : "Something else";
}

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
  isOffline,
  onBack,
  onOfferHelp,
  onPass,
  onRecordCompleted,
  onRecordNotCompleted,
  onSetRequestMinimized,
  onStartConnection,
  onUpdateCharacter,
  onWithdraw,
  selection,
  viewerId,
}: CuratorDetailViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isPerson = isCharacterSelection(selection);
  const initialCharacter =
    isPerson && selection.item.version !== undefined ? selection.item : null;
  const [character, setCharacter] = useState(initialCharacter);
  const selectionName = character?.displayName ?? getSelectionName(selection);
  const [draft, setDraft] = useState(() =>
    character
      ? {
          firstName: character.firstName ?? "",
          lastName: character.lastName ?? "",
          nickname: character.nickname ?? character.displayName,
          placement: selection.layer as "holding" | "party" | "tribe",
          privateDescription:
            character.privateDescription ?? character.relationshipTitle,
          portraitUrl: character.portraitUrl,
          relationshipShape: editorRelationshipShape(
            character.relationshipShape ?? character.relationshipNote,
          ),
        }
      : null,
  );
  const activeLayer = character && draft ? draft.placement : selection.layer;
  const activeLayerTheme = layerThemeLabels[activeLayer];
  const controlStyle = layerControlStyles[activeLayer];
  const layerDescription = character
    ? `${layerLabels[activeLayer]} ${character.linkedUserId ? "Connection" : "Character"}`
    : layerLabels[activeLayer];
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
      className={`curator-detail-view flex min-h-[100svh] flex-col px-4 pb-2 pt-4 ${layerOuterBackgrounds[activeLayerTheme]} sm:px-4 sm:pb-4`}
    >
      <div
        className={`relative mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-3xl flex-col overflow-visible rounded-[2rem] border px-4 pb-8 pt-20 shadow-2xl shadow-black/35 sm:px-8 ${layerBackgrounds[activeLayerTheme]}`}
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
              initials={character?.initials}
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
            <p className={layerStyles[activeLayer]}>{layerDescription}</p>
          </div>

          {character && draft ? (
            <section className="w-full rounded-2xl border border-white/15 bg-black/20 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-200/75">
                Private Character
              </p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1.5 text-sm text-slate-300">
                  First name
                  <input
                    className={`rounded-lg border px-3 py-2 text-base ${controlStyle}`}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, firstName: event.target.value }
                          : current,
                      )
                    }
                    readOnly={isOffline}
                    value={draft.firstName}
                  />
                </label>
                <label className="grid gap-1.5 text-sm text-slate-300">
                  Last name
                  <input
                    className={`rounded-lg border px-3 py-2 text-base ${controlStyle}`}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, lastName: event.target.value }
                          : current,
                      )
                    }
                    readOnly={isOffline}
                    value={draft.lastName}
                  />
                </label>
                <label className="grid gap-1.5 text-sm text-slate-300">
                  Nickname
                  <input
                    className={`rounded-lg border px-3 py-2 text-base ${controlStyle}`}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, nickname: event.target.value }
                          : current,
                      )
                    }
                    readOnly={isOffline}
                    value={draft.nickname}
                  />
                </label>
                <label className="grid gap-1.5 text-sm text-slate-300">
                  Relationship shape
                  <select
                    className={`rounded-lg border px-3 py-2 text-base ${controlStyle}`}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              relationshipShape: event.target.value,
                            }
                          : current,
                      )
                    }
                    disabled={isOffline}
                    value={draft.relationshipShape}
                  >
                    {partyRelationshipOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm text-slate-300">
                  Private note
                  <textarea
                    className={`min-h-24 rounded-lg border px-3 py-2 text-base ${controlStyle}`}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              privateDescription: event.target.value,
                            }
                          : current,
                      )
                    }
                    readOnly={isOffline}
                    value={draft.privateDescription}
                  />
                </label>
                {isOffline ? (
                  <p className="text-sm text-amber-100/80" role="status">
                    This is cached relationship data. Character changes require
                    a connection.
                  </p>
                ) : null}
                <Button
                  className="bg-lime-200 text-slate-950 hover:bg-lime-100"
                  disabled={
                    isOffline ||
                    characterSubmission.pending ||
                    !draft.firstName.trim() ||
                    !draft.lastName.trim() ||
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
                    {(["holding", "party", "tribe"] as const).map(
                      (placement) => (
                        <Button
                          className="border border-lime-100/25 text-slate-100 hover:bg-lime-100/10"
                          disabled={
                            isOffline ||
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
                      ),
                    )}
                  </div>
                </div>
                {characterSubmission.error ? (
                  <p className="text-sm text-rose-200" role="status">
                    {characterSubmission.error}
                  </p>
                ) : null}
                <div className="border-t border-lime-100/15 pt-4">
                  {character.linkedUserId ? (
                    <p className="flex items-center gap-2 text-sm text-lime-100">
                      <Link2 aria-hidden="true" size={16} /> Connected to a
                      Cloud Forest user
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      <p className="text-sm text-slate-300">
                        Connect this Character with the real person they
                        represent. Your private details stay private.
                      </p>
                      <Button
                        className="min-h-12 w-full bg-lime-200 text-base text-slate-950 hover:bg-lime-100"
                        disabled={isOffline || characterSubmission.pending}
                        onClick={() => void onStartConnection(character)}
                        type="button"
                      >
                        <Link2 aria-hidden="true" /> Connect with a Cloud Forest
                        user
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {isPerson && character?.linkedUserId ? (
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
          ) : null}
          {!isPerson ? (
            <div className="mt-4 flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 text-slate-500">
              <Sprout aria-hidden="true" />
              <p>Details coming next</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
