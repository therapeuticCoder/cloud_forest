import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app/App";

describe("InvitedSessionPrototype", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?prototype=invited-session");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>(() => undefined),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only at its explicit review query", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "You’re invited to Cloud Forest" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /timeline view/i }),
    ).not.toBeInTheDocument();
  });

  it("moves through invitation, sign-in, link sent, and current person", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(
      screen.getByRole("heading", { name: "Sign in to Cloud Forest" }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Email me a sign-in link" }),
    );
    expect(
      screen.getByRole("heading", { name: "Check your email" }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Open fictional sign-in link" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Open current person" }),
      ).toHaveFocus(),
    );

    await user.click(
      screen.getByRole("button", { name: "Open current person" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Riley Morgan" });
    expect(
      within(dialog).getByText("riley.morgan@example.test"),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("carries an edited email into the link-sent confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /continue/i }));
    const email = screen.getByRole("textbox", { name: "Email" });
    await user.clear(email);
    await user.type(email, "riley.review@example.test");
    await user.click(
      screen.getByRole("button", { name: "Email me a sign-in link" }),
    );

    expect(screen.getByText("riley.review@example.test")).toBeInTheDocument();
  });

  it("keeps the current-person control available in Curator", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Current person" }));
    const reviewPanel = screen
      .getByText("Fictional review states")
      .closest("details");
    expect(reviewPanel).not.toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Go to Curator" }));
    const partyLayer = screen.getByRole("article", { name: "Party layer" });
    const curatorCurrentPerson = within(partyLayer).getByRole("button", {
      name: "Open current person",
    });
    expect(curatorCurrentPerson).toHaveTextContent("RM");

    await user.click(curatorCurrentPerson);
    expect(
      screen.getByRole("dialog", { name: "Riley Morgan" }),
    ).toBeInTheDocument();
  });

  it("restores focus after closing the current-person sheet and signs out", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Current person" }));
    const trigger = screen.getByRole("button", { name: "Open current person" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(screen.getByText("You’re signed out.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sign in to Cloud Forest" }),
    ).toHaveFocus();
  });

  it("keeps expired, reused, and session-expiry states distinct", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Expired invite" }));
    expect(
      screen.getByRole("heading", { name: "This invitation has expired" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Ask for a new invitation" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reused invite" }));
    expect(
      screen.getByRole("heading", { name: "This invitation was already used" }),
    ).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Ask for a new invitation" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Session expired" }));
    expect(
      screen.getByRole("heading", { name: "Your session ended" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Sign in again" }));
    expect(
      screen.getByRole("heading", { name: "Sign in to Cloud Forest" }),
    ).toHaveFocus();
  });
});
