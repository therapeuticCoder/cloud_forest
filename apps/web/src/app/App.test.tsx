import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

async function openCurator() {
  const user = userEvent.setup();

  render(<App />);
  await user.click(screen.getAllByRole("button", { name: /curator/i })[0]);

  return user;
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

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
      within(partyLayer).getByRole("button", { name: /open my care/i }),
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
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "Receive" })[1],
      ).toHaveFocus(),
    );

    const request = screen.getByRole("article", {
      name: "Open meal care request",
    });
    expect(request).toHaveTextContent("Meal request");
    expect(request).toHaveTextContent("Open");
    expect(request).toHaveTextContent("Shared with: Party");
    expect(screen.getByRole("heading", { name: "Ren" })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Open meal care request" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
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

  it("keeps a seen request minimized per viewer across reload", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);
    const incomingRequest = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });

    await user.click(
      within(incomingRequest).getByRole("button", { name: "I’ve seen this" }),
    );
    expect(
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed, minimized",
      }),
    ).not.toHaveTextContent("Nothing spicy");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Show details" }),
      ).toHaveFocus(),
    );

    firstRender.unmount();
    render(<App />);
    const minimizedRequest = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed, minimized",
    });
    await user.click(
      within(minimizedRequest).getByRole("button", { name: "Show details" }),
    );
    expect(
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toHaveTextContent("Nothing spicy");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "I’ve seen this" }),
      ).toHaveFocus(),
    );
  });

  it("passes an incoming request only for the current viewer and persists it", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);
    const incomingRequest = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });

    await user.click(
      within(incomingRequest).getByRole("button", { name: "Pass this time" }),
    );

    expect(
      screen.queryByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "You passed on Anya’s request this time. Other Party members can still respond.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Filter to Receive requests" }),
      ).toHaveFocus(),
    );
    expect(
      JSON.parse(
        window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
      ).passes,
    ).toEqual([
      expect.objectContaining({
        requestId: "care-request-anya-meal-001",
        actorId: "you",
      }),
    ]);

    firstRender.unmount();
    render(<App />);
    expect(
      screen.queryByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).not.toBeInTheDocument();
  });

  it("omits an unclaimed request after its lifespan expires", () => {
    vi.setSystemTime(new Date("2031-09-04T12:00:00.000Z"));
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>(() => undefined),
    );

    render(<App />);

    expect(
      screen.queryByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).not.toBeInTheDocument();
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

  it("offers a meal from Timeline and withdraws the available offer", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Give" })[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Meal" })).toHaveFocus(),
    );
    expect(screen.getByRole("button", { name: "Meal" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Transportation" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Meal" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Soup, rice, or something easy"),
      "A pot of soup",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByPlaceholderText("Saturday afternoon"),
      "Saturday afternoon",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "I’m flexible" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByText("This offer will be shared with your Party."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Offer to my Party" }));
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Give" })[1]).toHaveFocus(),
    );

    const offer = screen.getByRole("article", {
      name: "Open meal care offer",
    });
    expect(offer).toHaveTextContent("Meal offer");
    expect(offer).toHaveTextContent("A pot of soup");
    expect(offer).toHaveTextContent("Saturday afternoon");
    expect(offer).toHaveTextContent("Open");
    expect(offer).toHaveTextContent("Shared with: Party");

    await user.click(
      screen.getByRole("button", { name: "Filter to Give offers" }),
    );
    expect(
      screen.getByRole("article", { name: "Open meal care offer" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(offer).getByRole("button", { name: "Withdraw offer" }),
    );
    expect(
      screen.queryByRole("article", { name: "Open meal care offer" }),
    ).not.toBeInTheDocument();
  });

  it("opens Give from Curator and returns to Curator when cancelled", async () => {
    const user = await openCurator();

    await user.click(screen.getByRole("button", { name: "Give" }));
    expect(
      screen.getByRole("region", { name: /offer a meal to my party/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meal" })).toBeEnabled();
    await user.click(
      screen.getByRole("button", { name: /cancel offering care/i }),
    );
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Give" })).toHaveFocus(),
    );
  });

  it("claims an incoming request, keeps it after reload, and shows it in My Care", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);
    const incomingRequest = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });

    expect(incomingRequest).toHaveTextContent("Anya is asking for a meal");
    expect(incomingRequest).toHaveTextContent("From your Party");
    await user.click(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
    );
    expect(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();
    await user.click(
      within(incomingRequest).getByRole("button", { name: "I can help" }),
    );

    const confirmation = screen.getByRole("region", {
      name: "Commit to helping Anya Reed",
    });
    expect(confirmation).toHaveTextContent(
      "This makes a commitment to provide this care.",
    );
    expect(confirmation).toHaveTextContent("Thursday evening");
    expect(confirmation).toHaveTextContent("Nothing spicy");
    await user.click(
      within(confirmation).getByRole("button", { name: "Not now" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "I can help" })).toHaveFocus(),
    );
    expect(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "I can help" }));
    await user.click(
      within(
        screen.getByRole("region", {
          name: "Commit to helping Anya Reed",
        }),
      ).getByRole("button", {
        name: "I’ll help with this",
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("You’re helping Anya.")).toHaveFocus(),
    );
    expect(
      screen.getByRole("button", { name: "Filter to Receive requests" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("heading", { name: "Ren" }),
    ).not.toBeInTheDocument();
    expect(
      within(
        screen.getByRole("article", {
          name: "Incoming meal care request from Anya Reed",
        }),
      ).queryByRole("button", { name: "I can help" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    expect(screen.getByRole("region", { name: "My Care" })).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Helping Anya Reed" }),
    ).toHaveTextContent("You’re helping Anya Reed.");
    await user.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Open My Care" }),
      ).toHaveFocus(),
    );

    firstRender.unmount();
    render(<App />);

    expect(screen.getByText("You’re helping Anya.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    expect(
      screen.getByRole("article", { name: "Helping Anya Reed" }),
    ).toBeInTheDocument();
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

  it("reviews open, passed, demoted, and claimed care without changing state on switch", async () => {
    const user = userEvent.setup();
    render(<App />);
    const perspective = screen.getByLabelText("Reviewing as");
    const incomingName = "Incoming meal care request from Anya Reed";

    expect(screen.getByText(/not account switching/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pass this time" }));
    expect(
      screen.queryByRole("article", { name: incomingName }),
    ).not.toBeInTheDocument();

    for (const partyViewer of ["mira", "sol", "dev"]) {
      await user.selectOptions(perspective, partyViewer);
      expect(
        screen.getByRole("article", { name: incomingName }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Pass this time" }));
    }

    expect(
      screen.getByText(
        "Your Party passed on Anya’s request. It is now shared with the original Tribe audience.",
      ),
    ).toBeInTheDocument();
    await user.selectOptions(perspective, "nearby-family-1");
    expect(
      screen.getByRole("article", { name: incomingName }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "I can help" }));
    await user.click(
      screen.getByRole("button", { name: "I’ll help with this" }),
    );
    expect(await screen.findByText("You’re helping Anya.")).toBeInTheDocument();

    await user.selectOptions(perspective, "anya");
    expect(
      screen.getByRole("article", { name: "Claimed meal care request" }),
    ).toHaveTextContent("Someone is helping with this request.");

    await user.selectOptions(perspective, "mira");
    expect(
      screen.queryByRole("article", { name: incomingName }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: "Claimed meal care request" }),
    ).not.toBeInTheDocument();

    await user.selectOptions(perspective, "nearby-family-1");
    expect(screen.getByText("You’re helping Anya.")).toBeInTheDocument();
    const stored = JSON.parse(
      window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
    );
    expect(stored.passes).toHaveLength(4);
    expect(stored.claims).toEqual([
      expect.objectContaining({ claimerId: "nearby-family-1" }),
    ]);
  });
});
