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

export const careOfferSchema = Type.Object(
  {
    id,
    kind: Type.Union([Type.Literal("meal"), careCategory]),
    direction: Type.Literal("give"),
    offer: Type.String({ minLength: 1, maxLength: 200 }),
    category: Type.Optional(careCategory),
    subtype: Type.Optional(careSubtype),
    days: Type.Optional(careDays),
    times: Type.Optional(careTimes),
    timeNote: Type.Optional(timeNote),
    location: Type.Optional(location),
    requirements: Type.Optional(requirements),
    sensitivities: Type.Optional(sensitivities),
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
  {
    category: Type.Optional(careCategory),
    subtype: Type.Optional(careSubtype),
    days: Type.Optional(careDays),
    times: Type.Optional(careTimes),
    timeNote: Type.Optional(timeNote),
    location: Type.Optional(location),
    requirements: Type.Optional(requirements),
    sensitivities: Type.Optional(sensitivities),
    audience: Type.Optional(
      Type.Union([Type.Literal("Party"), Type.Literal("Tribe")]),
    ),
    mealDescription,
    availableWhen,
    handoffStyle,
    expiresIn: careExpiration,
  },
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
