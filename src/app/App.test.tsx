import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders Timeline as a standalone default view", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /timeline/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /curator/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /timeline view/i }));
    expect(
      screen.getByText(/not everything matters the same/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /field map/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/jordan from work/i)).toBeInTheDocument();
    expect(
      screen.getByText(/lan party this weekend if you're interested/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/haven't seen you since your mother's birthday party/i),
    ).toBeInTheDocument();
  });

  it("switches from Timeline to the Curator layer stack", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /curator/i }));

    expect(screen.getByRole("region", { name: /curator view/i }));
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tribe" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Guilds" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Signals" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("article", { name: /party card/i }),
    ).toHaveLength(6);
    expect(screen.getByText("Mira Vale")).toBeInTheDocument();
    expect(screen.getByText("Lena Moss")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /timeline view/i }),
    ).not.toBeInTheDocument();
  });
});
