import type {
  CareClaim,
  CareCompletion,
  CareDisposition,
  CareHistoryEntry,
  CareGratitude,
  CareLifecycleState,
  CarePass,
  CareSeenState,
  ReceiveCareRequest,
} from "@/types/careRequest";

import { loadCareClaims } from "./careClaimStorage";
import {
  createCareLifecycleState,
  CURRENT_CARE_VIEWER_ID,
} from "./careLifecycle";

export const CARE_LIFECYCLE_STORAGE_KEY = "cloud-forest:care-lifecycle:v2";

type StoredCareLifecycleV2 = Omit<
  CareLifecycleState,
  "requests" | "gratitudes"
> & {
  version: 2;
  gratitudes?: CareGratitude[];
};

function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isClaim(value: unknown): value is CareClaim {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.claimerId) &&
    isTimestamp(value.claimedAt)
  );
}

function isPass(value: unknown): value is CarePass {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.actorId) &&
    isTimestamp(value.passedAt)
  );
}

function isSeenState(value: unknown): value is CareSeenState {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.viewerId) &&
    isTimestamp(value.seenAt) &&
    typeof value.minimized === "boolean"
  );
}

function isCompletion(value: unknown): value is CareCompletion {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.participantId) &&
    (value.decision === "completed" || value.decision === "not-completed") &&
    isTimestamp(value.decidedAt)
  );
}

function isDisposition(value: unknown): value is CareDisposition {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.actorId) &&
    (value.kind === "close" ||
      value.kind === "postpone" ||
      value.kind === "retry") &&
    typeof value.reason === "string" &&
    isTimestamp(value.disposedAt) &&
    (value.successorRequestId === undefined ||
      isString(value.successorRequestId))
  );
}

function isHistoryEntry(value: unknown): value is CareHistoryEntry {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.ownerId) &&
    (value.outcome === "completed" ||
      value.outcome === "not-completed" ||
      value.outcome === "expired" ||
      value.outcome === "withdrawn") &&
    isTimestamp(value.recordedAt) &&
    (value.dispositionId === undefined || isString(value.dispositionId))
  );
}

function isGratitude(value: unknown): value is CareGratitude {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.receiverId) &&
    isString(value.giverId) &&
    isString(value.statementId) &&
    typeof value.message === "string" &&
    typeof value.postToTimeline === "boolean" &&
    typeof value.anonymized === "boolean" &&
    isTimestamp(value.createdAt)
  );
}

function isStoredCareLifecycleV2(
  value: unknown,
): value is StoredCareLifecycleV2 {
  if (!isRecord(value) || value.version !== 2) return false;
  return (
    Array.isArray(value.claims) &&
    value.claims.every(isClaim) &&
    Array.isArray(value.passes) &&
    value.passes.every(isPass) &&
    Array.isArray(value.seenStates) &&
    value.seenStates.every(isSeenState) &&
    Array.isArray(value.completions) &&
    value.completions.every(isCompletion) &&
    Array.isArray(value.dispositions) &&
    value.dispositions.every(isDisposition) &&
    Array.isArray(value.history) &&
    value.history.every(isHistoryEntry) &&
    (value.gratitudes === undefined ||
      (Array.isArray(value.gratitudes) && value.gratitudes.every(isGratitude)))
  );
}

function keepKnownRequests<T extends { requestId: string }>(
  records: T[],
  requestIds: Set<string>,
) {
  return records.filter((record) => requestIds.has(record.requestId));
}

export function loadCareLifecycleState(
  requests: ReceiveCareRequest[],
): CareLifecycleState {
  const emptyState = createCareLifecycleState(requests);
  const storage = getBrowserStorage();
  if (!storage) return emptyState;

  try {
    const storedValue = storage.getItem(CARE_LIFECYCLE_STORAGE_KEY);
    if (storedValue) {
      const parsed: unknown = JSON.parse(storedValue);
      if (!isStoredCareLifecycleV2(parsed)) return emptyState;

      const requestIds = new Set(requests.map((request) => request.id));
      return {
        requests,
        claims: keepKnownRequests(parsed.claims, requestIds),
        passes: keepKnownRequests(parsed.passes, requestIds),
        seenStates: keepKnownRequests(parsed.seenStates, requestIds),
        completions: keepKnownRequests(parsed.completions, requestIds),
        dispositions: keepKnownRequests(parsed.dispositions, requestIds),
        history: keepKnownRequests(parsed.history, requestIds),
        gratitudes: keepKnownRequests(parsed.gratitudes ?? [], requestIds),
      };
    }

    const requestIds = new Set(requests.map((request) => request.id));
    const migratedClaims = loadCareClaims()
      .filter((claim) => requestIds.has(claim.listingId))
      .map(
        (claim): CareClaim => ({
          id: `care-claim-${claim.listingId}-${CURRENT_CARE_VIEWER_ID}`,
          requestId: claim.listingId,
          claimerId: CURRENT_CARE_VIEWER_ID,
          claimedAt: claim.claimedAt,
        }),
      );
    return { ...emptyState, claims: migratedClaims };
  } catch {
    return emptyState;
  }
}

export function saveCareLifecycleState(state: CareLifecycleState) {
  try {
    const storage = getBrowserStorage();
    if (!storage) return;

    const existingValue = storage.getItem(CARE_LIFECYCLE_STORAGE_KEY);
    if (existingValue) {
      const parsed: unknown = JSON.parse(existingValue);
      if (!isStoredCareLifecycleV2(parsed)) return;
    }

    const stored: StoredCareLifecycleV2 = {
      version: 2,
      claims: state.claims,
      passes: state.passes,
      seenStates: state.seenStates,
      completions: state.completions,
      dispositions: state.dispositions,
      history: state.history,
      gratitudes: state.gratitudes,
    };
    storage.setItem(CARE_LIFECYCLE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // The in-memory prototype remains usable when browser storage is unavailable.
  }
}
