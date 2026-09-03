import type {
  CareClaim,
  CareCompletion,
  CareDisposition,
  CareHistoryEntry,
  CareLifecycleState,
  CarePass,
  CarePersonId,
  CareSeenState,
  ReceiveCareRequest,
} from "@/types/careRequest";

export const CURRENT_CARE_VIEWER_ID: CarePersonId = "you";

export type CareLifecycleErrorCode =
  | "duplicate-record"
  | "invalid-request"
  | "request-not-found"
  | "request-closed"
  | "request-expired"
  | "request-not-visible"
  | "not-authorized"
  | "already-claimed"
  | "completion-required";

export type CareLifecycleAction =
  | { type: "publish-request"; request: ReceiveCareRequest }
  | {
      type: "withdraw-request";
      requestId: string;
      actorId: CarePersonId;
      withdrawnAt: string;
    }
  | { type: "mark-seen"; seenState: CareSeenState }
  | { type: "pass-request"; pass: CarePass }
  | { type: "claim-request"; claim: CareClaim }
  | { type: "record-completion"; completion: CareCompletion }
  | {
      type: "record-disposition";
      disposition: CareDisposition;
      successorRequest?: ReceiveCareRequest;
    }
  | { type: "expire-request"; requestId: string; expiredAt: string };

export type CareLifecycleTransition =
  | { ok: true; state: CareLifecycleState }
  | {
      ok: false;
      state: CareLifecycleState;
      error: CareLifecycleErrorCode;
    };

export function createCareLifecycleState(
  requests: ReceiveCareRequest[] = [],
): CareLifecycleState {
  return {
    requests,
    claims: [],
    passes: [],
    seenStates: [],
    completions: [],
    dispositions: [],
    history: [],
  };
}

function reject(
  state: CareLifecycleState,
  error: CareLifecycleErrorCode,
): CareLifecycleTransition {
  return { ok: false, state, error };
}

function accept(state: CareLifecycleState): CareLifecycleTransition {
  return { ok: true, state };
}

function hasValidTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function getRequest(state: CareLifecycleState, requestId: string) {
  return state.requests.find((request) => request.id === requestId);
}

function getClaim(state: CareLifecycleState, requestId: string) {
  return state.claims.find((claim) => claim.requestId === requestId);
}

function isTerminal(state: CareLifecycleState, requestId: string) {
  return state.history.some((entry) => entry.requestId === requestId);
}

export function isCareRequestExpired(request: ReceiveCareRequest, at: string) {
  return Date.parse(at) >= Date.parse(request.expiresAt);
}

function hasPassed(
  state: CareLifecycleState,
  requestId: string,
  actorId: CarePersonId,
) {
  return state.passes.some(
    (pass) => pass.requestId === requestId && pass.actorId === actorId,
  );
}

export function haveAllPartyMembersPassed(
  state: CareLifecycleState,
  request: ReceiveCareRequest,
) {
  return (
    request.audienceSnapshot.partyMemberIds.length > 0 &&
    request.audienceSnapshot.partyMemberIds.every((memberId) =>
      hasPassed(state, request.id, memberId),
    )
  );
}

export function isCareRequestVisibleOnTimeline(
  state: CareLifecycleState,
  request: ReceiveCareRequest,
  viewerId: CarePersonId,
  at: string,
) {
  if (isTerminal(state, request.id)) return false;

  const claim = getClaim(state, request.id);
  if (claim) {
    return viewerId === request.requester.id || viewerId === claim.claimerId;
  }

  if (isCareRequestExpired(request, at)) return false;

  if (viewerId === request.requester.id) return true;

  if (haveAllPartyMembersPassed(state, request)) {
    return request.audienceSnapshot.tribeMemberIds.includes(viewerId);
  }

  return (
    request.audienceSnapshot.partyMemberIds.includes(viewerId) &&
    !hasPassed(state, request.id, viewerId)
  );
}

export function selectTimelineCareRequests(
  state: CareLifecycleState,
  viewerId: CarePersonId,
  at: string,
) {
  return state.requests.filter((request) =>
    isCareRequestVisibleOnTimeline(state, request, viewerId, at),
  );
}

