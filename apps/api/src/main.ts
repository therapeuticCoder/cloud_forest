import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  createDatabaseClient,
  createCuratedPersonRepository,
  createIdentityRepository,
  createPartyRepository,
  createTimelineItemRepository,
  getDatabaseUrl,
} from "@cloud-forest/database";
import type { FastifyInstance } from "fastify";

import { startApi, stopApi } from "./lifecycle.ts";
import { createInvitedAuth } from "./auth.ts";
import { createSessionResolver } from "./sessionResolver.ts";
import { createTimelineItemResolver } from "./timelineItemResolver.ts";

const { database, pool } = createDatabaseClient(getDatabaseUrl());
const timelineItemRepository = createTimelineItemRepository(database);
const e2eMagicLinkFile = process.env.E2E_MAGIC_LINK_FILE;
const invitedAuth = createInvitedAuth(
  database,
  process.env.BETTER_AUTH_SECRET ??
    "cloud-forest-local-test-secret-must-be-32-chars",
  e2eMagicLinkFile
    ? {
        async deliver(link) {
          await mkdir(dirname(e2eMagicLinkFile), { recursive: true });
          await writeFile(e2eMagicLinkFile, JSON.stringify(link), "utf8");
        },
      }
    : undefined,
);
const sessionResolver = createSessionResolver(
  invitedAuth.api,
  createIdentityRepository(database),
);

let server: FastifyInstance;

try {
  server = await startApi({
    serverOptions: {
      logger: true,
      timelineItemResolver: createTimelineItemResolver(timelineItemRepository),
      sessionResolver,
      partyRepository: createPartyRepository(database),
      curatedPersonRepository: createCuratedPersonRepository(database),
      authHandler: invitedAuth.handler,
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
