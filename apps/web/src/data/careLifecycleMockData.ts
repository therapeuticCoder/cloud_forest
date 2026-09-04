import type { CareAudienceSnapshot, CarePersonId } from "@/types/careRequest";

export const carePrototypePeople = {
  currentUser: "you",
  requester: "anya",
  partyMembers: ["you", "mira", "sol", "dev"],
  tribeMembers: [
    "nearby-family-1",
    "old-friends-1",
    "workshop-1",
    "neighbors-1",
  ],
} as const;

export const incomingCareAudienceSnapshot: CareAudienceSnapshot = {
  partyMemberIds: [...carePrototypePeople.partyMembers],
  tribeMemberIds: [...carePrototypePeople.tribeMembers],
};

export type CarePerspectiveOption = {
  id: CarePersonId;
  displayName: string;
  role: "Requester" | "Party" | "Tribe";
};

export const carePerspectiveOptions: CarePerspectiveOption[] = [
  { id: "you", displayName: "You", role: "Party" },
  { id: "anya", displayName: "Anya Reed", role: "Requester" },
  { id: "mira", displayName: "Mira Vale", role: "Party" },
  { id: "sol", displayName: "Sol Arden", role: "Party" },
  { id: "dev", displayName: "Dev Rowan", role: "Party" },
  { id: "nearby-family-1", displayName: "Ari Vale", role: "Tribe" },
];
