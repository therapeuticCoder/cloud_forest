import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

async function openCurator() {
  const user = userEvent.setup();

  render(<App />);
  await user.click(screen.getByRole("button", { name: /curator/i }));

  return user;
}

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
  });

  it("renders the four gallery layers at their canonical sizes", async () => {
    await openCurator();

    const partyLayer = screen.getByRole("article", { name: /party layer/i });
    const tribeLayer = screen.getByRole("article", { name: /tribe layer/i });
    const guildLayer = screen.getByRole("article", { name: /guilds layer/i });
    const signalLayer = screen.getByRole("article", { name: /signals layer/i });

    expect(within(partyLayer).getAllByRole("button")).toHaveLength(6);
    expect(
      within(partyLayer).getByRole("button", { name: /open you/i }),
    ).toBeInTheDocument();
    expect(within(tribeLayer).getAllByRole("button")).toHaveLength(100);
    expect(within(guildLayer).getAllByRole("button")).toHaveLength(5);
    expect(within(signalLayer).getAllByRole("button")).toHaveLength(10);
    expect(
      within(tribeLayer).getAllByRole("region", { name: /neighborhood/i }),
    ).toHaveLength(5);
    expect(
      screen.queryByRole("heading", { name: "Party" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /studio night/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /climate lab/i }),
    ).toBeInTheDocument();
    expect(partyLayer.className).toContain("motion-reduce:transition-none");
  });

  it("opens a tile destination and restores focus on back", async () => {
    const user = await openCurator();
    const curator = screen.getByRole("region", { name: /curator view/i });
    const miraTile = screen.getByRole("button", { name: /open mira vale/i });

    curator.scrollTop = 320;
    await user.click(miraTile);

    expect(
      screen.getByRole("region", { name: /mira vale details/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Details coming next")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to curator/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /open mira vale/i }),
      ).toHaveFocus();
      expect(
        screen.getByRole("region", { name: /curator view/i }).scrollTop,
      ).toBe(320);
    });
  });

  it("closes the selected destination with Escape or browser back", async () => {
    const user = await openCurator();

    await user.click(
      screen.getByRole("button", { name: /open mutual care circle/i }),
    );
    await user.keyboard("{Escape}");
    expect(
      screen.getByRole("region", { name: /curator view/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /open city budget watch/i }),
    );
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /curator view/i }),
      ).toBeInTheDocument();
    });
  });
});
