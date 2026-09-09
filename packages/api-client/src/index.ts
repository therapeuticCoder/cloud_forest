import {
  isCuratedPersonErrorResponse,
  isCuratedPersonsSuccessResponse,
  isGetTimelineItemErrorResponse,
  isGetTimelineItemSuccessResponse,
  isHealthResponse,
  isCurrentSessionResponse,
  isUnauthorizedResponse,
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
type CuratedPersonsOperation = operations["getCuratedPersonsV1"];
type CreateCuratedPersonOperation = operations["createCuratedPersonV1"];
type UpdateCuratedPersonOperation = operations["updateCuratedPersonV1"];
type DeleteCuratedPersonOperation = operations["deleteCuratedPersonV1"];
type CurrentSessionOperation = operations["getCurrentSessionV1"];
type LogoutOperation = operations["logoutV1"];

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
export type GetCuratedPersonsResponse = OperationResponseBody<
  CuratedPersonsOperation,
  200
>;
export type CuratedPersonInput =
  CreateCuratedPersonOperation["requestBody"]["content"]["application/json"];
export type UpdateCuratedPersonInput =
  UpdateCuratedPersonOperation["requestBody"]["content"]["application/json"];
export type DeleteCuratedPersonInput =
  DeleteCuratedPersonOperation["requestBody"]["content"]["application/json"];
export type GetCuratedPersonsErrorResponse = OperationResponseBody<
  CuratedPersonsOperation,
  401
>;
export type CurrentSessionResponse = OperationResponseBody<
  CurrentSessionOperation,
  200
>;
export type CurrentSessionErrorResponse = OperationResponseBody<
  CurrentSessionOperation,
  401
>;
export type CurrentSessionResult = ApiResult<
  200,
  CurrentSessionResponse,
  401,
  CurrentSessionErrorResponse
>;
export type LogoutErrorResponse = OperationResponseBody<LogoutOperation, 401>;
export type LogoutResult = ApiResult<204, null, 401, LogoutErrorResponse>;

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
export type GetCuratedPersonsResult = ApiResult<
  200,
  GetCuratedPersonsResponse,
  400 | 401 | 404 | 409,
  GetCuratedPersonsErrorResponse
>;

export interface ApiClient {
  getHealth(): Promise<HealthResult>;
  getCurrentSession(): Promise<CurrentSessionResult>;
  logout(): Promise<LogoutResult>;
  getTimelineItem(
    parameters: GetTimelineItemParameters,
  ): Promise<GetTimelineItemResult>;
  getCuratedPersons(): Promise<GetCuratedPersonsResult>;
  createCuratedPerson(
    input: CuratedPersonInput,
  ): Promise<GetCuratedPersonsResult>;
  updateCuratedPerson(
    curatedPersonId: string,
    input: UpdateCuratedPersonInput,
  ): Promise<GetCuratedPersonsResult>;
  deleteCuratedPerson(
    curatedPersonId: string,
    input: DeleteCuratedPersonInput,
  ): Promise<GetCuratedPersonsResult>;
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

  async function request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<RawRequestResult> {
    try {
      const response = await fetchImplementation(`${baseUrl}${path}`, {
        method,
        headers: {
          accept: "application/json",
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        credentials: "include",
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
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
      const result = await request("GET", "/api/v1/health");
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

    async getCurrentSession() {
      return parseCurrentSessionResponse(
        await request("GET", "/api/v1/session"),
      );
    },

    async logout() {
      const result = await request("POST", "/api/v1/session/logout");
      if (result.kind === "network") return result;

      if (result.status === 204) {
        return { ok: true, status: 204, value: null };
      }

      if (result.status === 401 && isUnauthorizedResponse(result.body)) {
        return {
          ok: false,
          kind: "http",
          status: 401,
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

    async getTimelineItem(parameters) {
      const timelineItemId = encodeURIComponent(parameters.timelineItemId);
      const result = await request(
        "GET",
        `/api/v1/timeline-items/${timelineItemId}`,
      );
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

    async getCuratedPersons() {
      return parseCuratedPersonsResponse(
        await request("GET", "/api/v1/curated-persons"),
      );
    },

    async createCuratedPerson(input) {
      return parseCuratedPersonsResponse(
        await request("POST", "/api/v1/curated-persons", input),
      );
    },

    async updateCuratedPerson(curatedPersonId, input) {
      return parseCuratedPersonsResponse(
        await request(
          "PATCH",
          `/api/v1/curated-persons/${encodeURIComponent(curatedPersonId)}`,
          input,
        ),
      );
    },

    async deleteCuratedPerson(curatedPersonId, input) {
      return parseCuratedPersonsResponse(
        await request(
          "DELETE",
          `/api/v1/curated-persons/${encodeURIComponent(curatedPersonId)}`,
          input,
        ),
      );
    },
  };
}

function parseCurrentSessionResponse(
  result: RawRequestResult,
): CurrentSessionResult {
  if (result.kind === "network") return result;
  if (result.status === 200 && isCurrentSessionResponse(result.body)) {
    return { ok: true, status: 200, value: result.body };
  }
  if (result.status === 401 && isUnauthorizedResponse(result.body)) {
    return {
      ok: false,
      kind: "http",
      status: 401,
      error: result.body,
    };
  }
  return {
    ok: false,
    kind: "unexpected-response",
    status: result.status,
    body: result.body,
  };
}

function parseCuratedPersonsResponse(
  result: RawRequestResult,
): GetCuratedPersonsResult {
  if (result.kind === "network") return result;
  if (result.status === 200 && isCuratedPersonsSuccessResponse(result.body)) {
    return { ok: true, status: 200, value: result.body };
  }
  if (
    (result.status === 400 ||
      result.status === 401 ||
      result.status === 404 ||
      result.status === 409) &&
    isCuratedPersonErrorResponse(result.body)
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
}
