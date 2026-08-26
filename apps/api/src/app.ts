import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { healthRoutes } from "./routes/health.ts";

export type BuildApiOptions = Pick<FastifyServerOptions, "logger">;

export function buildApi(
  options: BuildApiOptions = { logger: false },
): FastifyInstance {
  const server = Fastify(options).withTypeProvider<TypeBoxTypeProvider>();

  server.setValidatorCompiler(TypeBoxValidatorCompiler);
  server.register(healthRoutes);

  return server;
}
