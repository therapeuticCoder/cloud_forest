export type CareRequester =
  | { kind: "self"; id: string; displayName: string }
  | { kind: "party"; id: string; displayName: string };

export type CarePersonId = string;
export type CareAudience = "Party" | "Tribe";
export type CareExpiration = "1h" | "4h" | "1d" | "1w";

export const careExpirationOptions: Array<{
  label: string;
  value: CareExpiration;
}> = [
  { label: "1 hour", value: "1h" },
  { label: "4 hours", value: "4h" },
  { label: "1 day", value: "1d" },
  { label: "1 week", value: "1w" },
];

export type CarePublicPerson = {
  id: CarePersonId;
  displayName: string;
};

export type CareAudienceSnapshot = {
  partyMemberIds: CarePersonId[];
  tribeMemberIds: CarePersonId[];
};

export type ReceiveCareRequest = {
  id: string;
  kind: "meal";
  direction: "receive" | "give";
  need: "A meal";
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
  audience: CareAudience;
  audienceSnapshot: CareAudienceSnapshot;
  status:
    | "open"
    | "claimed"
    | "orphaned"
    | "completed"
    | "expired"
    | "not_completed";
  createdAt: string;
  claimedAt?: string;
  requesterCompletedAt?: string;
  claimantCompletedAt?: string;
  completedAt?: string;
  notCompletedAt?: string;
  expiresAt?: string;
  gratitude?: CareHistoryGratitude;
  apology?: CareHistoryApology;
  expiredAt?: string;
  requester: CareRequester;
  claimant?: CarePublicPerson;
};

export type CareHistoryGratitude = {
  statementId:
    | "meal-fed-when-needed"
    | "meal-care-felt-easy"
    | "meal-seen-and-supported";
  message: string;
  createdAt: string;
};

export type CareHistoryApology = {
  statementId:
    | "meal-sorry-cant-follow-through"
    | "meal-something-changed"
    | "meal-sorry-committed";
  message: string;
  createdAt: string;
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
  | "withdrawn"
  | "orphaned";

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
  gratitudes: CareGratitude[];
};

export type GiveCareOffer = {
  id: string;
  kind: "meal";
  direction: "give";
  offer: "A meal";
  mealDescription: string;
  availableWhen: string;
  handoffStyle: string;
  audience: CareAudience;
  status: "available" | "expired";
  createdAt: string;
  expiresAt?: string;
  expiredAt?: string;
  giver: CarePublicPerson;
};
