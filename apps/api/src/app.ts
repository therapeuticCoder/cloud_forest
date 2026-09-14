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
  ConnectionRepository,
  PartyRepository,
} from "@cloud-forest/database";
import { partyRoutes } from "./routes/party.ts";
import { curatedPersonRoutes } from "./routes/curatedPerson.ts";
import { signupRoutes } from "./routes/signup.ts";
import { connectionPairingRoutes } from "./routes/connectionPairing.ts";
import { careRequestRoutes } from "./routes/careRequest.ts";

export interface BuildApiOptions extends Pick<FastifyServerOptions, "logger"> {
  timelineItemResolver?: TimelineItemResolver;
  sessionResolver?: SessionResolver;
  authHandler?: AuthHandler;
  signupAuthHandler?: AuthHandler;
  partyRepository?: PartyRepository;
  curatedPersonRepository?: CuratedPersonRepository;
  connectionRepository?: ConnectionRepository;
  careRequestRepository?: import("@cloud-forest/database").CareRequestRepository;
  identityRepository?: import("@cloud-forest/database").IdentityRepository;
}

const missingSessionResolver: SessionResolver = {
  async resolve() {
    return null;
  },
  async logout() {},
};
const missingAuthHandler: AuthHandler = async () => {
  throw new Error("Auth handler is not configured.");
};
const missingIdentityRepository = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error("Identity repository is not configured.");
      };
    },
  },
) as import("@cloud-forest/database").IdentityRepository;
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
const missingConnectionRepository = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error("Connection repository is not configured.");
      };
    },
  },
) as ConnectionRepository;
const missingCareRequestRepository = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error("Care request repository is not configured.");
      };
    },
  },
) as import("@cloud-forest/database").CareRequestRepository;

export function buildApi(
  options: BuildApiOptions = { logger: false },
): FastifyInstance {
  const server = Fastify({
    bodyLimit: 2 * 1024 * 1024,
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
  server.register(signupRoutes, {
    authHandler: options.signupAuthHandler ?? missingAuthHandler,
    identityRepository: options.identityRepository ?? missingIdentityRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(partyRoutes, {
    repository: options.partyRepository ?? missingPartyRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(curatedPersonRoutes, {
    connectionRepository:
      options.connectionRepository ?? missingConnectionRepository,
    repository:
      options.curatedPersonRepository ?? missingCuratedPersonRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(connectionPairingRoutes, {
    identityRepository: options.identityRepository ?? missingIdentityRepository,
    repository: options.connectionRepository ?? missingConnectionRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  server.register(careRequestRoutes, {
    repository: options.careRequestRepository ?? missingCareRequestRepository,
    sessionResolver: options.sessionResolver ?? missingSessionResolver,
  });
  return server;
}
