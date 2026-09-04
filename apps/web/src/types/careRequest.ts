export type CareRequester =
  | { kind: "self"; id: "you"; displayName: "You" }
  | { kind: "party"; id: string; displayName: string };

export type CarePersonId = string;

export type CareAudienceSnapshot = {
  partyMemberIds: CarePersonId[];
  tribeMemberIds: CarePersonId[];
};

export type ReceiveCareRequest = {
  id: string;
  kind: "meal";
  direction: "receive";
  need: "A meal";
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
  audience: "Party";
  audienceSnapshot: CareAudienceSnapshot;
  status: "open";
  createdAt: string;
  expiresAt: string;
  requester: CareRequester;
};

export type CareClaim = {
  id: string;
  requestId: string;
  claimerId: CarePersonId;
  claimedAt: string;
};

export type LegacyCareClaim = {
  listingId: string;
  state: "claimed";
  claimedAt: string;
};

export type CarePass = {
  id: string;
  requestId: string;
  actorId: CarePersonId;
  passedAt: string;
};

export type CareSeenState = {
  id: string;
  requestId: string;
  viewerId: CarePersonId;
  seenAt: string;
  minimized: boolean;
};

export type CareCompletionDecision = "completed" | "not-completed";

export type CareCompletion = {
  id: string;
  requestId: string;
  participantId: CarePersonId;
  decision: CareCompletionDecision;
  decidedAt: string;
};

export type CareDispositionKind = "close" | "postpone" | "retry";

export type CareDisposition = {
  id: string;
  requestId: string;
  actorId: CarePersonId;
  kind: CareDispositionKind;
  reason: string;
  disposedAt: string;
  successorRequestId?: string;
};

export type CareHistoryOutcome =
  | "completed"
  | "not-completed"
  | "expired"
  | "withdrawn";

export type CareHistoryEntry = {
  id: string;
  requestId: string;
  ownerId: CarePersonId;
  outcome: CareHistoryOutcome;
  recordedAt: string;
  dispositionId?: string;
};

export type CareGratitude = {
  id: string;
  requestId: string;
  receiverId: CarePersonId;
  giverId: CarePersonId;
  statementId: string;
  message: string;
  postToTimeline: boolean;
  anonymized: boolean;
  createdAt: string;
};

export type CareLifecycleState = {
  requests: ReceiveCareRequest[];
  claims: CareClaim[];
  passes: CarePass[];
  seenStates: CareSeenState[];
  completions: CareCompletion[];
  dispositions: CareDisposition[];
  history: CareHistoryEntry[];
};

export type GiveCareOffer = {
  id: string;
  kind: "meal";
  direction: "give";
  offer: "A meal";
  mealDescription: string;
  availableWhen: string;
  handoffStyle: string;
  audience: "Party";
  status: "available";
  createdAt: string;
};
