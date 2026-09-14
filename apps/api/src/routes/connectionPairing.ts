import {
  cancelConnectionPairingPath,
  cancelConnectionPairingSuccessSchema,
  confirmConnectionPairingPath,
  connectionApiVersion,
  connectionPairingErrorSchema,
  connectionPairingParamsSchema,
  connectionPairingPath,
  connectionPairingSuccessSchema,
  connectionPairingsPath,
  createConnectionPairingBodySchema,
  createConnectionPairingSuccessSchema,
  resolveConnectionPairingBodySchema,
  resolveConnectionPairingPath,
} from "@cloud-forest/api-contracts";
import {
  createPairingToken,
  type ConnectionRepository,
} from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: ConnectionRepository;
  sessionResolver: SessionResolver;
};

const messages = {
  UNAUTHORIZED: "A valid invited session is required.",
  NOT_FOUND: "This connection pairing is unavailable.",
  VALIDATION_ERROR: "Invalid connection pairing request.",
  INACTIVE_PAIRING: "This connection pairing is no longer active.",
  NOT_PAIRING_PARTICIPANT: "This connection pairing is unavailable.",
  RECEIVER_RESOLUTION_REQUIRED:
    "Choose a private Character before confirming this connection.",
  CHARACTER_LINKED_TO_ANOTHER_USER:
    "Choose a Character that is not connected to someone else.",
} as const;

type ErrorCode = keyof typeof messages;

function error(code: ErrorCode) {
  return {
    apiVersion: connectionApiVersion,
    error: { code, message: messages[code] },
  };
}

function repositoryErrorCode(errorName: string): ErrorCode {
  if (errorName === "character-not-found") return "NOT_FOUND";
  if (errorName === "character-linked-to-another-user") {
    return "CHARACTER_LINKED_TO_ANOTHER_USER";
  }
  if (errorName === "not-pairing-participant") {
    return "NOT_PAIRING_PARTICIPANT";
  }
  if (errorName === "receiver-required") {
    return "RECEIVER_RESOLUTION_REQUIRED";
  }
  return "INACTIVE_PAIRING";
}

function pairingPresentation(
  inspected: NonNullable<Awaited<ReturnType<ConnectionRepository["inspect"]>>>,
  viewerUserId: string,
) {
  const { pairing } = inspected;
  const viewerPlacement =
    inspected.viewerPlacement === "party" ||
    inspected.viewerPlacement === "tribe" ||
    inspected.viewerPlacement === "holding"
      ? inspected.viewerPlacement
      : undefined;
  return {
    apiVersion: connectionApiVersion,
    data: {
      state: inspected.state,
      expiresAt: pairing.expiresAt.toISOString(),
      initiator: { displayName: inspected.initiator.displayName },
      receiverResolved: pairing.receiverUserId !== null,
      viewerRole:
        pairing.initiatorUserId === viewerUserId
          ? "initiator"
          : pairing.receiverUserId === viewerUserId
            ? "receiver"
            : "visitor",
      initiatorConfirmed: pairing.initiatorConfirmedAt !== null,
      receiverConfirmed: pairing.receiverConfirmedAt !== null,
      viewerPlacement,
    },
  } as const;
}

export const connectionPairingRoutes: FastifyPluginAsyncTypebox<
  Options
