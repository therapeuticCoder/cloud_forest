import {
  healthPath,
  healthRequestSchema,
  healthResponseExample,
  healthResponseSchema,
} from "@cloud-forest/api-contracts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const healthRoutes: FastifyPluginAsyncTypebox = async (server) => {
  server.get(
    healthPath,
    {
      schema: {
        operationId: "getHealthV1",
        summary: "Check API health",
        tags: ["Health"],
        querystring: healthRequestSchema,
        response: { 200: healthResponseSchema },
      },
    },
    async () => healthResponseExample,
  );
};
