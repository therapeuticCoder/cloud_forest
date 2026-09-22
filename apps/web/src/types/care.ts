import type {
  CareCategoryId,
  CareDay,
  CareDirection,
  CareStatus,
  CareExpiration,
  CareGratitudeStatementId,
  CareWithdrawalStatementId,
  CareTime,
} from "@cloud-forest/domain";

export type {
  CareCategoryId,
  CareDay,
  CareDirection,
  CareStatus,
  CareExpiration,
  CareGratitudeStatementId,
  CareWithdrawalStatementId,
  CareTime,
} from "@cloud-forest/domain";

export type CarePersonId = string;
export type CareAudience = "Party" | "Tribe";

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
  statementId: CareGratitudeStatementId;
  message: string;
  createdAt: string;
};

export type CareHistoryApology = {
  statementId: CareWithdrawalStatementId;
  message: string;
  createdAt: string;
};

export type CareWizardDirection = CareDirection;

export type CareDraft = {
  category: CareCategoryId;
  subtype: string;
  days: CareDay[];
  times: CareTime[];
  timeNote: string;
  location: string;
  requirements: string;
  sensitivities: string;
  expiresIn: CareExpiration;
  audience: CareAudience;
};
