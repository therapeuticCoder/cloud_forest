import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GetTimelineItemResult } from "@cloud-forest/api-client";

import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

import { TimelinePanel } from "./TimelinePanel";

const timelineItem = {
  id: "timeline-item-mira-soup-001",
  actor: {
    id: "mira",
    displayName: "Mira",
    layer: "party" as const,
    initials: "M",
  },
  content:
    "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?",
  publishedAt: "2026-05-30T17:00:00.000Z",
};

describe("TimelinePanel live item seam", () => {
  it("orders Give and Receive listings newest first", () => {
    const offer: GiveCareOffer = {
      id: "offer-1",
      kind: "meal",
      direction: "give",
      offer: "A meal",
      mealDescription: "Soup",
      availableWhen: "Tonight",
      handoffStyle: "I can deliver it",
      audience: "Party",
      status: "available",
      createdAt: "2026-09-02T18:00:00.000Z",
    };
    const request: ReceiveCareRequest = {
      id: "request-1",
      kind: "meal",
      direction: "receive",
      need: "A meal",
      helpfulWhen: "Tomorrow",
      foodWorks: "Rice",
      foodDoesNotWork: "None",
      handoffStyle: "Leave it at my door",
      audience: "Party",
      status: "open",
      createdAt: "2026-09-02T19:00:00.000Z",
    };

    render(
      <TimelinePanel
        apiClient={{
          getTimelineItem: vi.fn().mockResolvedValue({
            ok: false,
            kind: "network",
            cause: new Error("offline"),
          }),
        }}
        careOffers={[offer]}
        careRequests={[request]}
      />,
    );

    const cards = screen
      .getAllByRole("article")
      .filter((article) => article.classList.contains("care-request-card"));
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Meal request");
    expect(cards[1]).toHaveTextContent("Meal offer");
  });

  it("shows loading and then renders the API-backed item among mock content", async () => {
    let resolveRequest: ((value: GetTimelineItemResult) => void) | undefined;
    const apiClient = {
      getTimelineItem: vi.fn(
        () =>
          new Promise<GetTimelineItemResult>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading one live Timeline item",
    );
    expect(screen.getByText("Ren")).toBeInTheDocument();

    resolveRequest?.({
      ok: true,
      status: 200,
      value: { apiVersion: "v1", data: { timelineItem } },
    });

    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();
    expect(apiClient.getTimelineItem).toHaveBeenCalledWith({
      timelineItemId: timelineItem.id,
    });
  });

  it("shows an accessible empty state while preserving mock content", async () => {
    const apiClient = {
      getTimelineItem: vi.fn().mockResolvedValue({
        ok: false,
        kind: "http",
        status: 404,
        error: {
          apiVersion: "v1",
          error: {
            code: "TIMELINE_ITEM_NOT_FOUND",
            message: "Timeline item not found.",
          },
        },
      }),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No live Timeline item is available",
    );
    expect(screen.getByText("Ren")).toBeInTheDocument();
  });

  it("offers a keyboard-accessible retry after a recoverable error", async () => {
    const user = userEvent.setup();
    const apiClient = {
      getTimelineItem: vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          kind: "network",
          cause: new Error("fictional API outage"),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          value: { apiVersion: "v1", data: { timelineItem } },
        }),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    const retryButton = await screen.findByRole("button", {
      name: "Try again",
    });
    retryButton.focus();
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(apiClient.getTimelineItem).toHaveBeenCalledTimes(2),
    );
    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();
  });
});
