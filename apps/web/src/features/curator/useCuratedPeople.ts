import { createInitials } from "@/lib/personPresentation";
import {
  createApiClient,
  type ApiClient,
  type CuratedPersonInput,
  type GetCuratedPersonsResponse,
  type GetCuratedPersonsResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  deviceOwnerGeneration,
  reportExpiredDeviceSession,
  loadDeviceRead,
} from "@/lib/deviceReadStorage";
import {
  changeCuratorDevice,
  enqueueCurator,
  privateFields,
  readCuratorDevice,
  type CuratorOperation,
  type CuratorDeviceState,
  type CuratorFields,
} from "@/lib/curatorOutbox";
import { synchronizeCurator } from "./synchronizeCurator";
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
  const [people, setPeople] = useState<CuratedPeopleState>({
    status: "loading",
    people: [],
    source: "none",
    offline: true,
  });
  const [operations, setOperations] = useState<CuratorOperation[]>([]);
  const [deviceReady, setDeviceReady] = useState(false);
  const [deviceError, setDeviceError] = useState<string>();
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const requestSequence = useRef(0);
  const deviceRevision = useRef(0);
  const live = useRef(enabled);
  const active = useRef(true);
  useEffect(() => {
    live.current = enabled;
  }, [enabled]);
  const publish = useCallback(
    (state: CuratorDeviceState, offline?: boolean) => {
      if (!active.current) return;
      deviceRevision.current++;
      setOperations(state.operations);
      setAliases(state.aliases);
      setDeviceReady(true);
      setDeviceError(undefined);
      setPeople((current) => ({
        status: "ready",
        people: state.people,
        source: (offline ?? current.offline) ? "cache" : "live",
        offline: offline ?? current.offline,
      }));
    },
    [],
  );
  const isLive = useCallback(
    () =>
      active.current &&
      live.current &&
      navigator.onLine &&
      deviceOwnerGeneration(ownerId) !== null,
    [ownerId],
  );
  const sync = useCallback(
    () =>
      synchronizeCurator(ownerId, apiClient, isLive, publish).catch((error) => {
        if (active.current)
          setDeviceError(
            error instanceof Error
              ? error.message
              : "Could not save the synchronization result on this device.",
          );
      }),
    [apiClient, isLive, ownerId, publish],
  );
  const load = useCallback(async () => {
    const sequence = ++requestSequence.current;
    const generation = deviceOwnerGeneration(ownerId);
    const current = () =>
      active.current &&
      sequence === requestSequence.current &&
      generation !== null &&
      generation === deviceOwnerGeneration(ownerId);
    try {
      const saved = await readCuratorDevice(ownerId);
      if (current()) publish(saved);
    } catch (error) {
      const cached = await loadDeviceRead(ownerId, "curator");
      if (current()) {
        setDeviceReady(false);
        setDeviceError(
          error instanceof Error
            ? error.message
            : "Device storage is unavailable.",
        );
        if (cached)
          setPeople({
            status: "ready",
            people: cached,
            source: "cache",
            offline: true,
          });
      }
    }
    if (!current()) return;
    if (!isLive()) return;
    const revision = deviceRevision.current;
    const result = await apiClient.getCuratedPersons();
    if (!isLive() || !current()) return result;
    if (revision !== deviceRevision.current) return result;
    if (result.ok) {
      try {
        const saved = await changeCuratorDevice(ownerId, (state) => {
          if (current()) state.base = [...result.value.data.people];
        });
        if (!current()) return result;
        publish(saved, false);
        await sync();
      } catch (error) {
        if (current()) {
          setDeviceReady(false);
          setPeople({
            status: "ready",
            people: result.value.data.people,
            source: "live",
            offline: false,
          });
          setDeviceError(
            error instanceof Error
              ? error.message
              : "Device storage is unavailable.",
          );
        }
      }
    } else if (result.kind !== "network" && result.status === 401)
      reportExpiredDeviceSession(ownerId);
    else
      setPeople((current) => ({
        ...current,
        status: "ready",
        source: "cache",
        offline: true,
      }));
    return result;
  }, [apiClient, isLive, ownerId, publish, sync]);
  const invalidateRequests = useCallback(() => {
    requestSequence.current++;
  }, []);
  useEffect(() => {
    active.current = true;
    void Promise.resolve().then(load);
    const refresh = () => {
      void load();
    };
    const visible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active.current = false;
      invalidateRequests();
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load, enabled, invalidateRequests]);
  const queue = useCallback(
    async (
      kind: CuratorOperation["kind"],
      personId: string,
      fields: Partial<CuratorFields>,
    ): Promise<GetCuratedPersonsResult> => {
      try {
        const saved = await enqueueCurator(ownerId, kind, personId, fields);
        publish(saved.state);
        void sync();
        return {
          ok: true,
          status: 200,
          value: {
            apiVersion: "v1",
            data: {
              people: saved.state.people,
              changedPersonId: saved.personId,
            },
          },
        };
      } catch (error) {
        return {
          ok: false,
          kind: "http",
          status: 400,
          error: {
            apiVersion: "v1",
            error: {
              code: "VALIDATION_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Your device could not save this change.",
            },
          },
        };
      }
    },
    [ownerId, publish, sync],
  );
  const add = useCallback(
    (input: CuratedPersonInput) => queue("create", "", privateFields(input)),
    [queue],
  );
  const update = useCallback(
    (
      id: string,
      input: Partial<CuratorFields> & { expectedVersion: number },
    ) => {
      const fields = Object.fromEntries(
        Object.entries(input).filter(([key]) => key !== "expectedVersion"),
      ) as Partial<CuratorFields>;
      return queue("update", id, fields);
    },
    [queue],
  );
  const remove = useCallback((id: string) => queue("delete", id, {}), [queue]);
  const retryOperation = async (id: string) => {
    try {
      publish(
        await changeCuratorDevice(ownerId, (state) => {
          const operation = state.operations.find(
            (operation) => operation.id === id,
          );
          if (operation) {
            operation.status = "pending";
            operation.error = undefined;
          }
        }),
      );
      await sync();
    } catch (error) {
      setDeviceError(
        error instanceof Error ? error.message : "Could not retry this change.",
      );
    }
  };
  const discardOperation = async (id: string) => {
    try {
      publish(
        await changeCuratorDevice(ownerId, (state) => {
          const operation = state.operations.find(
            (operation) => operation.id === id,
          );
          state.operations = state.operations.filter(
            (candidate) =>
              candidate.id !== id &&
              !(
                operation?.kind === "create" &&
                candidate.personId === operation.personId
              ),
          );
        }),
      );
      await load();
    } catch (error) {
      setDeviceError(
        error instanceof Error
          ? error.message
          : "Could not discard this change.",
      );
    }
  };
  const records = useMemo(() => {
    return people.people.map((person) => {
      const pending = operations.filter(
        (operation) => operation.personId === person.id,
      );
      return {
        ...curatedPersonToCuratorPerson(person),
        syncStatus: pending.length
          ? pending.some((operation) => operation.status === "rejected")
            ? ("rejected" as const)
            : ("pending" as const)
          : undefined,
      };
    });
  }, [people.people, operations]);
  const partyPeople = useMemo(
    () =>
      records.filter(
        (person) =>
          person.placement === "party" &&
          person.relationshipState !== "blocked",
      ),
    [records],
  );
  const tribePeople = useMemo(
    () =>
      records.filter(
        (person) =>
          person.placement === "tribe" &&
          person.relationshipState !== "blocked",
      ),
    [records],
  );
  const holdingPeople = useMemo(
    () =>
      records.filter(
        (person) =>
          person.placement === "holding" &&
          person.relationshipState !== "blocked",
      ),
    [records],
  );
  const blockedPeople = useMemo(
    () => records.filter((person) => person.relationshipState === "blocked"),
    [records],
  );
  return {
    add,
    update,
    remove,
    load,
    people,
    operations,
    aliases,
    deviceReady,
    deviceError,
    retryOperation,
    discardOperation,
    partyPeople,
    tribePeople,
    holdingPeople,
    blockedPeople,
  };
}
