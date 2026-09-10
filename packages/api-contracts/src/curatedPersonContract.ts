import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const curatedPersonApiVersion = "v1" as const;
const curatedPersonId = Type.String({ minLength: 1, maxLength: 128 });
const nickname = Type.String({ minLength: 1, maxLength: 200 });
const relationshipShape = Type.String({ minLength: 1, maxLength: 200 });
const privateDescription = Type.String({ maxLength: 10_000 });
const portraitUrl = Type.String({ maxLength: 2_000_000 });
const version = Type.Integer({ minimum: 1 });

export const curatedPersonPlacementSchema = Type.Union([
  Type.Literal("party"),
  Type.Literal("tribe"),
  Type.Literal("guild"),
  Type.Literal("signal"),
  Type.Literal("holding"),
]);

export const curatedPersonSchema = Type.Object(
  {
    id: curatedPersonId,
    nickname,
    relationshipShape,
    privateDescription,
    portraitUrl: Type.Optional(portraitUrl),
    placement: curatedPersonPlacementSchema,
    linkedUserId: Type.Union([curatedPersonId, Type.Null()]),
    version,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  { additionalProperties: false },
);

export const curatedPersonErrorSchema = Type.Object(
  {
    apiVersion: Type.Literal(curatedPersonApiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("UNAUTHORIZED"),
          Type.Literal("NOT_FOUND"),
          Type.Literal("VALIDATION_ERROR"),
          Type.Literal("HOLDING_FULL"),
          Type.Literal("PARTY_FULL"),
          Type.Literal("TRIBE_FULL"),
          Type.Literal("STALE_WRITE_CONFLICT"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const curatedPersonsSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(curatedPersonApiVersion),
    data: Type.Object(
      {
        people: Type.Array(curatedPersonSchema),
        changedPersonId: Type.Union([curatedPersonId, Type.Null()]),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const curatedPersonsPath = "/api/v1/curated-persons";
export const curatedPersonPath = "/api/v1/curated-persons/:curatedPersonId";
export const curatedPersonParamsSchema = Type.Object(
  { curatedPersonId },
  { additionalProperties: false },
);
export const createCuratedPersonBodySchema = Type.Object(
  {
    nickname,
    relationshipShape,
    privateDescription,
    portraitUrl: Type.Optional(portraitUrl),
    placement: curatedPersonPlacementSchema,
  },
  { additionalProperties: false },
);
export const updateCuratedPersonBodySchema = Type.Object(
  {
    nickname,
    relationshipShape,
    privateDescription,
    portraitUrl: Type.Optional(portraitUrl),
    placement: curatedPersonPlacementSchema,
    expectedVersion: version,
  },
  { additionalProperties: false },
);
export const removeCuratedPersonBodySchema = Type.Object(
  { expectedVersion: version },
  { additionalProperties: false },
);

export type CuratedPerson = Static<typeof curatedPersonSchema>;
export type CuratedPersonErrorResponse = Static<
  typeof curatedPersonErrorSchema
>;
export type CuratedPersonsSuccessResponse = Static<
  typeof curatedPersonsSuccessSchema
>;
export const isCuratedPersonErrorResponse = (
  value: unknown,
): value is CuratedPersonErrorResponse =>
  Compile(curatedPersonErrorSchema).Check(value);
export const isCuratedPersonsSuccessResponse = (
  value: unknown,
): value is CuratedPersonsSuccessResponse =>
  Compile(curatedPersonsSuccessSchema).Check(value);
