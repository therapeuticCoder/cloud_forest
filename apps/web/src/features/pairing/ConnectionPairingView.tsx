import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, Copy, UserRoundPlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  cancelConnectionPairing,
  blockConnectionPairing,
  confirmConnectionPairing,
  getConnectionPairing,
  type ConnectionPairing,
  resolveConnectionPairing,
} from "./connectionPairingClient";
import {
  layerBackgrounds,
  layerOuterBackgrounds,
} from "../curator/curatorLayerStyles";
import { characterRelationshipOptions } from "../curator/characterRelationshipOptions";
import { RelationshipConfirmationDialog } from "../curator/RelationshipConfirmationDialog";
import { useCuratedPeople } from "../curator/useCuratedPeople";

type ConnectionPairingViewProps = {
  token: string;
  onClose: () => void;
};

const pairingLayerLabels = {
  party: "Party",
  tribe: "Tribe",
  holding: "Holding",
} as const;

export function ConnectionPairingView({
  token,
  onClose,
}: ConnectionPairingViewProps) {
  const [pairing, setPairing] = useState<ConnectionPairing>();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newRelationshipShape, setNewRelationshipShape] = useState("");
  const [newPrivateDescription, setNewPrivateDescription] = useState("");
  const { add, people } = useCuratedPeople();
  const pairingLink = useMemo(() => {
    const currentUrl = new URL(window.location.href);
    const url = new URL("/", currentUrl.origin);
    url.searchParams.set("pairing", token);
    const signupCode = currentUrl.searchParams.get("signup");
    if (signupCode) url.searchParams.set("signup", signupCode);
    return url.toString();
  }, [token]);

  const loadPairing = useCallback(async () => {
    const result = await getConnectionPairing(token);
    if (result.ok) setPairing(result.value);
    else setMessage(result.message);
  }, [token]);

  useEffect(() => {
    let active = true;
    void getConnectionPairing(token).then((result) => {
      if (!active) return;
      if (result.ok) setPairing(result.value);
      else setMessage(result.message);
    });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (pairing?.state !== "pending") return;
    const refresh = () => void loadPairing();
    const intervalId = window.setInterval(refresh, 4_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, [loadPairing, pairing?.state]);

  const resolve = async (curatedPersonId: string) => {
    setPending(true);
    setMessage(undefined);
    const result = await resolveConnectionPairing(token, curatedPersonId);
    if (result.ok) setPairing(result.value);
    else setMessage(result.message);
    setPending(false);
  };

  const createAndResolve = async () => {
    if (
      !newFirstName.trim() ||
      !newLastName.trim() ||
      !newNickname.trim() ||
      !newRelationshipShape
    )
      return;
    setPending(true);
    setMessage(undefined);
    const created = await add({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      nickname: newNickname.trim(),
      relationshipShape: newRelationshipShape.trim(),
      privateDescription: newPrivateDescription.trim(),
      placement: "holding",
    });
    if (!created.ok || created.value.data.changedPersonId === null) {
      setMessage(
        !created.ok
          ? created.kind === "http"
            ? created.error.error.message
            : "Cloud Forest could not create your private Character."
          : "Cloud Forest could not create your private Character.",
      );
      setPending(false);
      return;
    }
    setPending(false);
    setShowCreateCharacter(false);
    await resolve(created.value.data.changedPersonId);
  };

  const confirm = async () => {
    setPending(true);
    setMessage(undefined);
    const result = await confirmConnectionPairing(token);
    if (result.ok) setPairing(result.value);
    else setMessage(result.message);
    setPending(false);
  };

  const cancel = async () => {
    setPending(true);
    setMessage(undefined);
    const result = await cancelConnectionPairing(token);
    if (result.ok) {
      onClose();
      return;
    }
    setMessage(result.message);
    setPending(false);
  };

  const block = async () => {
    setPending(true);
    setMessage(undefined);
    const result = await blockConnectionPairing(token);
    if (result.ok) {
      onClose();
      return;
    }
    setMessage(result.message);
    setPending(false);
  };

  const confirmBlock = () => {
    setShowBlockConfirmation(false);
    void block();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pairingLink);
      setMessage("Pairing link copied.");
    } catch {
      setMessage("Copy the pairing link from the address bar.");
    }
  };

  const active = pairing?.state === "pending";
  const isInitiator = pairing?.viewerRole === "initiator";
  const receiverNeedsCharacter = pairing?.viewerRole === "visitor";
  const canConfirm =
    active &&
    pairing.receiverResolved &&
    ((pairing.viewerRole === "initiator" && !pairing.initiatorConfirmed) ||
      (pairing.viewerRole === "receiver" && !pairing.receiverConfirmed));
  const canBlock =
    pairing?.viewerRole !== "visitor" &&
    (pairing?.state === "completed" ||
      (pairing?.state === "pending" && pairing.receiverResolved));
  const viewerHasConfirmed =
    (pairing?.viewerRole === "initiator" && pairing.initiatorConfirmed) ||
    (pairing?.viewerRole === "receiver" && pairing.receiverConfirmed);
  const selectedCharacter = people.people.find(
    (person) => person.id === selectedCharacterId,
  );
  const soleCharacter =
    people.status === "ready" && people.people.length === 1
      ? people.people[0]
      : undefined;
  const localViewerPlacement =
    selectedCharacter?.placement ?? soleCharacter?.placement;
  const viewerLayer =
    pairing?.viewerPlacement ??
    (localViewerPlacement === "party" ||
    localViewerPlacement === "tribe" ||
    localViewerPlacement === "holding"
      ? localViewerPlacement
      : undefined);
  const viewerTheme = viewerLayer ? pairingLayerLabels[viewerLayer] : undefined;

  return (
    <main
      className={`min-h-[100svh] px-4 pb-2 pt-4 text-slate-100 sm:px-4 sm:pb-4 ${viewerTheme ? layerOuterBackgrounds[viewerTheme] : "bg-slate-950"}`}
    >
      <div
        className={`relative mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-3xl flex-col overflow-visible rounded-[2rem] border px-4 pb-8 pt-20 shadow-2xl shadow-black/35 sm:px-8 ${viewerTheme ? layerBackgrounds[viewerTheme] : "border-slate-700 bg-slate-950 text-slate-100"}`}
      >
        <Button
          aria-label="Back to Curator"
          className="absolute left-4 top-4 text-slate-100 hover:bg-white/10"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>

        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
          <header className="text-center">
            <h1 className="text-3xl font-medium tracking-tight">
              {pairing?.state === "completed"
                ? "Connection established"
                : pairing?.state === "expired"
                  ? "Pairing expired"
                  : "Upgrade to a mutual connection"}
            </h1>
          </header>

          {message ? (
            <p
              className="rounded-xl border border-amber-200/30 bg-amber-100/10 px-4 py-3 text-sm text-amber-100"
              role="status"
            >
              {message}
            </p>
          ) : null}

          {!pairing && !message ? (
            <p className="text-center text-slate-300" role="status">
              Opening this connection pairing…
            </p>
          ) : null}

          {pairing ? (
            <>
              <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                <p className="text-sm text-slate-300">
                  {isInitiator
                    ? pairing.receiver
                      ? `${pairing.receiver.displayName} selected a private Character for this mutual Cloud Forest connection. Your nickname and notes are private and won’t be shared.`
                      : "This action will add a real person’s data and new functionality to your Cloud Forest Character. Your nickname and notes are private and won’t be shared."
                    : `${pairing.initiator.displayName} wants to make a mutual Cloud Forest connection with you.`}
                </p>
                {!isInitiator ? (
                  <p className="mt-3 text-sm text-lime-100">
                    You can see only their Cloud Forest account identity
                    here—not their private Character details.
                  </p>
                ) : null}
              </section>

              {isInitiator && active ? (
                <section className="flex flex-col items-center rounded-2xl border border-white/15 bg-black/25 p-5 text-center">
                  <QRCodeSVG
                    aria-label="Scannable pairing QR code"
                    bgColor="#f8fafc"
                    fgColor="#0f172a"
                    includeMargin
                    size={208}
                    value={pairingLink}
                  />
                  <p className="mt-4 text-sm text-slate-300">
                    Share this QR code or link. It expires at{" "}
                    {new Date(pairing.expiresAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    .
                  </p>
                  <Button
                    className="mt-4 border border-lime-100/25 text-slate-100"
                    onClick={() => void copyLink()}
                    type="button"
                    variant="ghost"
                  >
                    <Copy aria-hidden="true" /> Copy pairing link
                  </Button>
                </section>
              ) : null}

              {receiverNeedsCharacter && active ? (
                <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
                  <h2 className="text-lg font-medium">
                    Choose your private Character
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Pick the Character you use for{" "}
                    {pairing.initiator.displayName}, or create one. Nothing you
                    enter is shared with them.
                  </p>
                  {people.status === "ready" && people.people.length > 0 ? (
                    <div className="mt-4 grid gap-2">
                      {people.people.map((person) => (
                        <label
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 px-3 py-3 text-sm"
                          key={person.id}
                        >
                          <input
                            checked={selectedCharacterId === person.id}
                            name="connection-character"
                            onChange={() => setSelectedCharacterId(person.id)}
                            type="radio"
                          />
                          <span>{person.nickname}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                  {selectedCharacterId ? (
                    <Button
                      className="mt-4 bg-lime-200 text-slate-950 hover:bg-lime-100"
                      disabled={pending}
                      onClick={() => void resolve(selectedCharacterId)}
                      type="button"
                    >
                      Use this Character
                    </Button>
                  ) : null}
                  <Button
                    className="mt-3 border border-lime-100/25 text-slate-100"
                    onClick={() =>
                      setShowCreateCharacter((current) => !current)
                    }
                    type="button"
                    variant="ghost"
                  >
                    <UserRoundPlus aria-hidden="true" /> Create a private
                    Character
                  </Button>
                  {showCreateCharacter ? (
                    <div className="mt-4 grid gap-3 border-t border-white/15 pt-4">
                      <label className="grid gap-1.5 text-sm text-slate-300">
                        First name
                        <input
                          className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100"
                          onChange={(event) =>
                            setNewFirstName(event.target.value)
                          }
                          value={newFirstName}
                        />
                      </label>
                      <label className="grid gap-1.5 text-sm text-slate-300">
                        Last name
                        <input
                          className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100"
                          onChange={(event) =>
                            setNewLastName(event.target.value)
                          }
                          value={newLastName}
                        />
                      </label>
                      <label className="grid gap-1.5 text-sm text-slate-300">
                        Nickname
                        <input
                          className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100"
                          onChange={(event) =>
                            setNewNickname(event.target.value)
                          }
                          value={newNickname}
                        />
                      </label>
                      <label className="grid gap-1.5 text-sm text-slate-300">
                        Relationship shape
                        <select
                          className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100"
                          onChange={(event) =>
                            setNewRelationshipShape(event.target.value)
                          }
                          value={newRelationshipShape}
                        >
                          <option disabled value="">
                            Choose a relationship shape
                          </option>
                          {characterRelationshipOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1.5 text-sm text-slate-300">
                        Private note (optional)
                        <textarea
                          className="min-h-20 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100"
                          onChange={(event) =>
                            setNewPrivateDescription(event.target.value)
                          }
                          value={newPrivateDescription}
                        />
                      </label>
                      <Button
                        className="bg-lime-200 text-slate-950 hover:bg-lime-100"
                        disabled={
                          pending ||
                          !newFirstName.trim() ||
                          !newLastName.trim() ||
                          !newNickname.trim() ||
                          !newRelationshipShape
                        }
                        onClick={() => void createAndResolve()}
                        type="button"
                      >
                        Create and use this Character
                      </Button>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {pairing.receiverResolved && active ? (
                <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                  <p className="text-sm text-slate-300">
                    {viewerHasConfirmed
                      ? "Your confirmation is recorded. Waiting for the other person to confirm."
                      : "Both people need to confirm. The first confirmation does not establish the connection."}
                  </p>
                  {canConfirm ? (
                    <Button
                      className="mt-4 w-full bg-lime-200 text-slate-950 hover:bg-lime-100"
                      disabled={pending}
                      onClick={() => void confirm()}
                      type="button"
                    >
                      <Check aria-hidden="true" /> Confirm connection
                    </Button>
                  ) : null}
                </section>
              ) : null}

              {pairing.state === "completed" ? (
                <section className="rounded-2xl border border-lime-200/30 bg-lime-100/10 p-5 text-center">
                  <Check className="mx-auto text-lime-200" aria-hidden="true" />
                  <p className="mt-3 text-lime-100">
                    Both private Characters are now connected to the other Cloud
                    Forest user. Their private names, notes, portraits, and
                    placements remain private.
                  </p>
                  <Button
                    className="mt-4 bg-lime-200 text-slate-950 hover:bg-lime-100"
                    onClick={onClose}
                    type="button"
                  >
                    Return to Curator
                  </Button>
                </section>
              ) : null}

              {active && pairing.viewerRole !== "visitor" ? (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    className="text-slate-300 hover:bg-white/10"
                    onClick={onClose}
                    type="button"
                    variant="ghost"
                  >
                    Back to Curator
                  </Button>
                  <Button
                    className="text-rose-100 hover:bg-rose-100/10"
                    disabled={pending}
                    onClick={() => void cancel()}
                    type="button"
                    variant="ghost"
                  >
                    <X aria-hidden="true" /> Cancel this pairing
                  </Button>
                  {canBlock ? (
                    <Button
                      className="text-rose-100 hover:bg-rose-100/10"
                      disabled={pending}
                      onClick={() => setShowBlockConfirmation(true)}
                      type="button"
                      variant="ghost"
                    >
                      Block
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {!active && canBlock ? (
                <div className="flex justify-center">
                  <Button
                    className="text-rose-100 hover:bg-rose-100/10"
                    disabled={pending}
                    onClick={() => setShowBlockConfirmation(true)}
                    type="button"
                    variant="ghost"
                  >
                    Block
                  </Button>
                </div>
              ) : null}
              {pairing.state === "expired" ? (
                <p className="text-center text-sm text-slate-300" role="status">
                  This pairing expired before it was completed. Ask the other
                  person to send a fresh connection request.
                </p>
              ) : pairing.state !== "pending" &&
                pairing.state !== "completed" ? (
                <p className="text-center text-sm text-slate-300">
                  This pairing is {pairing.state} and cannot establish a
                  connection.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <RelationshipConfirmationDialog
        confirmLabel="Block user"
        description="This immediately ends the Connection or relationship attempt and prevents a new Connection while the block remains."
        onCancel={() => setShowBlockConfirmation(false)}
        onConfirm={confirmBlock}
        open={showBlockConfirmation}
        pending={pending}
        title="Block this Cloud Forest user?"
      />
    </main>
  );
}
