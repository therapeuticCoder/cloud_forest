import {
  apiVersion,
  getTimelineItemErrorResponseSchema,
  getTimelineItemRequestSchema,
  getTimelineItemSuccessResponseSchema,
  timelineItemPath,
  type GetTimelineItemErrorResponse,
  type GetTimelineItemRequest,
  type GetTimelineItemSuccessResponse,
} from "@cloud-forest/api-contracts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

type TimelineItemSuccessResult = {
  statusCode: 200;
  body: GetTimelineItemSuccessResponse;
};

type TimelineItemErrorResult = {
  statusCode: 400 | 404;
  body: GetTimelineItemErrorResponse;
};

export type TimelineItemResolverResult =
  | TimelineItemSuccessResult
  | TimelineItemErrorResult;

export type TimelineItemResolver = (
  request: GetTimelineItemRequest,
) => Promise<TimelineItemResolverResult> | TimelineItemResolverResult;

export const defaultTimelineItemResolver: TimelineItemResolver = () => ({
  statusCode: 404,
  body: {
    apiVersion,
    error: {
      code: "TIMELINE_ITEM_NOT_FOUND",
      message: "Timeline item not found.",
    },
  },
});

interface TimelineItemRoutesOptions {
  resolver: TimelineItemResolver;
}

export const timelineItemRoutes: FastifyPluginAsyncTypebox<
  TimelineItemRoutesOptions
> = async (server, options) => {
  server.get(
    timelineItemPath,
    {
      schema: {
        operationId: "getTimelineItemV1",
        summary: "Get one Timeline item",
        tags: ["Timeline"],
        params: getTimelineItemRequestSchema,
        response: {
          200: getTimelineItemSuccessResponseSchema,
          400: getTimelineItemErrorResponseSchema,
          404: getTimelineItemErrorResponseSchema,
        },
      },
      errorHandler(error, _request, reply) {
        if (error.validation) {
          return reply.status(400).send({
            apiVersion,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid Timeline item request.",
            },
          });
        }

        throw error;
      },
    },
    async (request, reply) => {
      const result = await options.resolver(request.params);
      return reply.status(result.statusCode).send(result.body);
    },
  );
};
