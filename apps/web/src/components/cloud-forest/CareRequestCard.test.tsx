import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ReceiveCareRequest } from "@/types/careRequest";

import { CareRequestCard } from "./CareRequestCard";

const request: ReceiveCareRequest = {
  id: "request-1",
  kind: "meal",
  direction: "receive",
  need: "A meal",
  helpfulWhen: "Thursday evening",
  foodWorks: "Soup or rice",
  foodDoesNotWork: "Nothing spicy",
  handoffStyle: "Leave it at my door",
  audience: "Party",
  audienceSnapshot: {
    partyMemberIds: ["you", "mira"],
    tribeMemberIds: ["ren"],
  },
  status: "open",
  createdAt: "2026-09-03T10:00:00.000Z",
  expiresAt: "2026-09-10T10:00:00.000Z",
  requester: { kind: "party", id: "anya", displayName: "Anya Reed" },
};

describe("CareRequestCard seen presentation", () => {
  it("lets a viewer mark the full request as seen", async () => {
    const user = userEvent.setup();
    const onSetMinimized = vi.fn();
    render(
      <CareRequestCard
        canPass
        claimed={false}
        minimized={false}
        onOfferHelp={vi.fn()}
        onPass={vi.fn()}
        onSetMinimized={onSetMinimized}
        onWithdraw={vi.fn()}
        request={request}
        viewerId="you"
        viewerIsClaimer={false}
      />,
    );

    const card = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    expect(card).toHaveTextContent("Thursday evening");
    await user.click(
      within(card).getByRole("button", { name: "I’ve seen this" }),
    );
    expect(onSetMinimized).toHaveBeenCalledWith("request-1", true);
  });

  it("keeps the compact request identifiable and expandable", async () => {
    const user = userEvent.setup();
    const onSetMinimized = vi.fn();
    render(
      <CareRequestCard
        canPass
        claimed={false}
        minimized
        onOfferHelp={vi.fn()}
        onPass={vi.fn()}
        onSetMinimized={onSetMinimized}
        onWithdraw={vi.fn()}
        request={request}
        viewerId="you"
        viewerIsClaimer={false}
      />,
    );

    const card = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed, minimized",
    });
    expect(card).toHaveTextContent("Anya asked for a meal");
    expect(card).toHaveTextContent("Needs help");
    expect(card).not.toHaveTextContent("Nothing spicy");
    await user.click(
      within(card).getByRole("button", { name: "Show details" }),
    );
    expect(onSetMinimized).toHaveBeenCalledWith("request-1", false);
  });

  it("offers an eligible incoming viewer a distinct pass action", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn();
    render(
      <CareRequestCard
        canPass
        claimed={false}
        minimized={false}
        onOfferHelp={vi.fn()}
        onPass={onPass}
        onSetMinimized={vi.fn()}
        onWithdraw={vi.fn()}
        request={request}
        viewerId="you"
        viewerIsClaimer={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pass this time" }));
    expect(onPass).toHaveBeenCalledWith(request);
  });

  it("shows the claimer their commitment without unrelated actions", () => {
    render(
      <CareRequestCard
        canPass={false}
        claimed
        minimized={false}
        onOfferHelp={vi.fn()}
        onPass={vi.fn()}
        onSetMinimized={vi.fn()}
        onWithdraw={vi.fn()}
        request={request}
        viewerId="you"
        viewerIsClaimer
      />,
    );

    expect(screen.getByText("You’re helping Anya.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pass this time" }),
    ).not.toBeInTheDocument();
  });

  it("shows a claimed requester that help is coming", () => {
    render(
      <CareRequestCard
        canPass={false}
        claimed
        minimized={false}
        onOfferHelp={vi.fn()}
        onPass={vi.fn()}
        onSetMinimized={vi.fn()}
        onWithdraw={vi.fn()}
        request={request}
        viewerId="anya"
        viewerIsClaimer={false}
      />,
    );

    expect(
      screen.getByRole("article", { name: "Claimed meal care request" }),
    ).toHaveTextContent("Help coming");
    expect(
      screen.getByText("Someone is helping with this request."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Withdraw request" }),
    ).not.toBeInTheDocument();
  });
});
