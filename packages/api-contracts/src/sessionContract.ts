import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const sessionPath = "/api/v1/session";
export const logoutPath = "/api/v1/session/logout";

const personIdSchema = Type.String({ minLength: 1, maxLength: 128 });
const roleSchema = Type.Union([Type.Literal("admin"), Type.Literal("user")]);

export const currentSessionResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal("v1"),
    data: Type.Object(
      {
        currentPersonId: personIdSchema,
        role: Type.Optional(roleSchema),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "CurrentSessionResponseV1" },
);

export const unauthorizedResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal("v1"),
    error: Type.Object(
      {
        code: Type.Literal("UNAUTHORIZED"),
        message: Type.Literal("A valid invited session is required."),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "UnauthorizedResponseV1" },
);

export type CurrentSessionResponse = Static<
  typeof currentSessionResponseSchema
>;
export type UnauthorizedResponse = Static<typeof unauthorizedResponseSchema>;

const currentSessionValidator = Compile(currentSessionResponseSchema);
const unauthorizedValidator = Compile(unauthorizedResponseSchema);

export const isCurrentSessionResponse = (
  value: unknown,
): value is CurrentSessionResponse => currentSessionValidator.Check(value);
export const isUnauthorizedResponse = (
  value: unknown,
): value is UnauthorizedResponse => unauthorizedValidator.Check(value);
