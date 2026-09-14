import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const connectionApiVersion = "v1" as const;
const pairingToken = Type.String({ minLength: 20, maxLength: 128 });
const signupCode = Type.String({ minLength: 1, maxLength: 256 });
const curatedPersonId = Type.String({ minLength: 1, maxLength: 128 });
const curatedPersonPlacement = Type.Union([
  Type.Literal("party"),
  Type.Literal("tribe"),
  Type.Literal("holding"),
]);

const publicAccountIdentitySchema = Type.Object(
  { displayName: Type.String({ minLength: 1, maxLength: 200 }) },
  { additionalProperties: false },
);
const createConnectionPairingErrorCode = Type.Union([
  Type.Literal("UNAUTHORIZED"),
  Type.Literal("NOT_FOUND"),
  Type.Literal("VALIDATION_ERROR"),
  Type.Literal("INACTIVE_PAIRING"),
  Type.Literal("NOT_PAIRING_PARTICIPANT"),
  Type.Literal("RECEIVER_RESOLUTION_REQUIRED"),
  Type.Literal("CHARACTER_LINKED_TO_ANOTHER_USER"),
  Type.Literal("SIGNUP_INVITATION_FAILED"),
]);

export const connectionPairingStateSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("completed"),
  Type.Literal("cancelled"),
  Type.Literal("superseded"),
  Type.Literal("expired"),
]);

export const connectionPairingSchema = Type.Object(
  {
    state: connectionPairingStateSchema,
    expiresAt: Type.String({ format: "date-time" }),
    initiator: publicAccountIdentitySchema,
    receiver: Type.Optional(publicAccountIdentitySchema),
    receiverResolved: Type.Boolean(),
    viewerRole: Type.Union([
      Type.Literal("initiator"),
      Type.Literal("receiver"),
      Type.Literal("visitor"),
    ]),
    initiatorConfirmed: Type.Boolean(),
    receiverConfirmed: Type.Boolean(),
    viewerPlacement: Type.Optional(curatedPersonPlacement),
  },
  { additionalProperties: false },
);

export const connectionPairingErrorSchema = Type.Object(
  {
    apiVersion: Type.Literal(connectionApiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("UNAUTHORIZED"),
          Type.Literal("NOT_FOUND"),
          Type.Literal("VALIDATION_ERROR"),
          Type.Literal("INACTIVE_PAIRING"),
          Type.Literal("NOT_PAIRING_PARTICIPANT"),
          Type.Literal("RECEIVER_RESOLUTION_REQUIRED"),
          Type.Literal("CHARACTER_LINKED_TO_ANOTHER_USER"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const createConnectionPairingErrorSchema = Type.Object(
  {
    apiVersion: Type.Literal(connectionApiVersion),
    error: Type.Object(
      {
        code: createConnectionPairingErrorCode,
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const createConnectionPairingBodySchema = Type.Object(
  { curatedPersonId },
  { additionalProperties: false },
);
export const resolveConnectionPairingBodySchema = Type.Object(
  { curatedPersonId },
  { additionalProperties: false },
);
export const connectionPairingParamsSchema = Type.Object(
  { token: pairingToken },
  { additionalProperties: false },
);

export const createConnectionPairingSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(connectionApiVersion),
    data: Type.Union([
      Type.Object(
        {
          state: Type.Literal("pending"),
          token: pairingToken,
          signupCode,
          expiresAt: Type.String({ format: "date-time" }),
        },
        { additionalProperties: false },
      ),
      Type.Object(
        { state: Type.Literal("already-connected") },
        { additionalProperties: false },
      ),
    ]),
  },
  { additionalProperties: false },
);

export const connectionPairingSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(connectionApiVersion),
    data: connectionPairingSchema,
  },
  { additionalProperties: false },
);

export const cancelConnectionPairingSuccessSchema = Type.Object(
  { apiVersion: Type.Literal(connectionApiVersion), data: Type.Null() },
  { additionalProperties: false },
);

export const connectionPairingsPath = "/api/v1/connection-pairings";
export const connectionPairingPath = "/api/v1/connection-pairings/:token";
export const resolveConnectionPairingPath =
  "/api/v1/connection-pairings/:token/resolve";
export const confirmConnectionPairingPath =
  "/api/v1/connection-pairings/:token/confirm";
export const cancelConnectionPairingPath =
  "/api/v1/connection-pairings/:token/cancel";

export type ConnectionPairing = Static<typeof connectionPairingSchema>;
export type CreateConnectionPairingSuccess = Static<
  typeof createConnectionPairingSuccessSchema
>;
export type ConnectionPairingSuccess = Static<
  typeof connectionPairingSuccessSchema
>;
export type ConnectionPairingError = Static<
  typeof connectionPairingErrorSchema
>;
export const isConnectionPairingErrorResponse = (
  value: unknown,
): value is ConnectionPairingError =>
  Compile(connectionPairingErrorSchema).Check(value);
