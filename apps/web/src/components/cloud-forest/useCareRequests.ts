import {
  createApiClient,
  type ApiClient,
  type ClaimCareRequestResult,
  type CreateCareRequestInput,
  type CreateCareRequestResult,
  type GetCareRequestsResult,
  type GetCareRequestsResponse,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useState } from "react";

import type { ReceiveCareRequest } from "@/types/careRequest";

export type CareRequestApiClient = Pick<
  ApiClient,
  "getCareRequests" | "createCareRequest" | "claimCareRequest"
>;

type CareRequestOperationResult =
  | GetCareRequestsResult
  | CreateCareRequestResult
  | ClaimCareRequestResult;
type CareRequestRecord = GetCareRequestsResponse["data"]["requests"][number];

export type CareRequestsState =
  | { status: "loading"; requests: ReceiveCareRequest[]; message?: string }
  | { status: "ready"; requests: ReceiveCareRequest[]; message?: string }
  | { status: "error"; requests: ReceiveCareRequest[]; message: string };

const defaultApiClient: CareRequestApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

function toReceiveCareRequest(
  request: CareRequestRecord,
  viewerPersonId: string,
): ReceiveCareRequest {
  return {
    id: request.id,
    kind: "meal",
    direction: "receive",
    need: "A meal",
    helpfulWhen: request.helpfulWhen,
    foodWorks: request.foodWorks,
    foodDoesNotWork: request.foodDoesNotWork,
    handoffStyle: request.handoffStyle,
    audience: "Party",
    audienceSnapshot: { partyMemberIds: [], tribeMemberIds: [] },
    status: request.status,
    createdAt: request.createdAt,
    ...(request.claimedAt ? { claimedAt: request.claimedAt } : {}),
    requester: {
      kind: request.requester.personId === viewerPersonId ? "self" : "party",
      id: request.requester.personId,
      displayName: request.requester.displayName,
    },
    ...(request.claimant
      ? {
          claimant: {
            id: request.claimant.personId,
            displayName: request.claimant.displayName,
          },
        }
      : {}),
  };
}

export function careRequestErrorMessage(
  result: Exclude<CareRequestOperationResult, { ok: true }>,
) {
  if (result.kind === "network") {
    return "Cloud Forest couldn’t reach shared Care. Try again when you’re ready.";
  }
  if (result.kind === "http") {
    if (result.status === 401) {
      return "Your Cloud Forest session has ended. Please sign in again.";
    }
    if (result.status === 409) {
      return "Someone else claimed this Care request first.";
    }
    if (result.status === 404) {
      return "This Care request is no longer available.";
    }
    return result.error.error.message;
  }
  return "Shared Care is temporarily unavailable. Try again when you’re ready.";
}

export function useCareRequests(
  apiClient: CareRequestApiClient = defaultApiClient,
  viewerPersonId = "",
) {
  const [state, setState] = useState<CareRequestsState>({
    status: "loading",
    requests: [],
  });

  const applyResult = useCallback(
    (result: CareRequestOperationResult) => {
      if (result.ok) {
        setState({
          status: "ready",
          requests: result.value.data.requests.map((request) =>
            toReceiveCareRequest(request, viewerPersonId),
          ),
        });
        return;
      }
      setState((current) => ({
        status: "error",
        requests: current.requests,
        message: careRequestErrorMessage(result),
      }));
    },
    [viewerPersonId],
  );

  const load = useCallback(async () => {
    setState((current) => ({
      status: current.requests.length > 0 ? "ready" : "loading",
      requests: current.requests,
      ...(current.message ? { message: current.message } : {}),
    }));
    const result = await apiClient.getCareRequests();
    applyResult(result);
    return result;
  }, [apiClient, applyResult]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void apiClient.getCareRequests().then((result) => {
        if (active) applyResult(result);
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
    async (input: CreateCareRequestInput) => {
      const result = await apiClient.createCareRequest(input);
      if (result.ok) applyResult(result);
      return result;
    },
    [apiClient, applyResult],
  );

  const claim = useCallback(
    async (careRequestId: string) => {
      const result = await apiClient.claimCareRequest({ careRequestId });
      if (result.ok) applyResult(result);
      else if (
        result.kind === "http" &&
        (result.status === 404 || result.status === 409)
      ) {
        const latest = await apiClient.getCareRequests();
        applyResult(latest);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  return { claim, create, load, state };
}
