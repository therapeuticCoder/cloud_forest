import {
  careApiVersion,
  careClaimPath,
  careConversationHeader,
  careResponseHeadersSchema,
  careCompletePath,
  careErrorSchema,
  careGratitudePath,
  careParamsSchema,
  carePassPath,
  careWithdrawPath,
  caresPath,
  caresSuccessSchema,
  createCareBodySchema,
  createCareGratitudeBodySchema,
  createCareWithdrawalBodySchema,
  isValidCareSelection,
} from "@cloud-forest/api-contracts";
import type { CareRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: CareRepository;
  sessionResolver: SessionResolver;
};

const messages = {
  UNAUTHORIZED: "A valid invited session is required.",
  NOT_FOUND: "The requested Care was not found.",
  VALIDATION_ERROR: "Invalid Care.",
  ALREADY_CLAIMED: "This Care is no longer available.",
  ALREADY_RECORDED: "This Care already has gratitude recorded.",
} as const;

type ErrorCode = keyof typeof messages;

function error(code: ErrorCode) {
  return {
    apiVersion: careApiVersion,
    error: { code, message: messages[code] },
  };
}

function toApiCare(
  care: Awaited<ReturnType<CareRepository["listVisible"]>>[number],
  includeConversation: boolean,
) {
  return {
    id: care.id,
    direction: care.direction,
    category: care.category,
    subtype: care.subtype,
    days: care.days,
    times: care.times,
    timeNote: care.timeNote,
    location: care.location,
    requirements: care.requirements,
    sensitivities: care.sensitivities,
    audience:
      care.audience === "party" ? ("Party" as const) : ("Tribe" as const),
    status: care.status,
    ...(includeConversation
      ? { conversationAvailable: care.conversationAvailable ?? false }
      : {}),
    createdAt: care.createdAt.toISOString(),
    ...(care.claimedAt ? { claimedAt: care.claimedAt.toISOString() } : {}),
    ...(care.originatorCompletedAt
      ? { originatorCompletedAt: care.originatorCompletedAt.toISOString() }
      : {}),
    ...(care.participantCompletedAt
      ? { participantCompletedAt: care.participantCompletedAt.toISOString() }
      : {}),
    ...(care.completedAt
      ? { completedAt: care.completedAt.toISOString() }
      : {}),
    ...(care.notCompletedAt
      ? { notCompletedAt: care.notCompletedAt.toISOString() }
      : {}),
    ...(care.expiresAt ? { expiresAt: care.expiresAt.toISOString() } : {}),
    ...(care.expiredAt ? { expiredAt: care.expiredAt.toISOString() } : {}),
    ...(care.gratitude
      ? {
          gratitude: {
            statementId: care.gratitude.statementId,
            message: care.gratitude.message,
            createdAt: care.gratitude.createdAt.toISOString(),
          },
        }
      : {}),
    ...(care.apology
      ? {
          apology: {
            statementId: care.apology.statementId,
            message: care.apology.message,
            createdAt: care.apology.createdAt.toISOString(),
          },
        }
      : {}),
    originator: care.originator,
    ...(care.participant ? { participant: care.participant } : {}),
  };
}

export const careRoutes: FastifyPluginAsyncTypebox<Options> = async (
  server,
  options,
) => {
  server.addHook("onRequest", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Vary", careConversationHeader);
  });
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
  const visibleCares = async (
    viewerUserId: string,
    request: Parameters<SessionResolver["resolve"]>[0],
  ) => ({
    apiVersion: careApiVersion,
    data: {
      cares: (await options.repository.listVisible(viewerUserId)).map((care) =>
        toApiCare(care, request.headers[careConversationHeader] === "1"),
      ),
    },
  });

  server.get(
    caresPath,
    {
      schema: {
        operationId: "getCaresV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        response: { 200: caresSuccessSchema, 401: careErrorSchema },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    caresPath,
    {
      schema: {
        operationId: "createCareV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        body: createCareBodySchema,
        response: {
          200: caresSuccessSchema,
          400: careErrorSchema,
          401: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const category = request.body.category ?? "food";
      const subtype = request.body.subtype ?? "";
      if (!isValidCareSelection(category, subtype)) {
        return reply.status(400).send(error("VALIDATION_ERROR"));
      }
      await options.repository.create({
        originatorUserId: current.userId,
        ...request.body,
        category,
        subtype,
        audience: request.body.audience === "Tribe" ? "tribe" : "party",
        now: new Date(),
      });
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    carePassPath,
    {
      schema: {
        operationId: "passCareV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        params: careParamsSchema,
        response: {
          200: caresSuccessSchema,
          401: careErrorSchema,
          404: careErrorSchema,
          409: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.pass({
        careId: request.params.careId,
        viewerUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(result.error === "care-already-claimed" ? 409 : 404)
          .send(
            error(
              result.error === "care-already-claimed"
                ? "ALREADY_CLAIMED"
                : "NOT_FOUND",
            ),
          );
      }
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    careClaimPath,
    {
      schema: {
        operationId: "claimCareV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        params: careParamsSchema,
        response: {
          200: caresSuccessSchema,
          401: careErrorSchema,
          404: careErrorSchema,
          409: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.claim({
        careId: request.params.careId,
        participantUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(result.error === "care-already-claimed" ? 409 : 404)
          .send(
            error(
              result.error === "care-already-claimed"
                ? "ALREADY_CLAIMED"
                : "NOT_FOUND",
            ),
          );
      }
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    careCompletePath,
    {
      schema: {
        operationId: "completeCareV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        params: careParamsSchema,
        response: {
          200: caresSuccessSchema,
          401: careErrorSchema,
          404: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.recordCompletion({
        careId: request.params.careId,
        participantUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) return reply.status(404).send(error("NOT_FOUND"));
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    careGratitudePath,
    {
      schema: {
        operationId: "recordCareGratitudeV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        params: careParamsSchema,
        body: createCareGratitudeBodySchema,
        response: {
          200: caresSuccessSchema,
          400: careErrorSchema,
          401: careErrorSchema,
          404: careErrorSchema,
          409: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.recordGratitude({
        careId: request.params.careId,
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
      return visibleCares(current.userId, request);
    },
  );

  server.post(
    careWithdrawPath,
    {
      schema: {
        operationId: "withdrawCareV1",
        tags: ["Care"],
        headers: careResponseHeadersSchema,
        params: careParamsSchema,
        body: createCareWithdrawalBodySchema,
        response: {
          200: caresSuccessSchema,
          400: careErrorSchema,
          401: careErrorSchema,
          404: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.withdraw({
        careId: request.params.careId,
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
      return visibleCares(current.userId, request);
    },
  );
};
