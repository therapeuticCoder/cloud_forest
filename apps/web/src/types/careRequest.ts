export type CareRequester =
  | { kind: "self"; id: "you"; displayName: "You" }
  | { kind: "party"; id: string; displayName: string };

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
  status: "open";
  createdAt: string;
  requester: CareRequester;
};

export type CareClaim = {
  listingId: string;
  state: "claimed";
  claimedAt: string;
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
