import type { FastifyPluginAsync } from "fastify";

export interface AuthHandler {
  (request: Request): Promise<Response>;
}

export const authRoutes: FastifyPluginAsync<{ handler: AuthHandler }> = async (
  server,
  options,
) => {
  server.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const response = await options.handler(
        new Request(url, {
          method: request.method,
          headers: new Headers(request.headers as Record<string, string>),
          ...(request.body === undefined
            ? {}
            : { body: JSON.stringify(request.body) }),
        }),
      );
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.status(response.status).send(await response.text());
    },
  });
};
