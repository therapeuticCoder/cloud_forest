import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

async function openCurator() {
  const user = userEvent.setup();

  render(<App />);
  await user.click(screen.getAllByRole("button", { name: /curator/i })[0]);

  return user;
}

describe("App", () => {
  it("renders Timeline as a standalone default view", () => {
    render(<App />);

    expect(screen.queryAllByRole("button", { name: /timeline/i })).toHaveLength(
      0,
    );
    expect(screen.getAllByRole("button", { name: /curator/i })).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: /galaxy/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /galaxy view/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /timeline view/i }));
    expect(
      screen.queryByRole("heading", { name: /whole forest/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /write/i })).toBeInTheDocument();
    expect(screen.getByText(/yesterday/i)).toBeInTheDocument();
  });

  it("renders the four gallery layers at their canonical sizes", async () => {
    await openCurator();

    const partyLayer = screen.getByRole("article", { name: /party layer/i });
    const tribeLayer = screen.getByRole("article", { name: /tribe layer/i });
    const guildLayer = screen.getByRole("article", { name: /guilds layer/i });
    const signalLayer = screen.getByRole("article", { name: /signals layer/i });

    expect(partyLayer.querySelectorAll("[data-curator-tile]")).toHaveLength(6);
    expect(
      within(partyLayer).getByRole("button", { name: /open you/i }),
    ).toBeInTheDocument();
    expect(within(tribeLayer).getAllByRole("button")).toHaveLength(100);
    expect(within(guildLayer).getAllByRole("button")).toHaveLength(5);
    expect(within(signalLayer).getAllByRole("button")).toHaveLength(10);
    expect(
      within(tribeLayer).getAllByRole("region", { name: /neighborhood/i }),
    ).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
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

  it("adds a Party member through the mobile wizard", async () => {
    const user = await openCurator();

    await user.click(screen.getByRole("button", { name: /add$/i }));
    await user.type(screen.getByPlaceholderText("Their name"), "Nia");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Skip for now" }));
    await user.click(screen.getByRole("button", { name: "Relative" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("They are..."),
      "my bright spot",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Add to Party" }));

    expect(
      screen.getByRole("button", { name: /open nia/i }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /open nia/i })).toHaveFocus(),
    );
    expect(
      screen.queryByRole("button", { name: /add a party member/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeDisabled();
  });

  it("opens and cancels the wizard from the empty Party slot", async () => {
    const user = await openCurator();

    await user.click(
      screen.getByRole("button", { name: /add a party member/i }),
    );
    expect(
      screen.getByRole("region", { name: /add a party member/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /cancel adding party member/i }),
    );
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add a party member/i }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /add a party member/i }),
      ).toHaveFocus(),
    );
  });

  it("asks the Party for a meal from Timeline and prepends an open request", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Receive" })[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Meal" })).toHaveFocus(),
    );
    expect(
      screen.getByRole("button", { name: "Transportation" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Meal" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Meal" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Tonight after 6"),
      "Tonight after 6",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Soup, rice, or something easy"),
      "Soup or rice",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(
      screen.getByRole("button", { name: "Leave it at my door" }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByText("This request will be shared with your Party."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ask my Party" }));

    const request = screen.getByRole("article", {
      name: "Open meal care request",
    });
    expect(request).toHaveTextContent("A meal");
    expect(request).toHaveTextContent("Open");
    expect(request).toHaveTextContent("Shared with: Party");
    expect(screen.getByRole("heading", { name: "Ren" })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Filter to Receive care requests" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Open meal care request" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Filter to Receive care requests" }),
    );
    expect(screen.getByRole("heading", { name: "Ren" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Receive" })[1]);
    await user.click(screen.getByRole("button", { name: "Meal" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Tonight after 6"),
      "Tomorrow morning",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Soup, rice, or something easy"),
      "Toast",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "I’m flexible" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Ask my Party" }));

    expect(
      screen.getAllByRole("article", { name: "Open meal care request" }),
    ).toHaveLength(2);
    await user.click(
      within(
        screen.getAllByRole("article", { name: "Open meal care request" })[0],
      ).getByRole("button", { name: "Withdraw request" }),
    );
    expect(
      screen.getAllByRole("article", { name: "Open meal care request" }),
    ).toHaveLength(1);
  });

  it("opens Receive from Curator and returns to Timeline after asking", async () => {
    const user = await openCurator();

    await user.click(screen.getByRole("button", { name: "Receive" }));
    expect(
      screen.getByRole("region", { name: /ask my party for a meal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meal" })).toBeEnabled();
    await user.click(
      screen.getByRole("button", { name: /cancel asking for care/i }),
    );
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
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
