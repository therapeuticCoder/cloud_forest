import assert from "node:assert/strict";
import test from "node:test";
import Compile from "typebox/compile";
import {
  sendCareMessageBodySchema,
  isCareMessagesResponse,
  isCareUnreadResponse,
} from "./careConversationContract.ts";

test("conversation contracts restrict plain text and validate unread/message responses", () => {
  const send = Compile(sendCareMessageBodySchema);
  assert.equal(send.Check({ text: "x".repeat(2000) }), true);
  for (const value of [
    { text: " " },
    { text: "x".repeat(2001) },
    { text: "Hi", attachment: "file" },
    { text: "Hi", senderUserId: "another-user" },
  ])
    assert.equal(send.Check(value), false);
  assert.equal(
    isCareMessagesResponse({ apiVersion: "v1", data: { messages: [] } }),
    true,
  );
  assert.equal(
    isCareUnreadResponse({
      apiVersion: "v1",
      data: { conversations: [{ careId: "care-a", unreadCount: 0 }] },
    }),
    true,
  );
  assert.equal(
    isCareUnreadResponse({
      apiVersion: "v1",
      data: { conversations: [{ careId: "care-a", unreadCount: -1 }] },
    }),
    false,
  );
});
