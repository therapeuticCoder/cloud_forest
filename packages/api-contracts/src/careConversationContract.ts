import Type, { type Static } from "typebox";
import Compile from "typebox/compile";
import { carePersonSchema } from "./careContract.ts";

export const careMessagesPath = "/api/v1/cares/:careId/messages";
export const careMessagesReadPath = "/api/v1/cares/:careId/messages/read";
export const careUnreadPath = "/api/v1/cares/unread";
const id = Type.String({ minLength: 1, maxLength: 128 });
export const sendCareMessageBodySchema = Type.Object(
  {
    text: Type.String({ minLength: 1, maxLength: 2000, pattern: "\\S" }),
  },
  { additionalProperties: false },
);
export const readCareMessagesBodySchema = Type.Object(
  { throughMessageId: id },
  { additionalProperties: false },
);
export const careMessagesSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal("v1"),
    data: Type.Object(
      {
        messages: Type.Array(
          Type.Object(
            {
              id,
              sender: carePersonSchema,
              text: Type.String({ minLength: 1, maxLength: 2000 }),
              sentAt: Type.String({ format: "date-time" }),
            },
            { additionalProperties: false },
          ),
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export const careUnreadSuccessSchema = Type.Object(
  {
    apiVersion: Type.Literal("v1"),
    data: Type.Object(
      {
        conversations: Type.Array(
          Type.Object(
            {
              careId: id,
              unreadCount: Type.Integer({ minimum: 0 }),
            },
            { additionalProperties: false },
          ),
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type CareMessagesResponse = Static<typeof careMessagesSuccessSchema>;
export type CareUnreadResponse = Static<typeof careUnreadSuccessSchema>;
const messagesValidator = Compile(careMessagesSuccessSchema);
const unreadValidator = Compile(careUnreadSuccessSchema);
export const isCareMessagesResponse = (
  value: unknown,
): value is CareMessagesResponse => messagesValidator.Check(value);
export const isCareUnreadResponse = (
  value: unknown,
): value is CareUnreadResponse => unreadValidator.Check(value);
