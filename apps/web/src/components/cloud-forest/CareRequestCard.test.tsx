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
        claimed={false}
        minimized={false}
        onOfferHelp={vi.fn()}
        onSetMinimized={onSetMinimized}
        onWithdraw={vi.fn()}
        request={request}
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
        claimed={false}
        minimized
        onOfferHelp={vi.fn()}
        onSetMinimized={onSetMinimized}
        onWithdraw={vi.fn()}
        request={request}
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
});