export function selectProfileCareRequests(
  state: CareLifecycleState,
  profileOwnerId: CarePersonId,
  viewerId: CarePersonId,
  at: string,
) {
  const visibleAuthoredRequests = state.requests.filter(
    (request) =>
      request.requester.id === profileOwnerId &&
      isCareRequestVisibleOnTimeline(state, request, viewerId, at),
  );

  if (viewerId !== profileOwnerId) return visibleAuthoredRequests;

  const privateClaimedRequests = state.requests.filter((request) => {
    const claim = getClaim(state, request.id);
    return (
      claim?.claimerId === profileOwnerId && !isTerminal(state, request.id)
    );
  });

  return [
    ...new Map(
      [...visibleAuthoredRequests, ...privateClaimedRequests].map((request) => [
        request.id,
        request,
      ]),
    ).values(),
  ];
}

function validateRequest(request: ReceiveCareRequest) {
  const partyIds = request.audienceSnapshot.partyMemberIds;
  const tribeIds = request.audienceSnapshot.tribeMemberIds;
  return (
    request.id.length > 0 &&
    hasValidTimestamp(request.createdAt) &&
    hasValidTimestamp(request.expiresAt) &&
    Date.parse(request.expiresAt) > Date.parse(request.createdAt) &&
    partyIds.length > 0 &&
    new Set(partyIds).size === partyIds.length &&
    new Set(tribeIds).size === tribeIds.length &&
    !partyIds.includes(request.requester.id)
  );
}

function historyEntry(
  requestId: string,
  ownerId: CarePersonId,
  outcome: CareHistoryEntry["outcome"],
  recordedAt: string,
  dispositionId?: string,
): CareHistoryEntry {
  return {
    id: `care-history-${requestId}-${ownerId}-${outcome}`,
    requestId,
    ownerId,
    outcome,
    recordedAt,
    ...(dispositionId ? { dispositionId } : {}),
  };
}

function participantIds(state: CareLifecycleState, requestId: string) {
  const request = getRequest(state, requestId);
  const claim = getClaim(state, requestId);
  if (!request || !claim) return [];
  return [request.requester.id, claim.claimerId];
}

function getActionRequestId(
  action: Exclude<CareLifecycleAction, { type: "publish-request" }>,
) {
  switch (action.type) {
    case "withdraw-request":
    case "expire-request":
      return action.requestId;
    case "mark-seen":
      return action.seenState.requestId;
    case "pass-request":
      return action.pass.requestId;
    case "claim-request":
      return action.claim.requestId;
    case "record-completion":
      return action.completion.requestId;
    case "record-disposition":
      return action.disposition.requestId;
  }
}

