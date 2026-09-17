import {
  careApiVersion,
  careRequestCompletePath,
  careRequestGratitudePath,
  careRequestClaimPath,
  careRequestPassPath,
  careRequestWithdrawPath,
  careRequestErrorSchema,
  careRequestParamsSchema,
  careRequestsPath,
  careRequestsSuccessSchema,
  createCareGratitudeBodySchema,
  createCareRequestBodySchema,
  createCareWithdrawalBodySchema,
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
  ALREADY_RECORDED: "Gratitude has already been saved for this Care.",
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
    direction:
      request.originatorUserId !== undefined &&
      request.requesterUserId !== undefined &&
      request.originatorUserId !== request.requesterUserId
        ? ("give" as const)
        : ("receive" as const),
    need: "A meal" as const,
    helpfulWhen: request.helpfulWhen,
    foodWorks: request.foodWorks,
    foodDoesNotWork: request.foodDoesNotWork,
    handoffStyle: request.handoffStyle,
    audience:
      request.audience === "party" ? ("Party" as const) : ("Tribe" as const),
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    ...(request.claimedAt
      ? { claimedAt: request.claimedAt.toISOString() }
      : {}),
    ...(request.requesterCompletedAt
      ? { requesterCompletedAt: request.requesterCompletedAt.toISOString() }
      : {}),
    ...(request.claimantCompletedAt
      ? { claimantCompletedAt: request.claimantCompletedAt.toISOString() }
      : {}),
    ...(request.completedAt
      ? { completedAt: request.completedAt.toISOString() }
      : {}),
    ...(request.notCompletedAt
      ? { notCompletedAt: request.notCompletedAt.toISOString() }
      : {}),
    ...(request.expiresAt
      ? { expiresAt: request.expiresAt.toISOString() }
      : {}),
    ...(request.expiredAt
      ? { expiredAt: request.expiredAt.toISOString() }
      : {}),
    ...(request.gratitude
      ? {
          gratitude: {
            statementId: request.gratitude.statementId,
            message: request.gratitude.message,
            createdAt: request.gratitude.createdAt.toISOString(),
          },
        }
      : {}),
    ...(request.apology
      ? {
          apology: {
            statementId: request.apology.statementId,
            message: request.apology.message,
            createdAt: request.apology.createdAt.toISOString(),
          },
        }
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
    careRequestPassPath,
    {
      schema: {
        operationId: "passCareRequestV1",
        tags: ["Care"],
        params: careRequestParamsSchema,
        response: {
          200: careRequestsSuccessSchema,
          401: careRequestErrorSchema,
          404: careRequestErrorSchema,
          409: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.pass({
        careRequestId: request.params.careRequestId,
        viewerUserId: current.userId,
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

  server.post(
    careRequestCompletePath,
    {
      schema: {
        operationId: "completeCareRequestV1",
        tags: ["Care"],
        params: careRequestParamsSchema,
        response: {
          200: careRequestsSuccessSchema,
          400: careRequestErrorSchema,
          401: careRequestErrorSchema,
          404: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.recordCompletion({
        careRequestId: request.params.careRequestId,
        participantUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) {
        return reply.status(404).send(error("NOT_FOUND"));
      }
      return visibleRequests(current.userId);
    },
  );

  server.post(
    careRequestGratitudePath,
    {
      schema: {
        operationId: "recordCareGratitudeV1",
        tags: ["Care"],
        params: careRequestParamsSchema,
        body: createCareGratitudeBodySchema,
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
      const result = await options.repository.recordGratitude({
        careRequestId: request.params.careRequestId,
        receiverUserId: current.userId,
        ...request.body,
        now: new Date(),
      });
      if (!result.ok) {
        if (result.error === "care-gratitude-already-recorded") {
          return reply.status(409).send(error("ALREADY_RECORDED"));
        }
        if (result.error === "care-gratitude-invalid") {
          return reply.status(400).send(error("VALIDATION_ERROR"));
        }
        return reply.status(404).send(error("NOT_FOUND"));
      }
      return visibleRequests(current.userId);
    },
  );

  server.post(
    careRequestWithdrawPath,
    {
      schema: {
        operationId: "withdrawCareRequestV1",
        tags: ["Care"],
        params: careRequestParamsSchema,
        body: createCareWithdrawalBodySchema,
        response: {
          200: careRequestsSuccessSchema,
          400: careRequestErrorSchema,
          401: careRequestErrorSchema,
          404: careRequestErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.withdraw({
        careRequestId: request.params.careRequestId,
        participantUserId: current.userId,
        ...request.body,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(result.error === "care-withdrawal-invalid" ? 400 : 404)
          .send(
            error(
              result.error === "care-withdrawal-invalid"
                ? "VALIDATION_ERROR"
                : "NOT_FOUND",
            ),
          );
      }
      return visibleRequests(current.userId);
    },
  );
};
