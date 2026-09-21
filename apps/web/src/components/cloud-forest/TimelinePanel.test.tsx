import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GetTimelineItemsResult } from "@cloud-forest/api-client";

import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

import { TimelinePanel } from "./TimelinePanel";

const timelineItem = {
  id: "timeline-post-panel-test",
  actor: {
    id: "timeline-panel-author",
    displayName: "Timeline author",
    layer: "party" as const,
    initials: "TA",
  },
  content: "A calm update from today.",
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
      giver: { id: "you", displayName: "You" },
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
      audienceSnapshot: {
        partyMemberIds: ["mira"],
        tribeMemberIds: ["neighbors-1"],
      },
      status: "open",
      createdAt: "2026-09-02T19:00:00.000Z",
      expiresAt: "2030-09-02T19:00:00.000Z",
      requester: { kind: "self", id: "you", displayName: "You" },
    };

    render(
      <TimelinePanel
        apiClient={{
          getTimelineItems: vi.fn(
            () => new Promise<GetTimelineItemsResult>(() => undefined),
          ),
        }}
        careOffers={[offer]}
        careRequests={[request]}
      />,
    );

    const cards = screen
      .getAllByRole("article")
      .filter((article) => article.classList.contains("care-request-card"));
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Food request");
    expect(cards[1]).toHaveTextContent("Food offer");
  });

  it("interleaves Timeline posts and Care records chronologically", async () => {
    const offer: GiveCareOffer = {
      id: "offer-chronology",
      kind: "meal",
      direction: "give",
      offer: "A meal",
      mealDescription: "Soup",
      availableWhen: "Tonight",
      handoffStyle: "I can deliver it",
      audience: "Party",
      status: "available",
      createdAt: "2026-09-02T18:00:00.000Z",
      giver: { id: "you", displayName: "You" },
    };
    const request: ReceiveCareRequest = {
      id: "request-chronology",
      kind: "meal",
      direction: "receive",
      need: "A meal",
      helpfulWhen: "Tomorrow",
      foodWorks: "Rice",
      foodDoesNotWork: "None",
      handoffStyle: "Leave it at my door",
      audience: "Party",
      audienceSnapshot: {
        partyMemberIds: ["mira"],
        tribeMemberIds: ["neighbors-1"],
      },
      status: "open",
      createdAt: "2026-09-02T19:00:00.000Z",
      expiresAt: "2030-09-02T19:00:00.000Z",
      requester: { kind: "self", id: "you", displayName: "You" },
    };
    const post = {
      ...timelineItem,
      publishedAt: "2026-09-02T20:00:00.000Z",
    };

    render(
      <TimelinePanel
        apiClient={{
          getTimelineItems: vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            value: { apiVersion: "v1", data: { timelineItems: [post] } },
          }),
        }}
        careOffers={[offer]}
        careRequests={[request]}
      />,
    );

    expect(await screen.findByText(post.content)).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards[0]).toHaveTextContent(post.content);
    expect(cards[1]).toHaveTextContent("Food request");
    expect(cards[2]).toHaveTextContent("Food offer");
  });

  it("keeps the composer open when Escape closes the audience menu", async () => {
    const user = userEvent.setup();

    render(
      <TimelinePanel
        apiClient={{ createTimelinePost: vi.fn() }}
        postComposerOpen
      />,
    );

    const dialog = screen.getByRole("dialog");
    const audienceTrigger = within(dialog).getByRole("button", {
      name: "Audience",
    });
    await user.click(audienceTrigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(audienceTrigger).toHaveFocus();
  });

  it("shows loading and then renders the API-backed item", async () => {
    let resolveRequest: ((value: GetTimelineItemsResult) => void) | undefined;
    const apiClient = {
      getTimelineItems: vi.fn(
        () =>
          new Promise<GetTimelineItemsResult>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Timeline");
    resolveRequest?.({
      ok: true,
      status: 200,
      value: { apiVersion: "v1", data: { timelineItems: [timelineItem] } },
    });

    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();
    expect(apiClient.getTimelineItems).toHaveBeenCalledWith();
  });

  it("shows an accessible empty state when no posts are available", async () => {
    const apiClient = {
      getTimelineItems: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        value: { apiVersion: "v1", data: { timelineItems: [] } },
      }),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    expect(
      await screen.findByText("No Timeline posts yet."),
    ).toBeInTheDocument();
  });

  it("filters the API-backed item by relationship layer", async () => {
    const user = userEvent.setup();
    const apiClient = {
      getTimelineItems: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        value: { apiVersion: "v1", data: { timelineItems: [timelineItem] } },
      }),
    };

    render(<TimelinePanel apiClient={apiClient} />);
    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filter to Tribe" }));
    expect(
      await screen.findByText("No Timeline posts are available in this layer."),
    ).toBeInTheDocument();
    expect(screen.queryByText(timelineItem.content)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filter to Party" }));
    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();
  });

  it("offers a keyboard-accessible retry after a recoverable error", async () => {
    const user = userEvent.setup();
    const apiClient = {
      getTimelineItems: vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          kind: "network",
          cause: new Error("API unavailable"),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          value: {
            apiVersion: "v1",
            data: { timelineItems: [timelineItem] },
          },
        }),
    };

    render(<TimelinePanel apiClient={apiClient} />);

    const retryButton = await screen.findByRole("button", {
      name: "Try again",
    });
    retryButton.focus();
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(apiClient.getTimelineItems).toHaveBeenCalledTimes(2),
    );
    expect(await screen.findByText(timelineItem.content)).toBeInTheDocument();
  });
});
