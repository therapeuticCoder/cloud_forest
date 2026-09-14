import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const careApiVersion = "v1" as const;

const id = Type.String({ minLength: 1, maxLength: 128 });
const displayName = Type.String({ minLength: 1, maxLength: 200 });
const helpfulWhen = Type.String({ minLength: 1, maxLength: 500 });
const foodWorks = Type.String({ minLength: 1, maxLength: 10_000 });
const foodDoesNotWork = Type.String({ maxLength: 10_000 });
const handoffStyle = Type.String({ minLength: 1, maxLength: 200 });
const dateTime = Type.String({ format: "date-time" });

export const carePersonSchema = Type.Object(
  { personId: id, displayName },
  { additionalProperties: false },
);

export const careRequestSchema = Type.Object(
  {
    id,
    kind: Type.Literal("meal"),
    direction: Type.Literal("receive"),
    need: Type.Literal("A meal"),
    helpfulWhen,
    foodWorks,
    foodDoesNotWork,
    handoffStyle,
    audience: Type.Literal("Party"),
    status: Type.Union([Type.Literal("open"), Type.Literal("claimed")]),
    createdAt: dateTime,
    claimedAt: Type.Optional(dateTime),
    requester: carePersonSchema,
    claimant: Type.Optional(carePersonSchema),
  },
  { additionalProperties: false },
);

export const createCareRequestBodySchema = Type.Object(
  { helpfulWhen, foodWorks, foodDoesNotWork, handoffStyle },
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
export const careRequestParamsSchema = Type.Object(
  { careRequestId: id },
  { additionalProperties: false },
);

export type CarePerson = Static<typeof carePersonSchema>;
export type CareRequest = Static<typeof careRequestSchema>;
export type CreateCareRequestBody = Static<typeof createCareRequestBodySchema>;
export type CareRequestsSuccessResponse = Static<
  typeof careRequestsSuccessSchema
>;
export type CareRequestErrorResponse = Static<typeof careRequestErrorSchema>;

export const isCareRequestsSuccessResponse = (
  value: unknown,
): value is CareRequestsSuccessResponse =>
  Compile(careRequestsSuccessSchema).Check(value);

export const isCareRequestErrorResponse = (
  value: unknown,
): value is CareRequestErrorResponse =>
  Compile(careRequestErrorSchema).Check(value);
