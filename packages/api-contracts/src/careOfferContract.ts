import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

import {
  careApiVersion,
  careExpiration,
  carePersonSchema,
} from "./careContract.ts";

const id = Type.String({ minLength: 1, maxLength: 128 });
const mealDescription = Type.String({ minLength: 1, maxLength: 10_000 });
const availableWhen = Type.String({ minLength: 1, maxLength: 500 });
const handoffStyle = Type.String({ minLength: 1, maxLength: 200 });
const dateTime = Type.String({ format: "date-time" });

export const careOfferSchema = Type.Object(
  {
    id,
    kind: Type.Literal("meal"),
    direction: Type.Literal("give"),
    offer: Type.Literal("A meal"),
    mealDescription,
    availableWhen,
    handoffStyle,
    audience: Type.Union([Type.Literal("Party"), Type.Literal("Tribe")]),
    status: Type.Union([Type.Literal("available"), Type.Literal("expired")]),
    createdAt: dateTime,
    expiresAt: Type.Optional(dateTime),
    expiredAt: Type.Optional(dateTime),
    giver: carePersonSchema,
  },
  { additionalProperties: false },
);

export const createCareOfferBodySchema = Type.Object(
  { mealDescription, availableWhen, handoffStyle, expiresIn: careExpiration },
  { additionalProperties: false },
);

export const careOffersSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal(careApiVersion),
    data: Type.Object(
      { offers: Type.Array(careOfferSchema) },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const careOfferErrorSchema = Type.Object(
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

export const careOffersPath = "/api/v1/care-offers";
export const careOfferPath = "/api/v1/care-offers/:careOfferId";
export const careOfferClaimPath = "/api/v1/care-offers/:careOfferId/claim";
export const careOfferPassPath = "/api/v1/care-offers/:careOfferId/pass";
export const careOfferParamsSchema = Type.Object(
  { careOfferId: id },
  { additionalProperties: false },
);

export type CareOffer = Static<typeof careOfferSchema>;
export type CreateCareOfferBody = Static<typeof createCareOfferBodySchema>;
export type CareOffersSuccessResponse = Static<typeof careOffersSuccessSchema>;
export type CareOfferErrorResponse = Static<typeof careOfferErrorSchema>;

export const isCareOffersSuccessResponse = (
  value: unknown,
): value is CareOffersSuccessResponse =>
  Compile(careOffersSuccessSchema).Check(value);

export const isCareOfferErrorResponse = (
  value: unknown,
): value is CareOfferErrorResponse =>
  Compile(careOfferErrorSchema).Check(value);
