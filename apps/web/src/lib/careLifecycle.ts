import type {
  CareClaim,
  CareCompletion,
  CareDisposition,
  CareHistoryEntry,
  CareGratitude,
  CareLifecycleState,
  CarePass,
  CarePersonId,
  CareSeenState,
  ReceiveCareRequest,
} from "@/types/careRequest";

export const CURRENT_CARE_VIEWER_ID: CarePersonId = "you";

export type CareLifecycleErrorCode =
  | "duplicate-record"
  | "invalid-action"
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
  | {
      type: "set-seen-minimized";
      requestId: string;
      viewerId: CarePersonId;
      minimized: boolean;
      changedAt: string;
    }
  | { type: "pass-request"; pass: CarePass }
  | { type: "claim-request"; claim: CareClaim }
  | { type: "record-completion"; completion: CareCompletion }
  | { type: "record-gratitude"; gratitude: CareGratitude }
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
    gratitudes: [],
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

function hasValidIdentity(value: string) {
  return typeof value === "string" && value.trim().length > 0;
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

export function canPassCareRequest(
  state: CareLifecycleState,
  requestId: string,
  viewerId: CarePersonId,
  at: string,
) {
  const request = getRequest(state, requestId);
  return Boolean(
    hasValidTimestamp(at) &&
    request &&
    !isTerminal(state, requestId) &&
    !getClaim(state, requestId) &&
    !isCareRequestExpired(request, at) &&
    request.audienceSnapshot.partyMemberIds.includes(viewerId) &&
    !hasPassed(state, requestId, viewerId),
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

export function selectCareRequestPresentation(
  state: CareLifecycleState,
  requestId: string,
  viewerId: CarePersonId,
) {
  const seenState = state.seenStates.find(
    (seen) => seen.requestId === requestId && seen.viewerId === viewerId,
  );
  return {
    seen: Boolean(seenState),
    minimized: seenState?.minimized ?? false,
  };
}

export function selectPrivateCareHistory(
  state: CareLifecycleState,
  ownerId: CarePersonId,
  viewerId: CarePersonId,
) {
  if (ownerId !== viewerId) return [];
  return state.history.filter((entry) => entry.ownerId === ownerId);
}

export function selectPrivateCareGratitudes(
  state: CareLifecycleState,
  ownerId: CarePersonId,
  viewerId: CarePersonId,
) {
  if (ownerId !== viewerId) return [];
  return state.gratitudes.filter(
    (gratitude) =>
      gratitude.receiverId === ownerId || gratitude.giverId === ownerId,
  );
}

export function selectTribeCareGratitudes(state: CareLifecycleState) {
  return state.gratitudes.filter((gratitude) => gratitude.postToTimeline);
}

export function expireDueCareRequests(state: CareLifecycleState, at: string) {
  if (!hasValidTimestamp(at)) return state;
  return state.requests.reduce((currentState, request) => {
    if (
      getClaim(currentState, request.id) ||
      isTerminal(currentState, request.id) ||
      !isCareRequestExpired(request, at)
    ) {
      return currentState;
    }

    const transition = transitionCareLifecycle(currentState, {
      type: "expire-request",
      requestId: request.id,
      expiredAt: at,
    });
    return transition.ok ? transition.state : currentState;
  }, state);
}

export function selectNextCareRequestExpiration(
  state: CareLifecycleState,
  at: string,
) {
  const now = Date.parse(at);
  if (!Number.isFinite(now)) return undefined;
  return state.requests.reduce<number | undefined>((nextExpiry, request) => {
    const expiresAt = Date.parse(request.expiresAt);
    if (
      getClaim(state, request.id) ||
      isTerminal(state, request.id) ||
      expiresAt <= now ||
      (nextExpiry !== undefined && nextExpiry <= expiresAt)
    ) {
      return nextExpiry;
    }
    return expiresAt;
  }, undefined);
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
    hasValidIdentity(request.id) &&
    hasValidIdentity(request.requester.id) &&
    hasValidTimestamp(request.createdAt) &&
    hasValidTimestamp(request.expiresAt) &&
    Date.parse(request.expiresAt) > Date.parse(request.createdAt) &&
    partyIds.length > 0 &&
    partyIds.every(hasValidIdentity) &&
    tribeIds.every(hasValidIdentity) &&
    new Set(partyIds).size === partyIds.length &&
    new Set(tribeIds).size === tribeIds.length &&
    !partyIds.includes(request.requester.id)
  );
}

function validateAction(
  action: Exclude<CareLifecycleAction, { type: "publish-request" }>,
) {
  switch (action.type) {
    case "withdraw-request":
      return (
        hasValidIdentity(action.requestId) &&
        hasValidIdentity(action.actorId) &&
        hasValidTimestamp(action.withdrawnAt)
      );
    case "expire-request":
      return (
        hasValidIdentity(action.requestId) &&
        hasValidTimestamp(action.expiredAt)
      );
    case "mark-seen":
      return (
        hasValidIdentity(action.seenState.id) &&
        hasValidIdentity(action.seenState.requestId) &&
        hasValidIdentity(action.seenState.viewerId) &&
        hasValidTimestamp(action.seenState.seenAt) &&
        typeof action.seenState.minimized === "boolean"
      );
    case "set-seen-minimized":
      return (
        hasValidIdentity(action.requestId) &&
        hasValidIdentity(action.viewerId) &&
        typeof action.minimized === "boolean" &&
        hasValidTimestamp(action.changedAt)
      );
    case "pass-request":
      return (
        hasValidIdentity(action.pass.id) &&
        hasValidIdentity(action.pass.requestId) &&
        hasValidIdentity(action.pass.actorId) &&
        hasValidTimestamp(action.pass.passedAt)
      );
    case "claim-request":
      return (
        hasValidIdentity(action.claim.id) &&
        hasValidIdentity(action.claim.requestId) &&
        hasValidIdentity(action.claim.claimerId) &&
        hasValidTimestamp(action.claim.claimedAt)
      );
    case "record-completion":
      return (
        hasValidIdentity(action.completion.id) &&
        hasValidIdentity(action.completion.requestId) &&
        hasValidIdentity(action.completion.participantId) &&
        (action.completion.decision === "completed" ||
          action.completion.decision === "not-completed") &&
        hasValidTimestamp(action.completion.decidedAt)
      );
    case "record-gratitude":
      return (
        hasValidIdentity(action.gratitude.id) &&
        hasValidIdentity(action.gratitude.requestId) &&
        hasValidIdentity(action.gratitude.receiverId) &&
        hasValidIdentity(action.gratitude.giverId) &&
        hasValidIdentity(action.gratitude.statementId) &&
        typeof action.gratitude.message === "string" &&
        typeof action.gratitude.postToTimeline === "boolean" &&
        typeof action.gratitude.anonymized === "boolean" &&
        hasValidTimestamp(action.gratitude.createdAt)
      );
    case "record-disposition":
      return (
        hasValidIdentity(action.disposition.id) &&
        hasValidIdentity(action.disposition.requestId) &&
        hasValidIdentity(action.disposition.actorId) &&
        (action.disposition.kind === "close" ||
          action.disposition.kind === "postpone" ||
          action.disposition.kind === "retry") &&
        typeof action.disposition.reason === "string" &&
        hasValidTimestamp(action.disposition.disposedAt) &&
        (action.disposition.successorRequestId === undefined ||
          hasValidIdentity(action.disposition.successorRequestId))
      );
  }
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
    case "set-seen-minimized":
      return action.requestId;
    case "pass-request":
      return action.pass.requestId;
    case "claim-request":
      return action.claim.requestId;
    case "record-completion":
      return action.completion.requestId;
    case "record-gratitude":
      return action.gratitude.requestId;
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

  if (!validateAction(action)) return reject(state, "invalid-action");

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

  if (action.type === "set-seen-minimized") {
    const seenState = state.seenStates.find(
      (seen) =>
        seen.requestId === requestId && seen.viewerId === action.viewerId,
    );
    if (!seenState) return reject(state, "request-not-found");
    if (
      !isCareRequestVisibleOnTimeline(
        state,
        request,
        action.viewerId,
        action.changedAt,
      )
    ) {
      return reject(state, "request-not-visible");
    }
    if (seenState.minimized === action.minimized) {
      return accept(state);
    }
    return accept({
      ...state,
      seenStates: state.seenStates.map((seen) =>
        seen === seenState ? { ...seen, minimized: action.minimized } : seen,
      ),
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

  if (action.type === "record-gratitude") {
    const claim = getClaim(state, requestId);
    if (
      !claim ||
      action.gratitude.receiverId !== request.requester.id ||
      action.gratitude.giverId !== claim.claimerId
    ) {
      return reject(state, "not-authorized");
    }
    if (
      state.gratitudes.some((gratitude) => gratitude.requestId === requestId)
    ) {
      return reject(state, "duplicate-record");
    }
    return accept({
      ...state,
      gratitudes: [...state.gratitudes, action.gratitude],
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
