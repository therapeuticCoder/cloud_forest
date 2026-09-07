import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";

describe("PartyStatePrototype", () => {
  beforeEach(() => {
    window.history.replaceState(
      {},
      "",
      "/?prototype=party-states&review-controls=true",
    );
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("is isolated behind the explicit Party-state review query", () => {
    render(<App />);

    expect(screen.getByText("Annotated Party states")).toBeInTheDocument();
    expect(screen.getByText("Gathering your Party…")).toBeInTheDocument();
  });

  it("hides review controls by default while keeping URL-selected states", () => {
    window.history.replaceState({}, "", "/?prototype=party-states&state=edit");

    render(<App />);

    expect(
      screen.queryByText("Annotated Party states"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Edit Mira" }),
    ).toBeInTheDocument();
  });

  it("offers every requested state with a visible annotation", async () => {
    const user = userEvent.setup();
    render(<App />);

    for (const label of [
      "Loading",
      "Empty",
      "Add",
      "Edit",
      "Remove",
      "Conflict",
      "Unavailable",
      "Retrying",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    await user.click(screen.getByRole("button", { name: "Conflict" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This relationship changed somewhere else.",
    );
    expect(screen.getByText(/STALE_WRITE_CONFLICT/)).toBeInTheDocument();
  });

  it("moves focus to the new state heading", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Empty" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Your Party" })).toHaveFocus(),
    );
  });

  it("uses the existing add-member wizard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("1 of 5")).toBeInTheDocument();
    expect(screen.getByText("What do you call them?")).toBeInTheDocument();
  });

  it("keeps Party member identity read-only while editing the membership", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByText("Mira Vale")).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Profile name" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Friend" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Private note" })).toHaveValue(
      "my calm in the storm",
    );
  });

  it("keeps unavailable and retrying states distinct", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Unavailable" }));
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      screen.getByText("Trying again…").closest("section"),
    ).toHaveAttribute("aria-busy", "true");

    await user.click(screen.getByRole("button", { name: "Unavailable" }));
    await user.click(screen.getByRole("button", { name: "Retrying" }));
    expect(
      screen.getByText("Trying again…").closest("section"),
    ).toHaveAttribute("aria-busy", "true");
  });
});
