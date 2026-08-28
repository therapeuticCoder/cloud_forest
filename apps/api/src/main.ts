import {
  createDatabaseClient,
  createTimelineItemRepository,
  getDatabaseUrl,
} from "@cloud-forest/database";
import type { FastifyInstance } from "fastify";

import { startApi, stopApi } from "./lifecycle.ts";
import { createTimelineItemResolver } from "./timelineItemResolver.ts";

const { database, pool } = createDatabaseClient(getDatabaseUrl());
const timelineItemRepository = createTimelineItemRepository(database);

let server: FastifyInstance;

try {
  server = await startApi({
    serverOptions: {
      logger: true,
      timelineItemResolver: createTimelineItemResolver(timelineItemRepository),
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
