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
const helpfulWhen = Type.String({ minLength: 1, maxLength: 500 });
const foodWorks = Type.String({ minLength: 1, maxLength: 10_000 });
const foodDoesNotWork = Type.String({ maxLength: 10_000 });
const handoffStyle = Type.String({ minLength: 1, maxLength: 200 });
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
const careDays = Type.Array(careDay, { minItems: 1, maxItems: 7 });
const careTimes = Type.Array(careTime, { minItems: 1, maxItems: 3 });
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
const careGratitudeStatementId = Type.Union([
  Type.Literal("meal-fed-when-needed"),
  Type.Literal("meal-care-felt-easy"),
  Type.Literal("meal-seen-and-supported"),
]);
const careGratitude = Type.Object(
  {
    statementId: careGratitudeStatementId,
    message: Type.String({ maxLength: 1_000 }),
    createdAt: dateTime,
  },
  { additionalProperties: false },
);
const careApologyStatementId = Type.Union([
  Type.Literal("meal-sorry-cant-follow-through"),
  Type.Literal("meal-something-changed"),
  Type.Literal("meal-sorry-committed"),
]);
const careApology = Type.Object(
  {
    statementId: careApologyStatementId,
    message: Type.String({ maxLength: 1_000 }),
    createdAt: dateTime,
  },
  { additionalProperties: false },
);

export const carePersonSchema = Type.Object(
  { personId: id, displayName },
  { additionalProperties: false },
);

export const careRequestSchema = Type.Object(
  {
    id,
    kind: Type.Union([Type.Literal("meal"), careCategory]),
    direction: Type.Union([Type.Literal("receive"), Type.Literal("give")]),
    need: Type.String({ minLength: 1, maxLength: 200 }),
    category: Type.Optional(careCategory),
    subtype: Type.Optional(careSubtype),
    days: Type.Optional(careDays),
    times: Type.Optional(careTimes),
    timeNote: Type.Optional(timeNote),
    location: Type.Optional(location),
    requirements: Type.Optional(requirements),
    sensitivities: Type.Optional(sensitivities),
    helpfulWhen,
    foodWorks,
    foodDoesNotWork,
    handoffStyle,
    audience: careAudience,
    status: Type.Union([
      Type.Literal("open"),
      Type.Literal("claimed"),
      Type.Literal("orphaned"),
      Type.Literal("completed"),
      Type.Literal("expired"),
      Type.Literal("not_completed"),
    ]),
    createdAt: dateTime,
    claimedAt: Type.Optional(dateTime),
    requesterCompletedAt: Type.Optional(dateTime),
    claimantCompletedAt: Type.Optional(dateTime),
    completedAt: Type.Optional(dateTime),
    notCompletedAt: Type.Optional(dateTime),
    expiresAt: Type.Optional(dateTime),
    expiredAt: Type.Optional(dateTime),
    gratitude: Type.Optional(careGratitude),
    apology: Type.Optional(careApology),
    requester: carePersonSchema,
    claimant: Type.Optional(carePersonSchema),
  },
  { additionalProperties: false },
);

export const createCareRequestBodySchema = Type.Object(
  {
    category: Type.Optional(careCategory),
    subtype: Type.Optional(careSubtype),
    days: Type.Optional(careDays),
    times: Type.Optional(careTimes),
    timeNote: Type.Optional(timeNote),
    location: Type.Optional(location),
    requirements: Type.Optional(requirements),
    sensitivities: Type.Optional(sensitivities),
    audience: Type.Optional(careAudience),
    helpfulWhen,
    foodWorks,
    foodDoesNotWork,
    handoffStyle,
    expiresIn: careExpiration,
  },
  { additionalProperties: false },
);

export const careRequestsSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(careApiVersion),
    data: Type.Object(
      { requests: Type.Array(careRequestSchema) },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const careRequestErrorSchema = Type.Object(
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

export const careRequestsPath = "/api/v1/care-requests";
export const careRequestPath = "/api/v1/care-requests/:careRequestId";
export const careRequestClaimPath =
  "/api/v1/care-requests/:careRequestId/claim";
export const careRequestPassPath = "/api/v1/care-requests/:careRequestId/pass";
export const careRequestCompletePath =
  "/api/v1/care-requests/:careRequestId/complete";
export const careRequestGratitudePath =
  "/api/v1/care-requests/:careRequestId/gratitude";
export const careRequestWithdrawPath =
  "/api/v1/care-requests/:careRequestId/withdraw";
export const careRequestParamsSchema = Type.Object(
  { careRequestId: id },
  { additionalProperties: false },
);
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
export type CareRequest = Static<typeof careRequestSchema>;
export type CreateCareRequestBody = Static<typeof createCareRequestBodySchema>;
export type CreateCareGratitudeBody = Static<
  typeof createCareGratitudeBodySchema
>;
export type CreateCareWithdrawalBody = Static<
  typeof createCareWithdrawalBodySchema
>;
export type CareRequestsSuccessResponse = Static<
  typeof careRequestsSuccessSchema
>;
export type CareRequestErrorResponse = Static<typeof careRequestErrorSchema>;

export function isValidCareSelection(category: string, subtype: string) {
  return isCareCategory(category) && isCatalogCareSubtype(category, subtype);
}

export function careCategoryName(category: CareCategory) {
  return getCareCategory(category)?.name ?? "Care";
}

export const isCareRequestsSuccessResponse = (
  value: unknown,
): value is CareRequestsSuccessResponse =>
  Compile(careRequestsSuccessSchema).Check(value);

export const isCareRequestErrorResponse = (
  value: unknown,
): value is CareRequestErrorResponse =>
  Compile(careRequestErrorSchema).Check(value);
