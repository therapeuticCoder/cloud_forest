import type { FastifyInstance } from "fastify";

import { buildApi, type BuildApiOptions } from "./app.ts";
import { parseApiConfig } from "./config.ts";

export interface StartApiOptions {
  environment?: NodeJS.ProcessEnv;
  serverOptions?: BuildApiOptions;
}

export async function startApi(
  options: StartApiOptions = {},
): Promise<FastifyInstance> {
  const config = parseApiConfig(options.environment);
  const server = buildApi(options.serverOptions ?? { logger: true });

  try {
    await server.listen({ host: config.host, port: config.port });
    return server;
  } catch (error) {
    await server.close();
    throw error;
  }
}

export async function stopApi(server: FastifyInstance): Promise<void> {
  await server.close();
}
