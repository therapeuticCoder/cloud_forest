import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

import { apiVersion } from "./timelineItemContract.ts";

export const healthPath = "/api/v1/health";

export const healthRequestSchema = Type.Object(
  {},
  { additionalProperties: false, $id: "HealthRequestV1" },
);

export const healthResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    status: Type.Literal("ok"),
  },
  { additionalProperties: false, $id: "HealthResponseV1" },
);

export type HealthRequest = Static<typeof healthRequestSchema>;
export type HealthResponse = Static<typeof healthResponseSchema>;

const requestValidator = Compile(healthRequestSchema);
const responseValidator = Compile(healthResponseSchema);

export function isHealthRequest(value: unknown): value is HealthRequest {
  return requestValidator.Check(value);
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  return responseValidator.Check(value);
}

export const healthResponseExample = {
  apiVersion,
  status: "ok",
} satisfies HealthResponse;
