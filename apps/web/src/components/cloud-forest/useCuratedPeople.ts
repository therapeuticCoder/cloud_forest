import {
  createApiClient,
  type ApiClient,
  type CuratedPersonInput,
  type GetCuratedPersonsResponse,
  type GetCuratedPersonsResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { CuratorPerson } from "@/types/curator";

export type CuratedPersonApiClient = Pick<
  ApiClient,
  | "getCuratedPersons"
  | "createCuratedPerson"
  | "updateCuratedPerson"
  | "deleteCuratedPerson"
>;
export type CuratedPersonRecord =
  GetCuratedPersonsResponse["data"]["people"][number];
export type CuratedPeopleState =
  | { status: "loading"; people: readonly CuratedPersonRecord[] }
  | { status: "ready"; people: readonly CuratedPersonRecord[] }
  | {
      status: "error";
      people: readonly CuratedPersonRecord[];
      message: string;
    };

const defaultApiClient: CuratedPersonApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

function initialsFor(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function curatedPersonToCuratorPerson(
  person: CuratedPersonRecord,
): CuratorPerson {
  return {
    id: person.id,
    displayName: person.nickname,
    initials: initialsFor(person.nickname),
    relationshipTitle: person.privateDescription || person.relationshipShape,
    relationshipNote: person.relationshipShape,
    recentStatus: "Private relationship record",
    placement: person.placement,
    privateDescription: person.privateDescription,
    relationshipShape: person.relationshipShape,
    version: person.version,
  };
}

export function curationErrorMessage(
  result: Exclude<GetCuratedPersonsResult, { ok: true }>,
) {
  if (result.kind === "network") {
    return "Cloud Forest could not reach your private relationships. Try again when you’re ready.";
  }
  if (result.kind === "http") return result.error.error.message;
  return "Your private relationships are temporarily unavailable. Try again.";
}

export function useCuratedPeople(
  apiClient: CuratedPersonApiClient = defaultApiClient,
  enabled = true,
) {
  const [people, setPeople] = useState<CuratedPeopleState>({
    status: "loading",
    people: [],
  });

  const applyResult = useCallback((result: GetCuratedPersonsResult) => {
    if (result.ok) {
      setPeople({ status: "ready", people: result.value.data.people });
    } else {
      setPeople({
        status: "error",
        people: [],
        message: curationErrorMessage(result),
      });
    }
  }, []);

  const requestPeople = useCallback(
    () => apiClient.getCuratedPersons(),
    [apiClient],
  );

  const load = useCallback(async () => {
    setPeople((current) => ({
      status: "loading",
      people: current.people,
    }));
    const result = await requestPeople();
    applyResult(result);
    return result;
  }, [applyResult, requestPeople]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void requestPeople().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyResult, enabled, requestPeople]);

  const add = useCallback(
    async (input: CuratedPersonInput) => {
      const result = await apiClient.createCuratedPerson(input);
      if (result.ok) {
        applyResult(result);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  const update = useCallback(
    async (
      curatedPersonId: string,
      input: Parameters<CuratedPersonApiClient["updateCuratedPerson"]>[1],
    ) => {
      const result = await apiClient.updateCuratedPerson(
        curatedPersonId,
        input,
      );
      if (result.ok) {
        applyResult(result);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  const partyPeople = useMemo(
    () =>
      people.people
        .filter((person) => person.placement === "party")
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  const tribePeople = useMemo(
    () =>
      people.people
        .filter((person) => person.placement === "tribe")
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  const holdingPeople = useMemo(
    () =>
      people.people
        .filter((person) => person.placement === "holding")
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  return {
    add,
    holdingPeople,
    load,
    partyPeople,
    people,
    tribePeople,
    update,
  };
}
