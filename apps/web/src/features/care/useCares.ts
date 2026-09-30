import { toCare } from "./careAdapter";
import {
  createApiClient,
  type ApiClient,
  type ClaimCareResult,
  type CompleteCareResult,
  type CreateCareInput,
  type CreateCareResult,
  type GetCaresResult,
  type PassCareResult,
  type RecordCareGratitudeResult,
  type WithdrawCareResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Care } from "@/types/care";
import {
  loadDeviceRead,
  saveDeviceRead,
  reportExpiredDeviceSession,
} from "@/lib/deviceReadStorage";

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

export type CaresState = (
  | { status: "loading"; cares: Care[]; message?: string }
  | { status: "ready"; cares: Care[]; message?: string }
  | {
      status: "error";
      cares: Care[];
      errorCode: number | "NETWORK";
      message: string;
    }
) & { offline: boolean; source: "cache" | "live" | "none" };

function offlineCareResult() {
  return {
    ok: false as const,
    kind: "network" as const,
    cause: new Error("Shared Care requires a live connection."),
  };
}

const defaultApiClient: CareApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

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

export function useCares(
  apiClient: CareApiClient = defaultApiClient,
  refreshKey = "",
  ownerId = "",
  enabled = true,
) {
  const [state, setState] = useState<CaresState>({
    status: "loading",
    cares: [],
    offline: true,
    source: "none",
  });
  const requestSequenceRef = useRef(0);

  const applyResult = useCallback(
    (result: CareOperationResult, requestSequence: number) => {
      if (requestSequence !== requestSequenceRef.current) return;
      if (result.ok) {
        void saveDeviceRead(ownerId, "care", result.value.data.cares);
        setState({
          status: "ready",
          cares: result.value.data.cares.map(toCare),
          offline: false,
          source: "live",
        });
        return;
      }
      const recoverable =
        result.kind === "network" ||
        (result.kind === "unexpected-response" && result.status >= 500);
      if (result.kind !== "network" && result.status === 401)
        reportExpiredDeviceSession(ownerId);
      setState((current) =>
        recoverable && current.source !== "none"
          ? {
              ...current,
              status: "ready",
              source: "cache",
              offline: true,
            }
          : {
              status: "error",
              cares: recoverable ? current.cares : [],
              source: recoverable ? current.source : "none",
              offline: recoverable,
              errorCode: careErrorCode(result),
              message: careErrorMessage(result),
            },
      );
    },
    [ownerId],
  );

  const load = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    setState((current) => ({
      ...current,
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
    const refresh = async () => {
      const requestSequence = ++requestSequenceRef.current;
      const cached = await loadDeviceRead(ownerId, "care");
      if (!active || requestSequence !== requestSequenceRef.current) return;
      if (cached !== undefined)
        setState((current) =>
          current.source === "live"
            ? current
            : {
                status: "ready",
                cares: cached.map(toCare),
                source: "cache",
                offline: true,
              },
        );
      if (!enabled) {
        if (cached === undefined)
          setState({
            status: "error",
            cares: [],
            source: "none",
            offline: true,
            errorCode: "NETWORK",
            message: "No saved Care on this device yet. Connect to load it.",
          });
        return;
      }
      const result = await apiClient.getCares();
      if (active) applyResult(result, requestSequence);
    };
    void refresh();
    const handleFocus = () => {
      void refresh();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      requestSequenceRef.current += 1;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [apiClient, applyResult, enabled, ownerId, refreshKey]);

  const create = useCallback(
    async (input: CreateCareInput) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
      const result = await apiClient.createCare(input);
      if (result.ok) applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult, enabled, state.offline],
  );

  const claim = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
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
    [apiClient, applyResult, enabled, state.offline],
  );

  const pass = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
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
    [apiClient, applyResult, enabled, state.offline],
  );

  const complete = useCallback(
    async (careId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
      const result = await apiClient.completeCare({ careId });
      applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult, enabled, state.offline],
  );

  const recordGratitude = useCallback(
    async (
      careId: string,
      input: Parameters<CareApiClient["recordCareGratitude"]>[1],
    ) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
      const result = await apiClient.recordCareGratitude({ careId }, input);
      if (result.ok) applyResult(result, requestSequence);
      else if (result.kind === "http" && result.status === 409) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      } else applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult, enabled, state.offline],
  );

  const withdraw = useCallback(
    async (
      careId: string,
      input: Parameters<CareApiClient["withdrawCare"]>[1],
    ) => {
      const requestSequence = ++requestSequenceRef.current;
      if (!enabled || state.offline || !navigator.onLine)
        return offlineCareResult();
      const result = await apiClient.withdrawCare({ careId }, input);
      if (result.ok) applyResult(result, requestSequence);
      else if (result.kind === "http" && result.status === 404) {
        const latest = await apiClient.getCares();
        applyResult(latest, requestSequence);
      } else applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult, enabled, state.offline],
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
