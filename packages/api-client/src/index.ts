import {
  isGetTimelineItemErrorResponse,
  isGetTimelineItemSuccessResponse,
  isHealthResponse,
} from "@cloud-forest/api-contracts";

import type { operations } from "./generated/openapi.ts";

type JsonResponseBody<Response> = Response extends {
  content: { "application/json": infer Body };
}
  ? Body
  : never;

type OperationResponseBody<
  Operation extends { responses: object },
  Status extends keyof Operation["responses"],
> = JsonResponseBody<Operation["responses"][Status]>;

type HealthOperation = operations["getHealthV1"];
type TimelineItemOperation = operations["getTimelineItemV1"];

export type HealthResponse = OperationResponseBody<HealthOperation, 200>;
export type GetTimelineItemParameters =
  TimelineItemOperation["parameters"]["path"];
export type GetTimelineItemResponse = OperationResponseBody<
  TimelineItemOperation,
  200
>;
export type GetTimelineItemErrorResponse = OperationResponseBody<
  TimelineItemOperation,
  400 | 404
>;

export interface ApiSuccess<Status extends number, Value> {
  ok: true;
  status: Status;
  value: Value;
}

export interface ApiHttpError<Status extends number, ErrorResponse> {
  ok: false;
  kind: "http";
  status: Status;
  error: ErrorResponse;
}

export interface ApiNetworkError {
  ok: false;
  kind: "network";
  cause: unknown;
}

export interface ApiUnexpectedResponse {
  ok: false;
  kind: "unexpected-response";
  status: number;
  body: unknown;
}

export type ApiResult<
  SuccessStatus extends number,
  SuccessValue,
  ErrorStatus extends number = never,
  ErrorResponse = never,
> =
  | ApiSuccess<SuccessStatus, SuccessValue>
  | ([ErrorStatus] extends [never]
      ? never
      : ApiHttpError<ErrorStatus, ErrorResponse>)
  | ApiNetworkError
  | ApiUnexpectedResponse;

export type HealthResult = ApiResult<200, HealthResponse>;
export type GetTimelineItemResult = ApiResult<
  200,
  GetTimelineItemResponse,
  400 | 404,
  GetTimelineItemErrorResponse
>;

export interface ApiClient {
  getHealth(): Promise<HealthResult>;
  getTimelineItem(
    parameters: GetTimelineItemParameters,
  ): Promise<GetTimelineItemResult>;
}

export interface CreateApiClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
}

type RawRequestResult =
  | { kind: "response"; status: number; body: unknown }
  | ApiNetworkError;

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createApiClient(options: CreateApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImplementation = options.fetch ?? globalThis.fetch;

  async function get(path: string): Promise<RawRequestResult> {
    try {
      const response = await fetchImplementation(`${baseUrl}${path}`, {
        method: "GET",
        headers: { accept: "application/json" },
      });

      return {
        kind: "response",
        status: response.status,
        body: await readResponseBody(response),
      };
    } catch (cause) {
      return { ok: false, kind: "network", cause };
    }
  }

  return {
    async getHealth() {
      const result = await get("/api/v1/health");
      if (result.kind === "network") return result;

      if (result.status === 200 && isHealthResponse(result.body)) {
        return {
          ok: true,
          status: 200,
          value: result.body,
        };
      }

      return {
        ok: false,
        kind: "unexpected-response",
        status: result.status,
        body: result.body,
      };
    },

    async getTimelineItem(parameters) {
      const timelineItemId = encodeURIComponent(parameters.timelineItemId);
      const result = await get(`/api/v1/timeline-items/${timelineItemId}`);
      if (result.kind === "network") return result;

      if (
        result.status === 200 &&
        isGetTimelineItemSuccessResponse(result.body)
      ) {
        return {
          ok: true,
          status: 200,
          value: result.body,
        };
      }

      if (
        (result.status === 400 || result.status === 404) &&
        isGetTimelineItemErrorResponse(result.body)
      ) {
        return {
          ok: false,
          kind: "http",
          status: result.status,
          error: result.body,
        };
      }

      return {
        ok: false,
        kind: "unexpected-response",
        status: result.status,
        body: result.body,
      };
    },
  };
}
