import {
  createApiClient,
  type ApiClient,
  type ClaimCareResult,
  type CompleteCareResult,
  type CreateCareInput,
  type CreateCareResult,
  type GetCaresResponse,
  type GetCaresResult,
  type PassCareResult,
  type RecordCareGratitudeResult,
  type WithdrawCareResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Care } from "@/types/care";

export type CareApiClient = Pick<
  ApiClient,
  | "getCares"
  | "createCare"
  | "claimCare"
  | "passCare"
  | "completeCare"
  | "withdrawCare"
  | "recordCareGratitude"
>;

type CareOperationResult =
  | GetCaresResult
  | CreateCareResult
  | ClaimCareResult
  | PassCareResult
  | CompleteCareResult
  | WithdrawCareResult
  | RecordCareGratitudeResult;
type CareRecord = GetCaresResponse["data"]["cares"][number];

export type CaresState =
  | { status: "loading"; cares: Care[]; message?: string }
  | { status: "ready"; cares: Care[]; message?: string }
  | {
      status: "error";
      cares: Care[];
      errorCode: number | "NETWORK";
      message: string;
    };

const defaultApiClient: CareApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

function toCare(record: CareRecord): Care {
  return {
    id: record.id,
    direction: record.direction,
    category: record.category,
    subtype: record.subtype,
    days: [...record.days],
    times: [...record.times],
    timeNote: record.timeNote,
    location: record.location,
    requirements: record.requirements,
    sensitivities: record.sensitivities,
    audience: record.audience,
    status: record.status,
    createdAt: record.createdAt,
    ...(record.claimedAt ? { claimedAt: record.claimedAt } : {}),
    ...(record.originatorCompletedAt
      ? { originatorCompletedAt: record.originatorCompletedAt }
      : {}),
    ...(record.participantCompletedAt
      ? { participantCompletedAt: record.participantCompletedAt }
      : {}),
    ...(record.completedAt ? { completedAt: record.completedAt } : {}),
    ...(record.notCompletedAt ? { notCompletedAt: record.notCompletedAt } : {}),
    ...(record.expiresAt ? { expiresAt: record.expiresAt } : {}),
    ...(record.expiredAt ? { expiredAt: record.expiredAt } : {}),
    ...(record.gratitude ? { gratitude: record.gratitude } : {}),
    ...(record.apology ? { apology: record.apology } : {}),
    originator: {
      id: record.originator.personId,
      displayName: record.originator.displayName,
    },
    ...(record.participant
      ? {
          participant: {
            id: record.participant.personId,
            displayName: record.participant.displayName,
          },
        }
      : {}),
  };
}

export function careErrorMessage(
  result: Exclude<CareOperationResult, { ok: true }>,
) {
  if (result.kind === "network") {
    return "Cloud Forest couldn’t reach shared Care. Try again when you’re ready.";
  }
  if (result.kind === "http") {
    if (result.status === 401) {
      return "Your Cloud Forest session has ended. Please sign in again.";
    }
    if (result.status === 409) {
      return "Someone else claimed this Care first.";
    }
    if (result.status === 404) {
      return "This Care is no longer available.";
    }
    return result.error.error.message;
  }
  return "Shared Care is temporarily unavailable. Try again when you’re ready.";
}

function careErrorCode(result: Exclude<CareOperationResult, { ok: true }>) {
  return result.kind === "network" ? ("NETWORK" as const) : result.status;
}

export function careGratitudeErrorMessage(
  result: Exclude<RecordCareGratitudeResult, { ok: true }>,
) {
  if (result.kind === "http" && result.status === 409) {
    return "Gratitude has already been saved for this Care.";
  }
  return careErrorMessage(result);
}

export function useCares(apiClient: CareApiClient = defaultApiClient) {
  const [state, setState] = useState<CaresState>({
    status: "loading",
    cares: [],
  });
  const requestSequenceRef = useRef(0);

  const applyResult = useCallback(
    (result: CareOperationResult, requestSequence: number) => {
      if (requestSequence !== requestSequenceRef.current) return;
      if (result.ok) {
        setState({
          status: "ready",
          cares: result.value.data.cares.map(toCare),
        });
        return;
      }
      setState((current) => ({
        status: "error",
        cares: current.cares,
        errorCode: careErrorCode(result),
        message: careErrorMessage(result),
      }));
    },
    [],
  );

  const load = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    setState((current) => ({
      status: current.cares.length > 0 ? "ready" : "loading",
      cares: current.cares,
      ...(current.message ? { message: current.message } : {}),
    }));
    const result = await apiClient.getCares();
    applyResult(result, requestSequence);
    return result;
  }, [apiClient, applyResult]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      const requestSequence = ++requestSequenceRef.current;
      void apiClient.getCares().then((result) => {
        if (active) applyResult(result, requestSequence);
      });
    };
    refresh();
    const handleFocus = () => refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [apiClient, applyResult]);

  const create = useCallback(
    async (input: CreateCareInput) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.createCare(input);
      if (result.ok) applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const claim = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.claimCare({ careId });
      if (result.ok) applyResult(result, requestSequence);
      else if (
        result.kind === "http" &&
        (result.status === 404 || result.status === 409)
      ) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  const pass = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.passCare({ careId });
      if (result.ok) applyResult(result, requestSequence);
      else if (
        result.kind === "http" &&
        (result.status === 404 || result.status === 409)
      ) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      } else applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const complete = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.completeCare({ careId });
      applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const recordGratitude = useCallback(
    async (
      careId: string,
      input: Parameters<CareApiClient["recordCareGratitude"]>[1],
    ) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.recordCareGratitude({ careId }, input);
      if (result.ok) applyResult(result, requestSequence);
      else if (result.kind === "http" && result.status === 409) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      } else applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const withdraw = useCallback(
    async (
      careId: string,
      input: Parameters<CareApiClient["withdrawCare"]>[1],
    ) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.withdrawCare({ careId }, input);
      if (result.ok) applyResult(result, requestSequence);
      else if (result.kind === "http" && result.status === 404) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      } else applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  return {
    claim,
    complete,
    create,
    load,
    pass,
    recordGratitude,
    state,
    withdraw,
  };
}
