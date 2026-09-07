import {
  addPartyMemberBodySchema,
  currentProfilePath,
  partyApiVersion,
  partyErrorSchema,
  partyMemberParamsSchema,
  partyMemberPath,
  partyPath,
  partyReorderPath,
  partySuccessSchema,
  profileParamsSchema,
  profilePath,
  profileSuccessSchema,
  removePartyMemberBodySchema,
  reorderPartyBodySchema,
  updatePartyMemberBodySchema,
  updateProfileBodySchema,
} from "@cloud-forest/api-contracts";
import type { PartyRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: PartyRepository;
  sessionResolver: SessionResolver;
};
const message: Record<string, string> = {
  UNAUTHORIZED: "A valid invited session is required.",
  FORBIDDEN: "You do not have access to this private resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid Party request.",
  DUPLICATE_MEMBER: "This person is already in your Party.",
  PARTY_FULL: "Your Party already has five relationships.",
  STALE_WRITE_CONFLICT: "This Party record has changed. Refresh and try again.",
};
type PartyErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DUPLICATE_MEMBER"
  | "PARTY_FULL"
  | "STALE_WRITE_CONFLICT";
function error(code: PartyErrorCode) {
  return {
    apiVersion: partyApiVersion,
    error: { code, message: message[code] },
  };
}

export const partyRoutes: FastifyPluginAsyncTypebox<Options> = async (
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
  const ownedParty = async (ownerPersonId: string) => ({
    apiVersion: partyApiVersion,
    data: {
      members: (await options.repository.listOwned(ownerPersonId)).map(
        ({
          memberPersonId,
          position,
          relationshipLabel,
          privateNote,
          version,
        }) => ({
          memberPersonId,
          position,
          relationshipLabel,
          privateNote,
          version,
        }),
      ),
    },
  });
  const profile = async (
    request: Parameters<SessionResolver["resolve"]>[0],
    personId: string,
  ) => {
    const current = await auth(request);
    if (!current) return { current: null, response: error("UNAUTHORIZED") };
    if (
      current.personId !== personId &&
      !(await options.repository.isOwnedMember(current.personId, personId))
    )
      return { current, response: error("FORBIDDEN") };
    const found = await options.repository.findProfile(personId);
    if (!found)
      return {
        current,
        response: error(
          current.personId === personId ? "NOT_FOUND" : "FORBIDDEN",
        ),
      };
    return { current, found };
  };
  const schemas = {
    200: profileSuccessSchema,
    400: partyErrorSchema,
    401: partyErrorSchema,
    403: partyErrorSchema,
    404: partyErrorSchema,
    409: partyErrorSchema,
  };
  server.get(
    profilePath,
    {
      schema: {
        operationId: "getProfileV1",
        tags: ["Party"],
        params: profileParamsSchema,
        response: schemas,
      },
    },
    async (request, reply) => {
      const result = await profile(request, request.params.personId);
      if (!result.found) {
        const response = result.response!;
        return reply
          .status(
            response.error.code === "UNAUTHORIZED"
              ? 401
              : response.error.code === "FORBIDDEN"
                ? 403
                : 404,
          )
          .send(response);
      }
      return {
        apiVersion: partyApiVersion,
        data: {
          profile: {
            personId: result.found.personId,
            displayName: result.found.displayName,
          },
        },
      };
    },
  );
  server.get(
    currentProfilePath,
    {
      schema: {
        operationId: "getCurrentProfileV1",
        tags: ["Party"],
        response: schemas,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const found = await options.repository.findProfile(current.personId);
      if (!found) return reply.status(404).send(error("NOT_FOUND"));
      return {
        apiVersion: partyApiVersion,
        data: {
          profile: { personId: found.personId, displayName: found.displayName },
        },
      };
    },
  );
  server.patch(
    currentProfilePath,
    {
      schema: {
        operationId: "updateCurrentProfileV1",
        tags: ["Party"],
        body: updateProfileBodySchema,
        response: schemas,
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const found = await options.repository.updateProfile({
        personId: current.personId,
        displayName: request.body.displayName,
        now: new Date(),
      });
      if (!found) return reply.status(404).send(error("NOT_FOUND"));
      return { apiVersion: partyApiVersion, data: { profile: found } };
    },
  );
  server.get(
    partyPath,
    {
      schema: {
        operationId: "getPartyV1",
        tags: ["Party"],
        response: { 200: partySuccessSchema, 401: partyErrorSchema },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return ownedParty(current.personId);
    },
  );
  server.post(
    partyPath,
    {
      schema: {
        operationId: "addPartyMemberV1",
        tags: ["Party"],
        body: addPartyMemberBodySchema,
        response: {
          200: partySuccessSchema,
          401: partyErrorSchema,
          404: partyErrorSchema,
          409: partyErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.addMember({
        ownerPersonId: current.personId,
        ...request.body,
        now: new Date(),
      });
      if (!result.ok)
        return reply
          .status(result.error === "person-not-found" ? 404 : 409)
          .send(
            error(
              result.error === "party-duplicate-member"
                ? "DUPLICATE_MEMBER"
                : result.error === "party-capacity-exceeded"
                  ? "PARTY_FULL"
                  : result.error === "person-not-found"
                    ? "NOT_FOUND"
                    : "VALIDATION_ERROR",
            ),
          );
      return ownedParty(current.personId);
    },
  );
  server.patch(
    partyMemberPath,
    {
      schema: {
        operationId: "updatePartyMemberV1",
        tags: ["Party"],
        params: partyMemberParamsSchema,
        body: updatePartyMemberBodySchema,
        response: {
          200: partySuccessSchema,
          401: partyErrorSchema,
          409: partyErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const updated = await options.repository.updateMember({
        ownerPersonId: current.personId,
        memberPersonId: request.params.memberPersonId,
        ...request.body,
        now: new Date(),
      });
      if (!updated)
        return reply.status(409).send(error("STALE_WRITE_CONFLICT"));
      return ownedParty(current.personId);
    },
  );
  server.delete(
    partyMemberPath,
    {
      schema: {
        operationId: "removePartyMemberV1",
        tags: ["Party"],
        params: partyMemberParamsSchema,
        body: removePartyMemberBodySchema,
        response: {
          200: partySuccessSchema,
          401: partyErrorSchema,
          409: partyErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const deleted = await options.repository.removeMember({
        ownerPersonId: current.personId,
        memberPersonId: request.params.memberPersonId,
        expectedVersion: request.body.expectedVersion,
      });
      if (!deleted)
        return reply.status(409).send(error("STALE_WRITE_CONFLICT"));
      return ownedParty(current.personId);
    },
  );
  server.post(
    partyReorderPath,
    {
      schema: {
        operationId: "reorderPartyV1",
        tags: ["Party"],
        body: reorderPartyBodySchema,
        response: {
          200: partySuccessSchema,
          401: partyErrorSchema,
          409: partyErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const reordered = await options.repository.reorderMembers({
        ownerPersonId: current.personId,
        members: request.body.members,
        now: new Date(),
      });
      if (!reordered)
        return reply.status(409).send(error("STALE_WRITE_CONFLICT"));
      return ownedParty(current.personId);
    },
  );
};
