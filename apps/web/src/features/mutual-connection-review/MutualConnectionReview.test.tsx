import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";

describe("MutualConnectionReview", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?prototype=mutual-connection");
  });

  it("keeps private Person details alongside an explicit connection confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Make it mutual" }));
    await user.click(screen.getByRole("button", { name: "Show code" }));
    expect(
      screen.getByText("I consent to a connection. Let’s make it real."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Continue to confirmation" }),
    );
    expect(
      screen.getByRole("heading", { name: "Is this the person you mean?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Rowan Lee")).toBeInTheDocument();
    expect(screen.queryByText("Scoot")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Confirm connection" }),
    );
    expect(
      screen.getByRole("heading", { name: "Connected with Rowan Lee" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("my safe harbor on ordinary days"),
    ).toBeInTheDocument();
  });

  it("does not connect from scanning without an explicit confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Make it mutual" }));
    await user.click(screen.getByRole("button", { name: "Scan code" }));
    await user.click(screen.getByRole("button", { name: "Use scanned code" }));

    expect(
      screen.getByRole("button", { name: "Confirm connection" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Connected with Rowan Lee" }),
    ).not.toBeInTheDocument();
  });
});
