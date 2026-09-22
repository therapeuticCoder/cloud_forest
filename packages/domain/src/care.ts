export const careCategoryIds = [
  "transportation",
  "food",
  "pet-care",
  "child-care",
  "urgent-shelter",
  "help-at-home",
  "executive-function-support",
  "get-out-of-the-house",
] as const;

export type CareCategoryId = (typeof careCategoryIds)[number];

export type CareDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const careDays: readonly CareDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export type CareTime = "morning" | "afternoon" | "evening";

export type CareDirection = "give" | "receive";

export type CareStatus =
  | "open"
  | "claimed"
  | "orphaned"
  | "completed"
  | "expired"
  | "not_completed";

export const careTimes: readonly CareTime[] = [
  "morning",
  "afternoon",
  "evening",
];

export type CareCategoryDefinition = {
  id: CareCategoryId;
  name: string;
  description: string;
  receiveWording?: string;
  giveWording?: string;
  receiveQuestion?: string;
  giveQuestion?: string;
  receiveOptions?: readonly string[];
  giveOptions?: readonly string[];
};

export const careCategories: readonly CareCategoryDefinition[] = [
  {
    id: "transportation",
    name: "Transportation",
    description: "Transportation help from someone in your community.",
    receiveQuestion: "What kind of transportation help do you need?",
    giveQuestion: "What kind of transportation help can you offer?",
    receiveOptions: [
      "Give me a ride",
      "Pick something up for me",
      "Drop something off for me",
      "Come with me somewhere",
      "Help transport something",
    ],
    giveOptions: [
      "Give someone a ride",
      "Pick something up",
      "Drop something off",
      "Go somewhere with someone",
      "Help transport something",
    ],
  },
  {
    id: "food",
    name: "Food",
    description: "A single meal for someone who needs one.",
    receiveWording: "I need a meal.",
    giveWording: "I can provide a meal.",
  },
  {
    id: "pet-care",
    name: "Pet care",
    description: "Short-term help caring for a pet.",
    receiveQuestion: "What kind of pet care do you need?",
    giveQuestion: "What kind of pet care can you offer?",
    receiveOptions: [
      "Feed / water",
      "Walk",
      "Check in / spend time",
      "Short-term pet sitting",
    ],
    giveOptions: [
      "Feed / water",
      "Walk",
      "Check in / spend time",
      "Short-term pet sitting",
    ],
  },
  {
    id: "child-care",
    name: "Child care",
    description: "Short, practical help caring for a child.",
    receiveQuestion: "What kind of child care do you need?",
    giveQuestion: "What kind of child care can you offer?",
    receiveOptions: ["Pick up / drop off", "Babysit, under 4 hours"],
    giveOptions: ["Pick up / drop off", "Babysit, under 4 hours"],
  },
  {
    id: "urgent-shelter",
    name: "Urgent shelter",
    description: "A safe place to stay for one night.",
    receiveQuestion: "What kind of urgent shelter do you need?",
    giveQuestion: "What kind of urgent shelter can you offer?",
    receiveOptions: ["One night, just bedding", "One night, with shower"],
    giveOptions: ["One night, just bedding", "One night, with shower"],
  },
  {
    id: "help-at-home",
    name: "Help at home",
    description: "Practical help making home life more manageable.",
    receiveQuestion: "What kind of help at home do you need?",
    giveQuestion: "What kind of help at home can you offer?",
    receiveOptions: ["Cleaning", "Organizing", "Chores", "Home project help"],
    giveOptions: ["Cleaning", "Organizing", "Chores", "Home project help"],
  },
  {
    id: "executive-function-support",
    name: "Executive function support",
    description:
      "Practical support for getting started, staying engaged, or making a plan.",
    receiveQuestion: "What kind of executive function support do you need?",
    giveQuestion: "What kind of executive function support can you offer?",
    receiveOptions: [
      "Body doubling",
      "Accountability buddy",
      "Power hour planning",
    ],
    giveOptions: [
      "Body doubling",
      "Accountability buddy",
      "Power hour planning",
    ],
  },
  {
    id: "get-out-of-the-house",
    name: "Get out of the house",
    description: "Low-pressure company for getting out into the world.",
    receiveQuestion: "What would you like to do?",
    giveQuestion: "What would you like to offer?",
    receiveOptions: [
      "Go for a walk",
      "Grab a coffee",
      "Local game store",
      "Movie",
      "Shopping",
      "Come with me somewhere",
    ],
    giveOptions: [
      "Go for a walk",
      "Grab a coffee",
      "Local game store",
      "Movie",
      "Shopping",
      "Go somewhere with someone",
    ],
  },
];

export function getCareCategory(category: CareCategoryId) {
  return careCategories.find((candidate) => candidate.id === category);
}

export function isCareCategory(value: string): value is CareCategoryId {
  return careCategoryIds.includes(value as CareCategoryId);
}

export function isValidCareSubtype(category: CareCategoryId, subtype: string) {
  const definition = getCareCategory(category);
  if (!definition?.receiveOptions && !definition?.giveOptions) {
    return subtype === "";
  }
  return Boolean(
    definition.receiveOptions?.includes(subtype) ||
    definition.giveOptions?.includes(subtype),
  );
}

export type CareExpiration = "1h" | "4h" | "1d" | "1w";

export const careExpirationMs: Record<CareExpiration, number> = {
  "1h": 60 * 60 * 1_000,
  "4h": 4 * 60 * 60 * 1_000,
  "1d": 24 * 60 * 60 * 1_000,
  "1w": 7 * 24 * 60 * 60 * 1_000,
};

export function isActiveCareStatus(status: CareStatus) {
  return status === "open" || status === "claimed";
}

// Resolves participant roles only; current relationship access is server-owned.
// Callers must use one identity namespace consistently (User IDs or Person IDs).
export function careRole(
  direction: CareDirection,
  originatorId: string,
  participantId: string | null | undefined,
  viewerId: string,
): CareDirection | undefined {
  if (viewerId === originatorId) return direction;
  if (viewerId === participantId)
    return direction === "give" ? "receive" : "give";
  return undefined;
}
