import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

import {
  getCareCategory,
  isCareCategory,
  isValidCareSubtype as isCatalogCareSubtype,
} from "@cloud-forest/domain";

export const careApiVersion = "v1" as const;

const id = Type.String({ minLength: 1, maxLength: 128 });
const displayName = Type.String({ minLength: 1, maxLength: 200 });
const careCategory = Type.Union([
  Type.Literal("transportation"),
  Type.Literal("food"),
  Type.Literal("pet-care"),
  Type.Literal("child-care"),
  Type.Literal("urgent-shelter"),
  Type.Literal("help-at-home"),
  Type.Literal("executive-function-support"),
  Type.Literal("get-out-of-the-house"),
]);
const careDay = Type.Union([
  Type.Literal("monday"),
  Type.Literal("tuesday"),
  Type.Literal("wednesday"),
  Type.Literal("thursday"),
  Type.Literal("friday"),
  Type.Literal("saturday"),
  Type.Literal("sunday"),
]);
const careTime = Type.Union([
  Type.Literal("morning"),
  Type.Literal("afternoon"),
  Type.Literal("evening"),
]);
const careSubtype = Type.String({ maxLength: 200 });
const careDays = Type.Array(careDay, { maxItems: 7 });
const careTimes = Type.Array(careTime, { maxItems: 3 });
const timeNote = Type.String({ maxLength: 500 });
const location = Type.String({ minLength: 1, maxLength: 500 });
const requirements = Type.String({ maxLength: 10_000 });
const sensitivities = Type.String({ maxLength: 10_000 });
const dateTime = Type.String({ format: "date-time" });
export const careExpiration = Type.Union([
  Type.Literal("1h"),
  Type.Literal("4h"),
  Type.Literal("1d"),
  Type.Literal("1w"),
]);
const careAudience = Type.Union([Type.Literal("Party"), Type.Literal("Tribe")]);
const careDirection = Type.Union([
  Type.Literal("give"),
  Type.Literal("receive"),
]);
const careStatus = Type.Union([
  Type.Literal("open"),
  Type.Literal("claimed"),
  Type.Literal("orphaned"),
  Type.Literal("completed"),
  Type.Literal("expired"),
  Type.Literal("not_completed"),
]);
const careGratitudeStatementId = Type.Union([
  Type.Literal("meal-fed-when-needed"),
  Type.Literal("meal-care-felt-easy"),
  Type.Literal("meal-seen-and-supported"),
]);
const careApologyStatementId = Type.Union([
  Type.Literal("meal-sorry-cant-follow-through"),
  Type.Literal("meal-something-changed"),
  Type.Literal("meal-sorry-committed"),
]);

export const carePersonSchema = Type.Object(
  { personId: id, displayName },
  { additionalProperties: false },
);

const careGratitude = Type.Object(
  {
    statementId: careGratitudeStatementId,
    message: Type.String({ maxLength: 1_000 }),
    createdAt: dateTime,
  },
  { additionalProperties: false },
);
const careApology = Type.Object(
  {
    statementId: careApologyStatementId,
    message: Type.String({ maxLength: 1_000 }),
    createdAt: dateTime,
  },
  { additionalProperties: false },
);

export const careSchema = Type.Object(
  {
    id,
    direction: careDirection,
    category: careCategory,
    subtype: careSubtype,
    days: careDays,
    times: careTimes,
    timeNote,
    location,
    requirements,
    sensitivities,
    audience: careAudience,
    status: careStatus,
    createdAt: dateTime,
    claimedAt: Type.Optional(dateTime),
    originatorCompletedAt: Type.Optional(dateTime),
    participantCompletedAt: Type.Optional(dateTime),
    completedAt: Type.Optional(dateTime),
    notCompletedAt: Type.Optional(dateTime),
    expiresAt: Type.Optional(dateTime),
    expiredAt: Type.Optional(dateTime),
    gratitude: Type.Optional(careGratitude),
    apology: Type.Optional(careApology),
    originator: carePersonSchema,
    participant: Type.Optional(carePersonSchema),
  },
  { additionalProperties: false },
);

export const createCareBodySchema = Type.Object(
  {
    direction: careDirection,
    category: Type.Optional(careCategory),
    subtype: Type.Optional(careSubtype),
    days: Type.Optional(careDays),
    times: Type.Optional(careTimes),
    timeNote: Type.Optional(timeNote),
    location: Type.Optional(location),
    requirements: Type.Optional(requirements),
    sensitivities: Type.Optional(sensitivities),
    audience: Type.Optional(careAudience),
    expiresIn: careExpiration,
  },
  { additionalProperties: false },
);

export const caresSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(careApiVersion),
    data: Type.Object(
      { cares: Type.Array(careSchema) },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const careErrorSchema = Type.Object(
  {
    apiVersion: Type.Literal(careApiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("UNAUTHORIZED"),
          Type.Literal("NOT_FOUND"),
          Type.Literal("VALIDATION_ERROR"),
          Type.Literal("ALREADY_CLAIMED"),
          Type.Literal("ALREADY_RECORDED"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const caresPath = "/api/v1/cares";
export const careParamsSchema = Type.Object(
  { careId: id },
  { additionalProperties: false },
);
export const careClaimPath = "/api/v1/cares/:careId/claim";
export const carePassPath = "/api/v1/cares/:careId/pass";
export const careCompletePath = "/api/v1/cares/:careId/complete";
export const careGratitudePath = "/api/v1/cares/:careId/gratitude";
export const careWithdrawPath = "/api/v1/cares/:careId/withdraw";
export const createCareGratitudeBodySchema = Type.Object(
  {
    statementId: careGratitudeStatementId,
    message: Type.String({ maxLength: 1_000 }),
  },
  { additionalProperties: false },
);
export const createCareWithdrawalBodySchema = Type.Object(
  {
    statementId: careApologyStatementId,
    message: Type.String({ maxLength: 1_000 }),
  },
  { additionalProperties: false },
);

export type CarePerson = Static<typeof carePersonSchema>;
export type CareCategory = Static<typeof careCategory>;
export type CareDay = Static<typeof careDay>;
export type CareTime = Static<typeof careTime>;
export type Care = Static<typeof careSchema>;
export type CreateCareBody = Static<typeof createCareBodySchema>;
export type CreateCareGratitudeBody = Static<
  typeof createCareGratitudeBodySchema
>;
export type CreateCareWithdrawalBody = Static<
  typeof createCareWithdrawalBodySchema
>;
export type CaresSuccessResponse = Static<typeof caresSuccessSchema>;
export type CareErrorResponse = Static<typeof careErrorSchema>;

export function isValidCareSelection(category: string, subtype: string) {
  return isCareCategory(category) && isCatalogCareSubtype(category, subtype);
}

export function careCategoryName(category: CareCategory) {
  return getCareCategory(category)?.name ?? "Care";
}

export const isCaresSuccessResponse = (
  value: unknown,
): value is CaresSuccessResponse => Compile(caresSuccessSchema).Check(value);

export const isCareErrorResponse = (
  value: unknown,
): value is CareErrorResponse => Compile(careErrorSchema).Check(value);
