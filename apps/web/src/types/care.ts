import type {
  CareCategoryId,
  CareDay,
  CareDirection,
  CareStatus,
  CareTime,
} from "@cloud-forest/domain";

export type {
  CareCategoryId,
  CareDay,
  CareDirection,
  CareStatus,
  CareTime,
} from "@cloud-forest/domain";

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

export type Care = {
  id: string;
  direction: CareDirection;
  category: CareCategoryId;
  subtype: string;
  days: CareDay[];
  times: CareTime[];
  timeNote: string;
  location: string;
  requirements: string;
  sensitivities: string;
  audience: CareAudience;
  status: CareStatus;
  createdAt: string;
  claimedAt?: string;
  originatorCompletedAt?: string;
  participantCompletedAt?: string;
  completedAt?: string;
  notCompletedAt?: string;
  expiresAt?: string;
  expiredAt?: string;
  gratitude?: CareHistoryGratitude;
  apology?: CareHistoryApology;
  originator: CarePublicPerson;
  participant?: CarePublicPerson;
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