> = async (server, options) => {
  server.setErrorHandler((routeError, _request, reply) => {
    if (
      typeof routeError === "object" &&
      routeError !== null &&
      "validation" in routeError &&
      routeError.validation
    ) {
      return reply.status(400).send(error("VALIDATION_ERROR"));
    }
    throw routeError;
  });
  const auth = async (request: Parameters<SessionResolver["resolve"]>[0]) =>
    options.sessionResolver.resolve(request);
  const responses = {
    200: connectionPairingSuccessSchema,
    400: connectionPairingErrorSchema,
    401: connectionPairingErrorSchema,
    404: connectionPairingErrorSchema,
    409: connectionPairingErrorSchema,
  };

  server.post(
    connectionPairingsPath,
    {
      schema: {
        operationId: "createConnectionPairingV1",
        tags: ["Connection Pairings"],
        body: createConnectionPairingBodySchema,
        response: {
          200: createConnectionPairingSuccessSchema,
          401: connectionPairingErrorSchema,
          404: connectionPairingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const token = createPairingToken();
      const result = await options.repository.start({
        initiatorUserId: current.userId,
        initiatorCuratedPersonId: request.body.curatedPersonId,
        token,
        now: new Date(),
      });
      if (!result.ok)
        return reply.status(404).send(error(repositoryErrorCode(result.error)));
      if (result.value.state === "already-connected") {
        return {
          apiVersion: connectionApiVersion,
          data: { state: "already-connected" },
        } as const;
      }
      return {
        apiVersion: connectionApiVersion,
        data: {
          state: "pending",
          token,
          expiresAt: result.value.pairing.expiresAt.toISOString(),
        },
      } as const;
    },
  );

  server.get(
    connectionPairingPath,
    {
      schema: {
        operationId: "getConnectionPairingV1",
        tags: ["Connection Pairings"],
        params: connectionPairingParamsSchema,
        response: {
          200: connectionPairingSuccessSchema,
          401: connectionPairingErrorSchema,
          404: connectionPairingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const inspected = await options.repository.inspect({
        token: request.params.token,
        viewerUserId: current.userId,
        now: new Date(),
      });
      if (!inspected) return reply.status(404).send(error("NOT_FOUND"));
      return pairingPresentation(inspected, current.userId);
    },
  );

  server.post(
    resolveConnectionPairingPath,
    {
      schema: {
        operationId: "resolveConnectionPairingV1",
        tags: ["Connection Pairings"],
        params: connectionPairingParamsSchema,
        body: resolveConnectionPairingBodySchema,
        response: responses,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.resolve({
        token: request.params.token,
        receiverUserId: current.userId,
        receiverCuratedPersonId: request.body.curatedPersonId,
        now: new Date(),
      });
      if (!result.ok) {
        const code = repositoryErrorCode(result.error);
        return reply.status(code === "NOT_FOUND" ? 404 : 409).send(error(code));
      }
      const inspected = await options.repository.inspect({
        token: request.params.token,
        viewerUserId: current.userId,
        now: new Date(),
      });
      if (!inspected) return reply.status(404).send(error("NOT_FOUND"));
      return pairingPresentation(inspected, current.userId);
    },
  );

  server.post(
    confirmConnectionPairingPath,
    {
      schema: {
        operationId: "confirmConnectionPairingV1",
        tags: ["Connection Pairings"],
        params: connectionPairingParamsSchema,
        response: responses,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.confirm({
        token: request.params.token,
        userId: current.userId,
        now: new Date(),
      });
      if (!result.ok)
        return reply.status(409).send(error(repositoryErrorCode(result.error)));
      const inspected = await options.repository.inspect({
        token: request.params.token,
        viewerUserId: current.userId,
        now: new Date(),
      });
      if (!inspected) return reply.status(404).send(error("NOT_FOUND"));
      return pairingPresentation(inspected, current.userId);
    },
  );

  server.post(
    cancelConnectionPairingPath,
    {
      schema: {
        operationId: "cancelConnectionPairingV1",
        tags: ["Connection Pairings"],
        params: connectionPairingParamsSchema,
        response: {
          200: cancelConnectionPairingSuccessSchema,
          401: connectionPairingErrorSchema,
          409: connectionPairingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.cancel({
        token: request.params.token,
        userId: current.userId,
        now: new Date(),
      });
      if (!result.ok)
        return reply.status(409).send(error(repositoryErrorCode(result.error)));
      return { apiVersion: connectionApiVersion, data: null };
    },
  );
};
