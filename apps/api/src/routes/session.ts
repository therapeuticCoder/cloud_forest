import {
  currentSessionResponseSchema,
  logoutPath,
  sessionPath,
  unauthorizedResponseSchema,
} from "@cloud-forest/api-contracts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

const unauthorized = {
  apiVersion: "v1" as const,
  error: {
    code: "UNAUTHORIZED" as const,
    message: "A valid invited session is required." as const,
  },
};

export const sessionRoutes: FastifyPluginAsyncTypebox<{
  resolver: SessionResolver;
}> = async (server, options) => {
  server.get(sessionPath, {
    schema: {
      operationId: "getCurrentSessionV1",
      tags: ["Session"],
      response: {
        200: currentSessionResponseSchema,
        401: unauthorizedResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const currentPerson = await options.resolver.resolve(request);
      if (currentPerson === null) return reply.status(401).send(unauthorized);
      return {
        apiVersion: "v1",
        data: { currentPersonId: currentPerson.personId },
      };
    },
  });

  server.post(logoutPath, {
    schema: {
      operationId: "logoutV1",
      tags: ["Session"],
      response: { 204: { type: "null" }, 401: unauthorizedResponseSchema },
    },
    handler: async (request, reply) => {
      const currentPerson = await options.resolver.resolve(request);
      if (currentPerson === null) return reply.status(401).send(unauthorized);
      await options.resolver.logout(request);
      return reply.status(204).send();
    },
  });
};
