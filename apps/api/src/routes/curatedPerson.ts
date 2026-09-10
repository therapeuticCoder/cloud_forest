import {
  curatedPersonApiVersion,
  curatedPersonErrorSchema,
  curatedPersonParamsSchema,
  curatedPersonPath,
  curatedPersonsPath,
  curatedPersonsSuccessSchema,
  createCuratedPersonBodySchema,
  removeCuratedPersonBodySchema,
  updateCuratedPersonBodySchema,
} from "@cloud-forest/api-contracts";
import type { CuratedPersonRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: CuratedPersonRepository;
  sessionResolver: SessionResolver;
};

const message = {
  UNAUTHORIZED: "A valid invited session is required.",
  NOT_FOUND: "The requested private Person was not found.",
  VALIDATION_ERROR: "Invalid private Person request.",
  PARTY_FULL: "Your Party already has five relationships.",
  TRIBE_FULL: "Your Tribe already has 100 people.",
  STALE_WRITE_CONFLICT:
    "This private Person has changed. Refresh and try again.",
} as const;

type CuratedPersonErrorCode = keyof typeof message;

function error(code: CuratedPersonErrorCode) {
  return {
    apiVersion: curatedPersonApiVersion,
    error: { code, message: message[code] },
  };
}

function toApiPerson(
  person: Awaited<ReturnType<CuratedPersonRepository["listOwned"]>>[number],
) {
  return {
    id: person.id,
    nickname: person.nickname,
    relationshipShape: person.relationshipShape,
    privateDescription: person.privateDescription,
    placement: person.placement,
    linkedUserId: person.linkedUserId,
    version: person.version,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
  };
}

export const curatedPersonRoutes: FastifyPluginAsyncTypebox<Options> = async (
  server,
  options,
) => {
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
  const ownedPeople = async (
    ownerUserId: string,
    changedPersonId: string | null = null,
  ) => ({
    apiVersion: curatedPersonApiVersion,
    data: {
      people: (await options.repository.listOwned(ownerUserId)).map(
        toApiPerson,
      ),
      changedPersonId,
    },
  });
  const responses = {
    200: curatedPersonsSuccessSchema,
    400: curatedPersonErrorSchema,
    401: curatedPersonErrorSchema,
    404: curatedPersonErrorSchema,
    409: curatedPersonErrorSchema,
  };

  server.get(
    curatedPersonsPath,
    {
      schema: {
        operationId: "getCuratedPersonsV1",
        tags: ["Curated Persons"],
        response: {
          200: curatedPersonsSuccessSchema,
          401: curatedPersonErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return ownedPeople(current.userId);
    },
  );

  server.post(
    curatedPersonsPath,
    {
      schema: {
        operationId: "createCuratedPersonV1",
        tags: ["Curated Persons"],
        body: createCuratedPersonBodySchema,
        response: responses,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.create({
        ownerUserId: current.userId,
        ...request.body,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(
            result.error === "party-capacity-exceeded" ||
              result.error === "tribe-capacity-exceeded"
              ? 409
              : 404,
          )
          .send(
            error(
              result.error === "party-capacity-exceeded"
                ? "PARTY_FULL"
                : result.error === "tribe-capacity-exceeded"
                  ? "TRIBE_FULL"
                  : "NOT_FOUND",
            ),
          );
      }
      return ownedPeople(current.userId, result.value.id);
    },
  );

  server.patch(
    curatedPersonPath,
    {
      schema: {
        operationId: "updateCuratedPersonV1",
        tags: ["Curated Persons"],
        params: curatedPersonParamsSchema,
        body: updateCuratedPersonBodySchema,
        response: responses,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.update({
        ownerUserId: current.userId,
        curatedPersonId: request.params.curatedPersonId,
        ...request.body,
        now: new Date(),
      });
      if (!result.ok) {
        const code =
          result.error === "curated-person-not-found"
            ? "NOT_FOUND"
            : result.error === "party-capacity-exceeded"
              ? "PARTY_FULL"
              : result.error === "tribe-capacity-exceeded"
                ? "TRIBE_FULL"
                : "STALE_WRITE_CONFLICT";
        return reply.status(code === "NOT_FOUND" ? 404 : 409).send(error(code));
      }
      return ownedPeople(current.userId, request.params.curatedPersonId);
    },
  );

  server.delete(
    curatedPersonPath,
    {
      schema: {
        operationId: "deleteCuratedPersonV1",
        tags: ["Curated Persons"],
        params: curatedPersonParamsSchema,
        body: removeCuratedPersonBodySchema,
        response: responses,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.remove({
        ownerUserId: current.userId,
        curatedPersonId: request.params.curatedPersonId,
        expectedVersion: request.body.expectedVersion,
      });
      if (!result.ok) {
        const code =
          result.error === "curated-person-not-found"
            ? "NOT_FOUND"
            : "STALE_WRITE_CONFLICT";
        return reply.status(code === "NOT_FOUND" ? 404 : 409).send(error(code));
      }
      return ownedPeople(current.userId, request.params.curatedPersonId);
    },
  );
};
