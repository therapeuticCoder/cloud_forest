import type { TimelineItem } from "@cloud-forest/domain";
import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const apiVersion = "v1" as const;
export const timelineItemsPath = "/api/v1/timeline-items";
export const timelineItemPath = "/api/v1/timeline-items/:timelineItemId";

const opaqueIdSchema = Type.String({ minLength: 1, maxLength: 128 });
const timelineAudienceSchema = Type.Union([
  Type.Literal("party"),
  Type.Literal("tribe"),
]);
const isoDateTimeSchema = Type.String({
  format: "date-time",
  pattern: "Z$",
});

export const timelineItemSchema = Type.Object(
  {
    id: opaqueIdSchema,
    actor: Type.Object(
      {
        id: opaqueIdSchema,
        displayName: Type.String({ minLength: 1, maxLength: 200 }),
        layer: Type.Union([
          Type.Literal("party"),
          Type.Literal("tribe"),
          Type.Literal("guild"),
          Type.Literal("signal"),
        ]),
        initials: Type.Optional(Type.String({ minLength: 1, maxLength: 8 })),
        avatarUrl: Type.Optional(
          Type.String({ minLength: 1, maxLength: 2_048 }),
        ),
      },
      { additionalProperties: false },
    ),
    content: Type.String({ minLength: 1, maxLength: 10_000 }),
    publishedAt: isoDateTimeSchema,
  },
  { additionalProperties: false, $id: "TimelineItem" },
);

export const getTimelineItemRequestSchema = Type.Object(
  {
    timelineItemId: opaqueIdSchema,
  },
  { additionalProperties: false, $id: "GetTimelineItemRequestV1" },
);

export const getTimelineItemSuccessResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    data: Type.Object(
      { timelineItem: timelineItemSchema },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "GetTimelineItemSuccessResponseV1" },
);

export const getTimelineItemsSuccessResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    data: Type.Object(
      { timelineItems: Type.Array(timelineItemSchema) },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "GetTimelineItemsSuccessResponseV1" },
);

export const createTimelinePostBodySchema = Type.Object(
  {
    content: Type.String({ minLength: 1, maxLength: 280 }),
    audience: timelineAudienceSchema,
  },
  { additionalProperties: false, $id: "CreateTimelinePostBodyV1" },
);

export const createTimelinePostSuccessResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    data: Type.Object(
      { timelineItem: timelineItemSchema },
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    $id: "CreateTimelinePostSuccessResponseV1",
  },
);

export const timelinePostErrorResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("INVALID_REQUEST"),
          Type.Literal("UNAUTHORIZED"),
          Type.Literal("TIMELINE_POST_NOT_FOUND"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "TimelinePostErrorResponseV1" },
);

export const getTimelineItemErrorResponseSchema = Type.Object(
  {
    apiVersion: Type.Literal(apiVersion),
    error: Type.Object(
      {
        code: Type.Union([
          Type.Literal("INVALID_REQUEST"),
          Type.Literal("TIMELINE_ITEM_NOT_FOUND"),
        ]),
        message: Type.String({ minLength: 1, maxLength: 500 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false, $id: "GetTimelineItemErrorResponseV1" },
);

export type GetTimelineItemRequest = Static<
  typeof getTimelineItemRequestSchema
>;
export type GetTimelineItemSuccessResponse = Static<
  typeof getTimelineItemSuccessResponseSchema
>;
export type GetTimelineItemsSuccessResponse = Static<
  typeof getTimelineItemsSuccessResponseSchema
>;
export type CreateTimelinePostBody = Static<
  typeof createTimelinePostBodySchema
>;
export type CreateTimelinePostSuccessResponse = Static<
  typeof createTimelinePostSuccessResponseSchema
>;
export type TimelinePostErrorResponse = Static<
  typeof timelinePostErrorResponseSchema
>;
export type GetTimelineItemErrorResponse = Static<
  typeof getTimelineItemErrorResponseSchema
>;

const requestValidator = Compile(getTimelineItemRequestSchema);
const successResponseValidator = Compile(getTimelineItemSuccessResponseSchema);
const errorResponseValidator = Compile(getTimelineItemErrorResponseSchema);
const itemsSuccessResponseValidator = Compile(
  getTimelineItemsSuccessResponseSchema,
);
const createPostBodyValidator = Compile(createTimelinePostBodySchema);
const createPostSuccessResponseValidator = Compile(
  createTimelinePostSuccessResponseSchema,
);
const postErrorResponseValidator = Compile(timelinePostErrorResponseSchema);

export function isGetTimelineItemRequest(
  value: unknown,
): value is GetTimelineItemRequest {
  return requestValidator.Check(value);
}

export function isGetTimelineItemSuccessResponse(
  value: unknown,
): value is GetTimelineItemSuccessResponse {
  return successResponseValidator.Check(value);
}

export function isGetTimelineItemErrorResponse(
  value: unknown,
): value is GetTimelineItemErrorResponse {
  return errorResponseValidator.Check(value);
}

export function isGetTimelineItemsSuccessResponse(
  value: unknown,
): value is GetTimelineItemsSuccessResponse {
  return itemsSuccessResponseValidator.Check(value);
}

export function isCreateTimelinePostBody(
  value: unknown,
): value is CreateTimelinePostBody {
  return createPostBodyValidator.Check(value);
}

export function isCreateTimelinePostSuccessResponse(
  value: unknown,
): value is CreateTimelinePostSuccessResponse {
  return createPostSuccessResponseValidator.Check(value);
}

export function isTimelinePostErrorResponse(
  value: unknown,
): value is TimelinePostErrorResponse {
  return postErrorResponseValidator.Check(value);
}

export const getTimelineItemRequestExample = {
  timelineItemId: "timeline-item-example",
} satisfies GetTimelineItemRequest;

const timelineItemExample = {
  id: "timeline-item-example",
  actor: {
    id: "timeline-author-example",
    displayName: "Timeline author",
    layer: "party",
    initials: "TA",
  },
  content: "A calm update from today.",
  publishedAt: "2026-05-30T17:00:00.000Z",
} satisfies TimelineItem;

export const getTimelineItemSuccessResponseExample = {
  apiVersion,
  data: { timelineItem: timelineItemExample },
} satisfies GetTimelineItemSuccessResponse;

export const getTimelineItemErrorResponseExample = {
  apiVersion,
  error: {
    code: "TIMELINE_ITEM_NOT_FOUND",
    message: "Timeline item not found.",
  },
} satisfies GetTimelineItemErrorResponse;

export const getTimelineItemsSuccessResponseExample = {
  apiVersion,
  data: { timelineItems: [timelineItemExample] },
} satisfies GetTimelineItemsSuccessResponse;

export const createTimelinePostBodyExample = {
  content: "A quiet hello from the forest.",
  audience: "party",
} satisfies CreateTimelinePostBody;

export const createTimelinePostSuccessResponseExample = {
  apiVersion,
  data: { timelineItem: timelineItemExample },
} satisfies CreateTimelinePostSuccessResponse;

export const timelinePostErrorResponseExample = {
  apiVersion,
  error: {
    code: "INVALID_REQUEST",
    message: "Invalid Timeline post.",
  },
} satisfies TimelinePostErrorResponse;
