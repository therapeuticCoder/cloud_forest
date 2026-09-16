import {
  apiVersion,
  createTimelinePostBodySchema,
  createTimelinePostSuccessResponseSchema,
  getTimelineItemErrorResponseSchema,
  getTimelineItemRequestSchema,
  getTimelineItemSuccessResponseSchema,
  getTimelineItemsSuccessResponseSchema,
  timelineItemsPath,
  timelineItemPath,
  timelinePostErrorResponseSchema,
  type CreateTimelinePostBody,
  type CreateTimelinePostSuccessResponse,
  type GetTimelineItemErrorResponse,
  type GetTimelineItemRequest,
  type GetTimelineItemSuccessResponse,
  type GetTimelineItemsSuccessResponse,
  type TimelinePostErrorResponse,
} from "@cloud-forest/api-contracts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { SessionResolver } from "../sessionResolver.ts";

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
  ownerUserId: string,
) => Promise<TimelineItemResolverResult> | TimelineItemResolverResult;

type TimelineItemsSuccessResult = {
  statusCode: 200;
  body: GetTimelineItemsSuccessResponse;
};

type TimelinePostSuccessResult = {
  statusCode: 200;
  body: CreateTimelinePostSuccessResponse;
};

type TimelinePostErrorResult = {
  statusCode: 404;
  body: TimelinePostErrorResponse;
};

export type TimelineItemsResolver = (
  viewerUserId: string,
) => Promise<TimelineItemsSuccessResult> | TimelineItemsSuccessResult;

export type CreateTimelinePostResolver = (
  request: CreateTimelinePostBody,
  authorUserId: string,
) => Promise<TimelinePostSuccessResult | TimelinePostErrorResult>;

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

export const defaultTimelineItemsResolver: TimelineItemsResolver = () => ({
  statusCode: 200,
  body: {
    apiVersion,
    data: { timelineItems: [] },
  },
});

export const defaultCreateTimelinePostResolver: CreateTimelinePostResolver =
  async () => ({
    statusCode: 404,
    body: {
      apiVersion,
      error: {
        code: "TIMELINE_POST_NOT_FOUND",
        message: "Timeline post not found.",
      },
    },
  });

interface TimelineItemRoutesOptions {
  resolver: TimelineItemResolver;
  listResolver: TimelineItemsResolver;
  createResolver: CreateTimelinePostResolver;
  sessionResolver: SessionResolver;
}

export const timelineItemRoutes: FastifyPluginAsyncTypebox<
  TimelineItemRoutesOptions
> = async (server, options) => {
  server.get(
    timelineItemsPath,
    {
      schema: {
        operationId: "getTimelineItemsV1",
        summary: "List visible Timeline items",
        tags: ["Timeline"],
        response: {
          200: getTimelineItemsSuccessResponseSchema,
          401: timelinePostErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (current === null) {
        return reply.status(401).send({
          apiVersion,
          error: {
            code: "UNAUTHORIZED",
            message: "A valid invited session is required.",
          },
        });
      }
      const result = await options.listResolver(current.userId);
      return reply.status(result.statusCode).send(result.body);
    },
  );

  server.post(
    timelineItemsPath,
    {
      schema: {
        operationId: "createTimelinePostV1",
        summary: "Create an ordinary Timeline post",
        tags: ["Timeline"],
        body: createTimelinePostBodySchema,
        response: {
          200: createTimelinePostSuccessResponseSchema,
          400: timelinePostErrorResponseSchema,
          401: timelinePostErrorResponseSchema,
          404: timelinePostErrorResponseSchema,
        },
      },
      errorHandler(error, _request, reply) {
        if (error.validation) {
          return reply.status(400).send({
            apiVersion,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid Timeline post.",
            },
          });
        }

        throw error;
      },
    },
    async (request, reply) => {
      const current = await options.sessionResolver.resolve(request);
      if (current === null) {
        return reply.status(401).send({
          apiVersion,
          error: {
            code: "UNAUTHORIZED",
            message: "A valid invited session is required.",
          },
        });
      }

      const content = request.body.content.trim();
      if (!content) {
        return reply.status(400).send({
          apiVersion,
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid Timeline post.",
          },
        });
      }

      const result = await options.createResolver(
        { ...request.body, content },
        current.userId,
      );
      return reply.status(result.statusCode).send(result.body);
    },
  );

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
      const current = await options.sessionResolver.resolve(request);
      if (current === null) {
        return reply.status(404).send({
          apiVersion,
          error: {
            code: "TIMELINE_ITEM_NOT_FOUND",
            message: "Timeline item not found.",
          },
        });
      }
      const result = await options.resolver(request.params, current.userId);
      return reply.status(result.statusCode).send(result.body);
    },
  );
};
