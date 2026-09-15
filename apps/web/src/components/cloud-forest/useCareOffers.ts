import {
  createApiClient,
  type ApiClient,
  type ClaimCareOfferResult,
  type CreateCareOfferInput,
  type CreateCareOfferResult,
  type GetCareOffersResponse,
  type GetCareOffersResult,
  type WithdrawCareOfferResult,
} from "@cloud-forest/api-client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GiveCareOffer } from "@/types/careRequest";

export type CareOfferApiClient = Pick<
  ApiClient,
  "getCareOffers" | "createCareOffer" | "withdrawCareOffer" | "claimCareOffer"
>;

type CareOfferOperationResult =
  | GetCareOffersResult
  | CreateCareOfferResult
  | WithdrawCareOfferResult
  | ClaimCareOfferResult;
type CareOfferRecord = GetCareOffersResponse["data"]["offers"][number];

export type CareOffersState =
  | { status: "loading"; offers: GiveCareOffer[]; message?: string }
  | { status: "ready"; offers: GiveCareOffer[]; message?: string }
  | { status: "error"; offers: GiveCareOffer[]; message: string };

const defaultApiClient: CareOfferApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

function toGiveCareOffer(offer: CareOfferRecord): GiveCareOffer {
  return {
    id: offer.id,
    kind: "meal",
    direction: "give",
    offer: "A meal",
    mealDescription: offer.mealDescription,
    availableWhen: offer.availableWhen,
    handoffStyle: offer.handoffStyle,
    audience: "Party",
    status: "available",
    createdAt: offer.createdAt,
    giver: {
      id: offer.giver.personId,
      displayName: offer.giver.displayName,
    },
  };
}

export function careOfferErrorMessage(
  result: Exclude<CareOfferOperationResult, { ok: true }>,
) {
  if (result.kind === "network") {
    return "Cloud Forest couldn’t reach shared Give. Try again when you’re ready.";
  }
  if (result.kind === "http") {
    if (result.status === 401) {
      return "Your Cloud Forest session has ended. Please sign in again.";
    }
    return result.error.error.message;
  }
  return "Shared Give is temporarily unavailable. Try again when you’re ready.";
}

export function useCareOffers(
  apiClient: CareOfferApiClient = defaultApiClient,
) {
  const [state, setState] = useState<CareOffersState>({
    status: "loading",
    offers: [],
  });
  const requestSequenceRef = useRef(0);

  const applyResult = useCallback(
    (result: CareOfferOperationResult, requestSequence: number) => {
      if (requestSequence !== requestSequenceRef.current) return;
      if (result.ok) {
        setState({
          status: "ready",
          offers: result.value.data.offers.map(toGiveCareOffer),
        });
        return;
      }
      setState((current) => ({
        status: "error",
        offers: current.offers,
        message: careOfferErrorMessage(result),
      }));
    },
    [],
  );

  const load = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    setState((current) => ({
      status: current.offers.length > 0 ? "ready" : "loading",
      offers: current.offers,
      ...(current.message ? { message: current.message } : {}),
    }));
    const result = await apiClient.getCareOffers();
    applyResult(result, requestSequence);
    return result;
  }, [apiClient, applyResult]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      const requestSequence = ++requestSequenceRef.current;
      void apiClient.getCareOffers().then((result) => {
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
    async (input: CreateCareOfferInput) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.createCareOffer(input);
      if (result.ok) applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const withdraw = useCallback(
    async (careOfferId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.withdrawCareOffer({ careOfferId });
      applyResult(result, requestSequence);
      return result;
    },
    [apiClient, applyResult],
  );

  const claim = useCallback(
    async (careOfferId: string) => {
      const requestSequence = ++requestSequenceRef.current;
      const result = await apiClient.claimCareOffer({ careOfferId });
      if (result.ok) {
        applyResult(result, requestSequence);
      } else if (
        result.kind === "http" &&
        (result.status === 404 || result.status === 409)
      ) {
        const latest = await apiClient.getCareOffers();
        applyResult(latest, requestSequence);
      } else {
        applyResult(result, requestSequence);
      }
      return result;
    },
    [apiClient, applyResult],
  );

  return { claim, create, load, state, withdraw };
}
