import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Care } from "@/types/care";

import { CareCard } from "./CareCard";

const receiveCare: Care = {
  id: "care-1",
  direction: "receive",
  category: "food",
  subtype: "A warm meal",
  days: ["thursday"],
  times: ["evening"],
  timeNote: "Flexible",
  location: "Leave it at my door",
  requirements: "Soup or rice",
  sensitivities: "Nothing spicy",
  audience: "Party",
  status: "open",
  createdAt: "2026-09-03T10:00:00.000Z",
  expiresAt: "2026-09-10T10:00:00.000Z",
  originator: { id: "anya", displayName: "Anya Reed" },
};

describe("CareCard", () => {
  it.each([
    { direction: "receive" as const, viewerId: "you", action: "I can help" },
    { direction: "give" as const, viewerId: "you", action: "Receive" },
    { direction: "receive" as const, viewerId: "anya", action: "Withdraw" },
  ])(
    "stops offering $action at the leaf expiration boundary",
    ({ direction, viewerId, action }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-10T09:59:30.000Z"));
      try {
        render(
          <CareCard
            canPass
            care={{ ...receiveCare, direction }}
            minimized={false}
            presentation="leaf"
            onCommitToCare={vi.fn()}
            onPass={vi.fn()}
            onWithdraw={vi.fn()}
            onOpenDetails={vi.fn()}
            viewerId={viewerId}
          />,
        );
        expect(screen.getByText("Thu | Evening")).toBeInTheDocument();
        expect(screen.getByText("Flexible")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: action }),
        ).toBeInTheDocument();
        if (viewerId === "you") {
          expect(
            screen.getByRole("button", { name: "Pass" }),
          ).toBeInTheDocument();
        }

        act(() => vi.advanceTimersByTime(30_000));

        expect(
          screen.queryByRole("button", { name: action }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Pass" }),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Opportunity passed")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Details for food Care" }),
        ).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it("keeps completion available for a claimed leaf past its original expiration", () => {
    render(
      <CareCard
        canPass={false}
        care={{
          ...receiveCare,
          status: "claimed",
          expiresAt: "2000-01-01T00:00:00.000Z",
          participant: { id: "you", displayName: "You" },
        }}
        minimized={false}
        presentation="leaf"
        onRecordCompleted={vi.fn()}
        viewerId="you"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Mark done" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Opportunity passed")).not.toBeInTheDocument();
  });

  it("presents a shared Care and lets a viewer minimize it", async () => {
    const user = userEvent.setup();
    const onSetMinimized = vi.fn();

    render(
      <CareCard
        canPass
        care={receiveCare}
        minimized={false}
        onCommitToCare={vi.fn()}
        onPass={vi.fn()}
        onSetMinimized={onSetMinimized}
        viewerId="you"
      />,
    );

    const card = screen.getByRole("article", {
      name: "Anya Reed shared food Care",
    });
    expect(card).toHaveTextContent("Thursday, Evening · Flexible");
    expect(card).toHaveTextContent("Nothing spicy");

    await user.click(
      within(card).getByRole("button", { name: "I’ve seen this" }),
    );
    expect(onSetMinimized).toHaveBeenCalledWith("care-1", true);
  });

  it("keeps a minimized Care identifiable and expandable", async () => {
    const user = userEvent.setup();
    const onSetMinimized = vi.fn();

    render(
      <CareCard
        canPass
        care={receiveCare}
        minimized
        onSetMinimized={onSetMinimized}
        viewerId="you"
      />,
    );

    const card = screen.getByRole("article", {
      name: "Anya Reed shared food Care, minimized",
    });
    expect(card).toHaveTextContent("Needs help");
    expect(card).not.toHaveTextContent("Nothing spicy");

    await user.click(
      within(card).getByRole("button", { name: "Show details" }),
    );
    expect(onSetMinimized).toHaveBeenCalledWith("care-1", false);
  });

  it("uses the same card for Give Care and exposes the receive action", async () => {
    const user = userEvent.setup();
    const onCommitToCare = vi.fn();
    const giveCare = {
      ...receiveCare,
      id: "care-2",
      direction: "give" as const,
      originator: { id: "mira", displayName: "Mira Vale" },
    };

    render(
      <CareCard
        canPass
        care={giveCare}
        minimized={false}
        onCommitToCare={onCommitToCare}
        onPass={vi.fn()}
        viewerId="you"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "I will receive this" }),
    );
    expect(onCommitToCare).toHaveBeenCalledWith(giveCare);
  });

  it("shows completion actions for a claimed Care", async () => {
    const user = userEvent.setup();
    const onRecordCompleted = vi.fn();
    const claimedCare: Care = {
      ...receiveCare,
      status: "claimed",
      claimedAt: "2026-09-04T10:00:00.000Z",
      participant: { id: "you", displayName: "River Tester" },
      originatorCompletedAt: "2026-09-15T15:00:00.000Z",
    };

    render(
      <CareCard
        canPass={false}
        care={claimedCare}
        minimized={false}
        onRecordCompleted={onRecordCompleted}
        viewerId="you"
      />,
    );

    expect(
      screen.getByText(
        "The other person marked this completed. What happened for you?",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark done" }));
    expect(onRecordCompleted).toHaveBeenCalledWith(claimedCare);
  });
});
