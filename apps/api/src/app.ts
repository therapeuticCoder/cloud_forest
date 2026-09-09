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
import { sessionRoutes } from "./routes/session.ts";
import { authRoutes, type AuthHandler } from "./routes/auth.ts";
import type { SessionResolver } from "./sessionResolver.ts";
import type {
  CuratedPersonRepository,
  PartyRepository,
} from "@cloud-forest/database";
import { partyRoutes } from "./routes/party.ts";
import { curatedPersonRoutes } from "./routes/curatedPerson.ts";

export interface BuildApiOptions extends Pick<FastifyServerOptions, "logger"> {
  timelineItemResolver?: TimelineItemResolver;
  sessionResolver?: SessionResolver;
  authHandler?: AuthHandler;
  partyRepository?: PartyRepository;
  curatedPersonRepository?: CuratedPersonRepository;
}

const missingSessionResolver: SessionResolver = {
  async resolve() {
    return null;
  },
  async logout() {},
};
const missingPartyRepository = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error("Party repository is not configured.");
      };
    },
  },
) as PartyRepository;
const missingCuratedPersonRepository = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error("Curated Person repository is not configured.");
      };
    },
  },
) as CuratedPersonRepository;

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
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(sessionRoutes, {
    resolver: options.sessionResolver ?? missingSessionResolver,
  });
  if (options.authHandler !== undefined) {
    server.register(authRoutes, { handler: options.authHandler });
  }
  server.register(partyRoutes, {
    repository: options.partyRepository ?? missingPartyRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(curatedPersonRoutes, {
    repository:
      options.curatedPersonRepository ?? missingCuratedPersonRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  return server;
}
