import {
  createDatabaseClient,
  createCuratedPersonRepository,
  createConnectionRepository,
  createCareRequestRepository,
  createCareOfferRepository,
  createIdentityRepository,
  createPartyRepository,
  createTimelineItemRepository,
  getDatabaseUrl,
} from "@cloud-forest/database";
import type { FastifyInstance } from "fastify";

import { startApi, stopApi } from "./lifecycle.ts";
import { createInvitedAuth } from "./auth.ts";
import { createSessionResolver } from "./sessionResolver.ts";
import {
  createTimelinePostResolver,
  createTimelineItemResolver,
  createTimelineItemsResolver,
} from "./timelineItemResolver.ts";

const { database, pool } = createDatabaseClient(getDatabaseUrl());
const timelineItemRepository = createTimelineItemRepository(database);

const invitedAuth = createInvitedAuth(
  database,
  process.env.BETTER_AUTH_SECRET ??
    "cloud-forest-local-test-secret-must-be-32-chars",
);
const signupAuth = createInvitedAuth(
  database,
  process.env.BETTER_AUTH_SECRET ??
    "cloud-forest-local-test-secret-must-be-32-chars",
  { allowSignUp: true },
);
const identityRepository = createIdentityRepository(database);
const sessionResolver = createSessionResolver(
  invitedAuth.api,
  identityRepository,
);

let server: FastifyInstance;

try {
  server = await startApi({
    serverOptions: {
      logger: true,
      timelineItemResolver: createTimelineItemResolver(timelineItemRepository),
      timelineItemsResolver: createTimelineItemsResolver(
        timelineItemRepository,
      ),
      createTimelinePostResolver: createTimelinePostResolver(
        timelineItemRepository,
      ),
      sessionResolver,
      partyRepository: createPartyRepository(database),
      curatedPersonRepository: createCuratedPersonRepository(database),
      connectionRepository: createConnectionRepository(database),
      careRequestRepository: createCareRequestRepository(database),
      careOfferRepository: createCareOfferRepository(database),
      identityRepository,
      authHandler: invitedAuth.handler,
      signupAuthHandler: signupAuth.handler,
    },
  });
} catch (error) {
  await pool.end();
  throw error;
}

let isShuttingDown = false;

async function shutDown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  server.log.info({ signal }, "Shutting down API");

  try {
    await stopApi(server);
  } catch (error) {
    server.log.error(error, "API shutdown failed");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

process.once("SIGINT", () => void shutDown("SIGINT"));
process.once("SIGTERM", () => void shutDown("SIGTERM"));