export function transitionCareLifecycle(
  state: CareLifecycleState,
  action: CareLifecycleAction,
): CareLifecycleTransition {
  if (action.type === "publish-request") {
    if (!validateRequest(action.request))
      return reject(state, "invalid-request");
    if (getRequest(state, action.request.id)) {
      return reject(state, "duplicate-record");
    }
    return accept({ ...state, requests: [action.request, ...state.requests] });
  }

  const requestId = getActionRequestId(action);
  const request = getRequest(state, requestId);
  if (!request) return reject(state, "request-not-found");
  if (isTerminal(state, requestId)) return reject(state, "request-closed");

  if (action.type === "withdraw-request") {
    if (action.actorId !== request.requester.id || getClaim(state, requestId)) {
      return reject(state, "not-authorized");
    }
    return accept({
      ...state,
      history: [
        ...state.history,
        historyEntry(
          requestId,
          action.actorId,
          "withdrawn",
          action.withdrawnAt,
        ),
      ],
    });
  }

  if (action.type === "expire-request") {
    if (
      getClaim(state, requestId) ||
      !isCareRequestExpired(request, action.expiredAt)
    ) {
      return reject(state, "request-expired");
    }
    return accept({
      ...state,
      history: [
        ...state.history,
        historyEntry(
          requestId,
          request.requester.id,
          "expired",
          action.expiredAt,
        ),
      ],
    });
  }

  if (action.type === "mark-seen") {
    if (
      state.seenStates.some(
        (seen) =>
          seen.requestId === requestId &&
          seen.viewerId === action.seenState.viewerId,
      )
    ) {
      return reject(state, "duplicate-record");
    }
    if (
      !isCareRequestVisibleOnTimeline(
        state,
        request,
        action.seenState.viewerId,
        action.seenState.seenAt,
      )
    ) {
      return reject(state, "request-not-visible");
    }
    return accept({
      ...state,
      seenStates: [...state.seenStates, action.seenState],
    });
  }

  if (action.type === "pass-request") {
    if (getClaim(state, requestId)) return reject(state, "already-claimed");
    if (
      !request.audienceSnapshot.partyMemberIds.includes(action.pass.actorId)
    ) {
      return reject(state, "not-authorized");
    }
    if (hasPassed(state, requestId, action.pass.actorId)) {
      return reject(state, "duplicate-record");
    }
    if (isCareRequestExpired(request, action.pass.passedAt)) {
      return reject(state, "request-expired");
    }
    return accept({ ...state, passes: [...state.passes, action.pass] });
  }

  if (action.type === "claim-request") {
    if (getClaim(state, requestId)) return reject(state, "already-claimed");
    if (action.claim.claimerId === request.requester.id) {
      return reject(state, "not-authorized");
    }
    if (isCareRequestExpired(request, action.claim.claimedAt)) {
      return reject(state, "request-expired");
    }
    if (
      !isCareRequestVisibleOnTimeline(
        state,
        request,
        action.claim.claimerId,
        action.claim.claimedAt,
      )
    ) {
      return reject(state, "request-not-visible");
    }
    return accept({ ...state, claims: [...state.claims, action.claim] });
  }

  if (action.type === "record-completion") {
    const claim = getClaim(state, requestId);
    if (!claim) return reject(state, "not-authorized");
    const participants = [request.requester.id, claim.claimerId];
    if (!participants.includes(action.completion.participantId)) {
      return reject(state, "not-authorized");
    }
    if (
      state.completions.some(
        (completion) =>
          completion.requestId === requestId &&
          completion.participantId === action.completion.participantId,
      )
    ) {
      return reject(state, "duplicate-record");
    }

    const completions = [...state.completions, action.completion];
    const bothCompleted = participants.every((participantId) =>
      completions.some(
        (completion) =>
          completion.requestId === requestId &&
          completion.participantId === participantId &&
          completion.decision === "completed",
      ),
    );
    return accept({
      ...state,
      completions,
      history: bothCompleted
        ? [
            ...state.history,
            ...participants.map((participantId) =>
              historyEntry(
                requestId,
                participantId,
                "completed",
                action.completion.decidedAt,
              ),
            ),
          ]
        : state.history,
    });
  }

  if (action.type === "record-disposition") {
    const participants = participantIds(state, requestId);
    if (!participants.includes(action.disposition.actorId)) {
      return reject(state, "not-authorized");
    }
    const actorMarkedNotCompleted = state.completions.some(
      (completion) =>
        completion.requestId === requestId &&
        completion.participantId === action.disposition.actorId &&
        completion.decision === "not-completed",
    );
    if (!actorMarkedNotCompleted || !action.disposition.reason.trim()) {
      return reject(state, "completion-required");
    }
    const needsSuccessor = action.disposition.kind !== "close";
    if (
      needsSuccessor !== Boolean(action.successorRequest) ||
      (!needsSuccessor &&
        action.disposition.successorRequestId !== undefined) ||
      (action.successorRequest &&
        action.disposition.successorRequestId !== action.successorRequest.id) ||
      (action.successorRequest && !validateRequest(action.successorRequest)) ||
      (action.successorRequest && getRequest(state, action.successorRequest.id))
    ) {
      return reject(state, "invalid-request");
    }
    return accept({
      ...state,
      requests: action.successorRequest
        ? [action.successorRequest, ...state.requests]
        : state.requests,
      dispositions: [...state.dispositions, action.disposition],
      history: [
        ...state.history,
        ...participants.map((participantId) =>
          historyEntry(
            requestId,
            participantId,
            "not-completed",
            action.disposition.disposedAt,
            action.disposition.id,
          ),
        ),
      ],
    });
  }

  return reject(state, "invalid-request");
}
