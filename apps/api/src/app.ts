import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import fastifySwagger from "@fastify/swagger";
import { TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { healthRoutes } from "./routes/health.ts";
import {
  defaultTimelineItemResolver,
  timelineItemRoutes,
  type TimelineItemResolver,
} from "./routes/timelineItem.ts";

export interface BuildApiOptions extends Pick<FastifyServerOptions, "logger"> {
  timelineItemResolver?: TimelineItemResolver;
}

export function buildApi(
  options: BuildApiOptions = { logger: false },
): FastifyInstance {
  const server = Fastify({
    logger: options.logger,
    routerOptions: { maxParamLength: 256 },
  }).withTypeProvider<TypeBoxTypeProvider>();

  server.setValidatorCompiler(TypeBoxValidatorCompiler);
  server.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Cloud Forest API",
        version: "1.0.0",
      },
    },
  });
  server.register(healthRoutes);
  server.register(timelineItemRoutes, {
    resolver: options.timelineItemResolver ?? defaultTimelineItemResolver,
  });

  return server;
}
