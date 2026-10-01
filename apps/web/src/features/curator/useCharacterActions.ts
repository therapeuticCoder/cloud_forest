import type { CharacterUpdate } from "@/types/curator";
import { useState } from "react";
import type { CuratorPerson } from "@/types/curator";
import {
  blockCuratedPerson,
  endConnection as endCharacterConnection,
  unblockCuratedPerson,
} from "./relationshipExitClient";
import {
  curationErrorMessage,
  curatedPersonToCuratorPerson,
  type useCuratedPeople,
} from "./useCuratedPeople";

export function useCharacterActions(
  curated: ReturnType<typeof useCuratedPeople>,
  canEditCuratedPeople: boolean,
  canChangeRelationships = canEditCuratedPeople,
) {
  const {
    update: updateCuratedPerson,
    remove: removeCuratedPerson,
    load: loadCuratedPeople,
  } = curated;
  const [characterSubmission, setCharacterSubmission] = useState<{
    pending: boolean;
    error?: string;
  }>({ pending: false });
  const updateCharacter = async (
    person: CuratorPerson,
    update: CharacterUpdate,
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
      (candidate) => candidate.id === result.value.data.changedPersonId,
    );
    return updatedPerson ? curatedPersonToCuratorPerson(updatedPerson) : null;
  };

  const deleteCharacter = async (person: CuratorPerson) => {
    if (person.version === undefined || !canEditCuratedPeople) {
      setCharacterSubmission({
        pending: false,
        error:
          "Your device storage is unavailable. Try again when it is ready.",
      });
      return false;
    }
    setCharacterSubmission({ pending: true });
    const result = await removeCuratedPerson(person.id);
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
    if (!canChangeRelationships) {
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
    if (!canChangeRelationships) {
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
    if (!blockedUserId || !canChangeRelationships) {
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

  return {
    characterSubmission,
    setCharacterSubmission,
    updateCharacter,
    deleteCharacter,
    endConnection,
    blockCharacter,
    unblockCharacter,
  };
}
