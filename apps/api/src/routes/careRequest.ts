import {
  careApiVersion,
  careRequestClaimPath,
  careRequestErrorSchema,
  careRequestParamsSchema,
  careRequestsPath,
  careRequestsSuccessSchema,
  createCareRequestBodySchema,
} from "@cloud-forest/api-contracts";
import type { CareRequestRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: CareRequestRepository;
  sessionResolver: SessionResolver;
};

const messages = {
  UNAUTHORIZED: "A valid invited session is required.",
  NOT_FOUND: "The requested Care request was not found.",
  VALIDATION_ERROR: "Invalid Care request.",
  ALREADY_CLAIMED: "This Care request is no longer available.",
} as const;

type ErrorCode = keyof typeof messages;

function error(code: ErrorCode) {
  return {
    apiVersion: careApiVersion,
    error: { code, message: messages[code] },
  };
}

function toApiRequest(
  request: Awaited<ReturnType<CareRequestRepository["listVisible"]>>[number],
) {
  return {
    id: request.id,
    kind: "meal" as const,
    direction: "receive" as const,
    need: "A meal" as const,
    helpfulWhen: request.helpfulWhen,
    foodWorks: request.foodWorks,
    foodDoesNotWork: request.foodDoesNotWork,
    handoffStyle: request.handoffStyle,
    audience: "Party" as const,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    ...(request.claimedAt
      ? { claimedAt: request.claimedAt.toISOString() }
      : {}),
    requester: request.requester,
    ...(request.claimant ? { claimant: request.claimant } : {}),
  };
}

export const careRequestRoutes: FastifyPluginAsyncTypebox<Options> = async (
  server,
  options,
) => {
  server.setErrorHandler((routeError, _request, reply) => {
    if (
      typeof routeError === "object" &&
      routeError !== null &&
      "validation" in routeError &&
      routeError.validation
    ) {
      return reply.status(400).send(error("VALIDATION_ERROR"));
    }
    throw routeError;
  });

  const auth = async (request: Parameters<SessionResolver["resolve"]>[0]) =>
    options.sessionResolver.resolve(request);
  const visibleRequests = async (viewerUserId: string) => ({
    apiVersion: careApiVersion,
    data: {
      requests: (await options.repository.listVisible(viewerUserId)).map(
        toApiRequest,
      ),
    },
  });

  server.get(
    careRequestsPath,
    {
      schema: {
        operationId: "getCareRequestsV1",
        tags: ["Care"],
        response: {
          200: careRequestsSuccessSchema,
          401: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return visibleRequests(current.userId);
    },
  );

  server.post(
    careRequestsPath,
    {
      schema: {
        operationId: "createCareRequestV1",
        tags: ["Care"],
        body: createCareRequestBodySchema,
        response: {
          200: careRequestsSuccessSchema,
          400: careRequestErrorSchema,
          401: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      await options.repository.create({
        requesterUserId: current.userId,
        ...request.body,
        now: new Date(),
      });
      return visibleRequests(current.userId);
    },
  );

  server.post(
    careRequestClaimPath,
    {
      schema: {
        operationId: "claimCareRequestV1",
        tags: ["Care"],
        params: careRequestParamsSchema,
        response: {
          200: careRequestsSuccessSchema,
          400: careRequestErrorSchema,
          401: careRequestErrorSchema,
          404: careRequestErrorSchema,
          409: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.claim({
        careRequestId: request.params.careRequestId,
        claimantUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(result.error === "care-request-already-claimed" ? 409 : 404)
          .send(
            error(
              result.error === "care-request-already-claimed"
                ? "ALREADY_CLAIMED"
                : "NOT_FOUND",
            ),
          );
      }
      return visibleRequests(current.userId);
    },
  );
};
