import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const partyApiVersion = "v1" as const;
const personId = Type.String({ minLength: 1, maxLength: 128 });
const text = Type.String({ minLength: 1, maxLength: 200 });
const note = Type.String({ maxLength: 10_000 });
const version = Type.Integer({ minimum: 1 });

export const profileSchema = Type.Object(
  { personId, displayName: text },
  { additionalProperties: false },
);
export const partyMemberSchema = Type.Object(
  {
    memberPersonId: personId,
    position: Type.Integer({ minimum: 0, maximum: 4 }),
    relationshipLabel: text,
    privateNote: note,
    version,
  },
  { additionalProperties: false },
);
export const partyErrorSchema = Type.Object(
  {
    apiVersion: Type.Literal(partyApiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("UNAUTHORIZED"),
          Type.Literal("FORBIDDEN"),
          Type.Literal("NOT_FOUND"),
          Type.Literal("VALIDATION_ERROR"),
          Type.Literal("DUPLICATE_MEMBER"),
          Type.Literal("PARTY_FULL"),
          Type.Literal("STALE_WRITE_CONFLICT"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export const profileSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(partyApiVersion),
    data: Type.Object(
      { profile: profileSchema },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export const partySuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(partyApiVersion),
    data: Type.Object(
      { members: Type.Array(partyMemberSchema, { maxItems: 5 }) },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export const profilePath = "/api/v1/profiles/:personId";
export const currentProfilePath = "/api/v1/profiles/current";
export const partyPath = "/api/v1/party";
export const partyMemberPath = "/api/v1/party/:memberPersonId";
export const partyReorderPath = "/api/v1/party/reorder";
export const profileParamsSchema = Type.Object(
  { personId },
  { additionalProperties: false },
);
export const partyMemberParamsSchema = Type.Object(
  { memberPersonId: personId },
  { additionalProperties: false },
);
export const updateProfileBodySchema = Type.Object(
  { displayName: text },
  { additionalProperties: false },
);
export const addPartyMemberBodySchema = Type.Object(
  { memberPersonId: personId, relationshipLabel: text, privateNote: note },
  { additionalProperties: false },
);
export const updatePartyMemberBodySchema = Type.Object(
  { relationshipLabel: text, privateNote: note, expectedVersion: version },
  { additionalProperties: false },
);
export const removePartyMemberBodySchema = Type.Object(
  { expectedVersion: version },
  { additionalProperties: false },
);
export const reorderPartyBodySchema = Type.Object(
  {
    members: Type.Array(
      Type.Object(
        { memberPersonId: personId, expectedVersion: version },
        { additionalProperties: false },
      ),
      { maxItems: 5 },
    ),
  },
  { additionalProperties: false },
);
export type PartyErrorResponse = Static<typeof partyErrorSchema>;
export type ProfileSuccessResponse = Static<typeof profileSuccessSchema>;
export type PartySuccessResponse = Static<typeof partySuccessSchema>;
export const isPartyErrorResponse = (
  value: unknown,
): value is PartyErrorResponse => Compile(partyErrorSchema).Check(value);
