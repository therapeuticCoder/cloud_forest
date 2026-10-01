import {
  careErrorSchema,
  careParamsSchema,
  careMessagesPath,
  careMessagesReadPath,
  careUnreadPath,
  careMessagesSuccessSchema,
  careUnreadSuccessSchema,
  sendCareMessageBodySchema,
  readCareMessagesBodySchema,
} from "@cloud-forest/api-contracts";
import type { CareConversationRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { SessionResolver } from "../sessionResolver.ts";

function error(code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR") {
  return {
    apiVersion: "v1" as const,
    error: {
      code,
      message:
        code === "UNAUTHORIZED"
          ? "A valid invited session is required."
          : code === "NOT_FOUND"
            ? "This Care conversation is unavailable."
            : "Enter a message of up to 2,000 characters.",
    },
  };
}

export const careConversationRoutes: FastifyPluginAsyncTypebox<{
  repository: CareConversationRepository;
  sessionResolver: SessionResolver;
}> = async (server, options) => {
  server.addHook("onRequest", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
  });
  server.setErrorHandler((routeError, _request, reply) => {
    if (
      typeof routeError === "object" &&
      routeError !== null &&
      "validation" in routeError &&
      routeError.validation
    )
      return reply.status(400).send(error("VALIDATION_ERROR"));
    throw routeError;
  });
  server.get(
    careUnreadPath,
    {
      schema: {
        operationId: "getCareUnreadV1",
        tags: ["Care"],
        response: { 200: careUnreadSuccessSchema, 401: careErrorSchema },
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return {
        apiVersion: "v1" as const,
        data: {
          conversations: await options.repository.unread(current.userId),
        },
      };
    },
  );
  server.get(
    careMessagesPath,
    {
      schema: {
        operationId: "getCareMessagesV1",
        tags: ["Care"],
        params: careParamsSchema,
        response: {
          200: careMessagesSuccessSchema,
          401: careErrorSchema,
          404: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.read(
        request.params.careId,
        current.userId,
      );
      if (!result.ok) return reply.status(404).send(error("NOT_FOUND"));
      return {
        apiVersion: "v1" as const,
        data: {
          messages: result.value.map((message) => ({
            ...message,
            sentAt: message.sentAt.toISOString(),
          })),
        },
      };
    },
  );
  server.post(
    careMessagesPath,
    {
      schema: {
        operationId: "sendCareMessageV1",
        tags: ["Care"],
        params: careParamsSchema,
        body: sendCareMessageBodySchema,
        response: {
          204: { type: "null" },
          400: careErrorSchema,
          401: careErrorSchema,
          404: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.send(
        request.params.careId,
        current.userId,
        request.body.text,
      );
      if (!result.ok)
        return reply
          .status(result.error === "message-invalid" ? 400 : 404)
          .send(
            error(
              result.error === "message-invalid"
                ? "VALIDATION_ERROR"
                : "NOT_FOUND",
            ),
          );
      return reply.status(204).send(null);
    },
  );
  server.post(
    careMessagesReadPath,
    {
      schema: {
        operationId: "markCareMessagesReadV1",
        tags: ["Care"],
        params: careParamsSchema,
        body: readCareMessagesBodySchema,
        response: {
          204: { type: "null" },
          400: careErrorSchema,
          401: careErrorSchema,
          404: careErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.markRead(
        request.params.careId,
        current.userId,
        request.body.throughMessageId,
      );
      if (!result.ok) return reply.status(404).send(error("NOT_FOUND"));
      return reply.status(204).send(null);
    },
  );
};
