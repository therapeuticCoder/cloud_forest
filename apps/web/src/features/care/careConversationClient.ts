import { createApiClient, type ApiClient } from "@cloud-forest/api-client";

export type CareConversationClient = Pick<
  ApiClient,
  | "getCareMessages"
  | "getCareUnread"
  | "sendCareMessage"
  | "markCareMessagesRead"
>;
export const careConversationClient: CareConversationClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});
