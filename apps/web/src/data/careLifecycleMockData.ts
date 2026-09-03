import type { CareAudienceSnapshot } from "@/types/careRequest";

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
