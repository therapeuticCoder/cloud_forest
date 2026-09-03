import type { ReceiveCareRequest } from "@/types/careRequest";

export const incomingCareRequests: ReceiveCareRequest[] = [
  {
    id: "care-request-anya-meal-001",
    kind: "meal",
    direction: "receive",
    need: "A meal",
    helpfulWhen: "Thursday evening",
    foodWorks: "Rice, roasted vegetables, or soup",
    foodDoesNotWork: "Nothing spicy",
    handoffStyle: "Leave it at my door",
    audience: "Party",
    status: "open",
    createdAt: "2026-09-02T20:30:00.000Z",
    requester: {
      kind: "party",
      id: "anya",
      displayName: "Anya Reed",
    },
  },
];
