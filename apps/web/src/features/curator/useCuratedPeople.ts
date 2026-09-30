import { createInitials } from "@/lib/personPresentation";
import {
  createApiClient,
  type ApiClient,
  type CuratedPersonInput,
  type GetCuratedPersonsResponse,
  type GetCuratedPersonsResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadCuratedPeopleSnapshot } from "@/lib/curatedPeopleStorage";
import {
  loadDeviceRead,
  saveDeviceRead,
  reportExpiredDeviceSession,
} from "@/lib/deviceReadStorage";
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
  | {
      status: "loading";
      people: readonly CuratedPersonRecord[];
      source: "cache" | "live" | "none";
      offline: boolean;
    }
  | {
      status: "ready";
      people: readonly CuratedPersonRecord[];
      source: "cache" | "live" | "none";
      offline: boolean;
    }
  | {
      status: "error";
      people: readonly [];
      source: "cache" | "live" | "none";
      offline: boolean;
      message: string;
    };

const defaultApiClient: CuratedPersonApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

export function curatedPersonToCuratorPerson(
  person: CuratedPersonRecord,
): CuratorPerson {
  return {
    id: person.id,
    displayName: person.nickname,
    firstName: person.firstName,
    initials: createInitials(`${person.firstName} ${person.lastName}`).slice(
      0,
      3,
    ),
    lastName: person.lastName,
    nickname: person.nickname,
    relationshipTitle: person.privateDescription || person.relationshipShape,
    relationshipNote: person.relationshipShape,
    recentStatus: "Private relationship record",
    placement: person.placement,
    privateDescription: person.privateDescription,
    portraitUrl: person.portraitUrl,
    relationshipShape: person.relationshipShape,
    linkedUserId: person.linkedUserId,
    linkedPersonId: person.linkedPersonId,
    relationshipState: person.relationshipState,
    blockedUserId: person.blockedUserId,
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
  ownerId = "",
) {
  const requestSequenceRef = useRef(0);
  const [people, setPeople] = useState<CuratedPeopleState>(() => {
    const cachedPeople = ownerId
      ? loadCuratedPeopleSnapshot(ownerId)
      : undefined;
    return cachedPeople !== undefined
      ? {
          status: "ready",
          people: cachedPeople,
          source: "cache",
          offline: true,
        }
      : { status: "loading", people: [], source: "none", offline: false };
  });

  const applyResult = useCallback(
    (result: GetCuratedPersonsResult, requestSequence: number) => {
      if (requestSequence !== requestSequenceRef.current) return;
      if (result.ok) {
        void saveDeviceRead(ownerId, "curator", result.value.data.people);
        setPeople({
          status: "ready",
          people: result.value.data.people,
          source: "live",
          offline: false,
        });
      } else if (
        result.kind === "network" ||
        (result.kind === "unexpected-response" && result.status >= 500)
      ) {
        setPeople((current) =>
          current.source !== "none"
            ? {
                status: "ready",
                people: current.people,
                source: "cache",
                offline: true,
              }
            : {
                status: "error",
                people: [],
                source: "none",
                offline: true,
                message: curationErrorMessage(result),
              },
        );
      } else {
        if (
          (result.kind === "http" || result.kind === "unexpected-response") &&
          result.status === 401
        ) {
          reportExpiredDeviceSession(ownerId);
        }
        setPeople({
          status: "error",
          people: [],
          source: "none",
          offline: false,
          message: curationErrorMessage(result),
        });
      }
    },
    [ownerId],
  );

  const requestPeople = useCallback(
    () => apiClient.getCuratedPersons(),
    [apiClient],
  );

  const load = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    setPeople((current) => ({
      status: current.people.length > 0 ? "ready" : "loading",
      people: current.people,
      source: current.people.length > 0 ? current.source : "none",
      offline: current.offline,
    }));
    const result = await requestPeople();
    applyResult(result, requestSequence);
    return result;
  }, [applyResult, requestPeople]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const attempt = ++requestSequenceRef.current;
      const cached = await loadDeviceRead(ownerId, "curator");
      if (!active || attempt !== requestSequenceRef.current) return;
      if (cached !== undefined) {
        setPeople((current) =>
          current.source === "live"
            ? current
            : {
                status: "ready",
                people: cached,
                source: "cache",
                offline: true,
              },
        );
      }
      if (!enabled) {
        if (cached === undefined)
          setPeople({
            status: "error",
            people: [],
            source: "none",
            offline: true,
            message: "No saved Curator on this device yet. Connect to load it.",
          });
        return;
      }
      const result = await requestPeople();
      if (active) applyResult(result, attempt);
    };
    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleRefresh();
    };
    window.addEventListener("online", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      active = false;
      requestSequenceRef.current += 1;
      window.removeEventListener("online", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [applyResult, enabled, ownerId, requestPeople]);

  const add = useCallback(
    async (input: CuratedPersonInput) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.createCuratedPerson(input);
      if (result.ok) {
        applyResult(result, requestSequence);
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
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.updateCuratedPerson(
        curatedPersonId,
        input,
      );
      if (result.ok) {
        applyResult(result, requestSequence);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  const remove = useCallback(
    async (
      curatedPersonId: string,
      input: Parameters<CuratedPersonApiClient["deleteCuratedPerson"]>[1],
    ) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.deleteCuratedPerson(
        curatedPersonId,
        input,
      );
      if (result.ok) {
        applyResult(result, requestSequence);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  const partyPeople = useMemo(
    () =>
      people.people
        .filter(
          (person) =>
            person.placement === "party" &&
            person.relationshipState !== "blocked",
        )
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  const tribePeople = useMemo(
    () =>
      people.people
        .filter(
          (person) =>
            person.placement === "tribe" &&
            person.relationshipState !== "blocked",
        )
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  const holdingPeople = useMemo(
    () =>
      people.people
        .filter(
          (person) =>
            person.placement === "holding" &&
            person.relationshipState !== "blocked",
        )
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  const blockedPeople = useMemo(
    () =>
      people.people
        .filter((person) => person.relationshipState === "blocked")
        .map(curatedPersonToCuratorPerson),
    [people.people],
  );

  return {
    add,
    blockedPeople,
    holdingPeople,
    load,
    partyPeople,
    remove,
    people,
    tribePeople,
    update,
  };
}
