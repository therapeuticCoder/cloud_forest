import {
  createApiClient,
  type ApiClient,
  type GetTimelineItemResponse,
  type GetTimelineItemsResult,
} from "@cloud-forest/api-client";

export const timelineApiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

export type RemoteTimelineItem =
  GetTimelineItemResponse["data"]["timelineItem"];
export type TimelineItemsFailure = Extract<
  GetTimelineItemsResult,
  { ok: false }
>;
export type TimelineApiClient = Partial<
  Pick<ApiClient, "createTimelinePost" | "getTimelineItems">
>;

export type TimelineItemState =
  | { status: "loading" }
  | {
      status: "success";
      items: readonly RemoteTimelineItem[];
      source: "cache" | "live";
      offline: boolean;
      error?: TimelineError;
    }
  | { status: "empty" }
  | { status: "error"; recoverable: boolean; error: TimelineError };

export type TimelineError = { code: number | "NETWORK"; message: string };

function timelineErrorCode(
  result: TimelineItemsFailure,
): TimelineError["code"] {
  return result.kind === "network" ? "NETWORK" : result.status;
}

function timelineErrorMessage(result: TimelineItemsFailure) {
  if (result.kind === "http") return result.error.error.message;
  if (result.kind === "network") {
    return "Cloud Forest couldn’t reach Timeline. Try again when you’re ready.";
  }
  return "Timeline posts couldn’t be loaded. Try again when you’re ready.";
}

export function timelineError(result: TimelineItemsFailure): TimelineError {
  return {
    code: timelineErrorCode(result),
    message: timelineErrorMessage(result),
  };
}
