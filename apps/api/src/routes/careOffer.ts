import {
  careApiVersion,
  careOfferClaimPath,
  careOfferErrorSchema,
  careOfferParamsSchema,
  careOfferPath,
  careOffersPath,
  careOffersSuccessSchema,
  createCareOfferBodySchema,
} from "@cloud-forest/api-contracts";
import type { CareOfferRepository } from "@cloud-forest/database";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

type Options = {
  repository: CareOfferRepository;
  sessionResolver: SessionResolver;
};

const messages = {
  UNAUTHORIZED: "A valid invited session is required.",
  NOT_FOUND: "The requested Care offer was not found.",
  VALIDATION_ERROR: "Invalid Care offer.",
  ALREADY_CLAIMED: "This Give offer is no longer available.",
} as const;

type ErrorCode = keyof typeof messages;

function error(code: ErrorCode) {
  return {
    apiVersion: careApiVersion,
    error: { code, message: messages[code] },
  };
}

function toApiOffer(
  offer: Awaited<ReturnType<CareOfferRepository["listVisible"]>>[number],
) {
  return {
    id: offer.id,
    kind: "meal" as const,
    direction: "give" as const,
    offer: "A meal" as const,
    mealDescription: offer.mealDescription,
    availableWhen: offer.availableWhen,
    handoffStyle: offer.handoffStyle,
    audience: "Party" as const,
    status: offer.status,
    createdAt: offer.createdAt.toISOString(),
    giver: offer.giver,
  };
}

export const careOfferRoutes: FastifyPluginAsyncTypebox<Options> = async (
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
  const visibleOffers = async (viewerUserId: string) => ({
    apiVersion: careApiVersion,
    data: {
      offers: (await options.repository.listVisible(viewerUserId)).map(
        toApiOffer,
      ),
    },
  });

  server.get(
    careOffersPath,
    {
      schema: {
        operationId: "getCareOffersV1",
        tags: ["Care"],
        response: {
          200: careOffersSuccessSchema,
          401: careOfferErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      return visibleOffers(current.userId);
    },
  );

  server.post(
    careOffersPath,
    {
      schema: {
        operationId: "createCareOfferV1",
        tags: ["Care"],
        body: createCareOfferBodySchema,
        response: {
          200: careOffersSuccessSchema,
          400: careOfferErrorSchema,
          401: careOfferErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      await options.repository.create({
        giverUserId: current.userId,
        ...request.body,
        now: new Date(),
      });
      return visibleOffers(current.userId);
    },
  );

  server.delete(
    careOfferPath,
    {
      schema: {
        operationId: "withdrawCareOfferV1",
        tags: ["Care"],
        params: careOfferParamsSchema,
        response: {
          200: careOffersSuccessSchema,
          401: careOfferErrorSchema,
          404: careOfferErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.withdraw({
        careOfferId: request.params.careOfferId,
        giverUserId: current.userId,
      });
      if (!result.ok) return reply.status(404).send(error("NOT_FOUND"));
      return visibleOffers(current.userId);
    },
  );

  server.post(
    careOfferClaimPath,
    {
      schema: {
        operationId: "claimCareOfferV1",
        tags: ["Care"],
        params: careOfferParamsSchema,
        response: {
          200: careOffersSuccessSchema,
          401: careOfferErrorSchema,
          404: careOfferErrorSchema,
          409: careOfferErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await auth(request);
      if (!current) return reply.status(401).send(error("UNAUTHORIZED"));
      const result = await options.repository.claim({
        careOfferId: request.params.careOfferId,
        claimantUserId: current.userId,
        now: new Date(),
      });
      if (!result.ok) {
        return reply
          .status(result.error === "care-offer-already-claimed" ? 409 : 404)
          .send(
            error(
              result.error === "care-offer-already-claimed"
                ? "ALREADY_CLAIMED"
                : "NOT_FOUND",
            ),
          );
      }
      return visibleOffers(current.userId);
    },
  );
};
