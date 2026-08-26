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
        querystring: healthRequestSchema,
        response: { 200: healthResponseSchema },
      },
    },
    async () => healthResponseExample,
  );
};
