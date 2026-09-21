import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GetTimelineItemsResult } from "@cloud-forest/api-client";

import type { Care } from "@/types/care";

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

function care(overrides: Partial<Care> = {}): Care {
  return {
    id: "care-1",
    direction: "receive",
    category: "food",
    subtype: "",
    days: ["thursday"],
    times: ["evening"],
    timeNote: "",
    location: "Party kitchen",
    requirements: "Soup",
    sensitivities: "Nothing spicy",
    audience: "Party",
    status: "open",
    createdAt: "2026-09-02T19:00:00.000Z",
    expiresAt: "2030-09-02T19:00:00.000Z",
    originator: { id: "anya", displayName: "Anya Reed" },
    ...overrides,
  };
}

function noTimelineItems(): GetTimelineItemsResult {
  return {
    ok: true,
    status: 200,
    value: { apiVersion: "v1", data: { timelineItems: [] } },
  };
}

describe("TimelinePanel", () => {
  it("orders Give and Receive Care records newest first", () => {
    const receiveCare = care();
    const giveCare = care({
      id: "care-2",
      direction: "give",
      createdAt: "2026-09-02T18:00:00.000Z",
      originator: { id: "you", displayName: "You" },
    });

    render(
      <TimelinePanel
        apiClient={{
          getTimelineItems: vi.fn().mockResolvedValue(noTimelineItems()),
        }}
        cares={[giveCare, receiveCare]}
      />,
    );

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAccessibleName("Anya Reed shared food Care");
    expect(cards[1]).toHaveAccessibleName("Open food Care");
  });

  it("interleaves Timeline posts and Care records chronologically", async () => {
    const receiveCare = care();
    const giveCare = care({
      id: "care-2",
      direction: "give",
      createdAt: "2026-09-02T18:00:00.000Z",
      originator: { id: "you", displayName: "You" },
    });
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
        cares={[giveCare, receiveCare]}
      />,
    );

    expect(await screen.findByText(post.content)).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards[0]).toHaveTextContent(post.content);
    expect(cards[1]).toHaveAccessibleName("Anya Reed shared food Care");
    expect(cards[2]).toHaveAccessibleName("Open food Care");
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
      getTimelineItems: vi.fn().mockResolvedValue(noTimelineItems()),
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
