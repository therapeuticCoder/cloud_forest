import { startApi, stopApi } from "./lifecycle.ts";

const server = await startApi();
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
  }
}

process.once("SIGINT", () => void shutDown("SIGINT"));
process.once("SIGTERM", () => void shutDown("SIGTERM"));
