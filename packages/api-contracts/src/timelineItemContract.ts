import type { TimelineItem } from "@cloud-forest/domain";
import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

export const apiVersion = "v1" as const;
export const timelineItemPath = "/api/v1/timeline-items/:timelineItemId";

const opaqueIdSchema = Type.String({ minLength: 1, maxLength: 128 });
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
export type GetTimelineItemErrorResponse = Static<
  typeof getTimelineItemErrorResponseSchema
>;

const requestValidator = Compile(getTimelineItemRequestSchema);
const successResponseValidator = Compile(getTimelineItemSuccessResponseSchema);
const errorResponseValidator = Compile(getTimelineItemErrorResponseSchema);

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

export const getTimelineItemRequestExample = {
  timelineItemId: "timeline-item-mira-soup-001",
} satisfies GetTimelineItemRequest;

const timelineItemExample = {
  id: "timeline-item-mira-soup-001",
  actor: {
    id: "mira",
    displayName: "Mira",
    layer: "party",
    initials: "M",
  },
  content:
    "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?",
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
