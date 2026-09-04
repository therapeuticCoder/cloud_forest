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

async function claimIncomingRequest(user: ReturnType<typeof userEvent.setup>) {
  const request = screen.getByRole("article", {
    name: "Incoming meal care request from Anya Reed",
  });
  await user.click(within(request).getByRole("button", { name: "I can help" }));
  await user.click(screen.getByRole("button", { name: "I’ll help with this" }));
  await waitFor(() =>
    expect(screen.getByText("You’re helping Anya.")).toHaveFocus(),
  );
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
    expect(
      screen.getByRole("heading", { name: "Care with Mira Vale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("There isn’t any active care to respond to here."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private history")).not.toBeInTheDocument();

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

  it("shows viewer-appropriate care actions on a person profile", async () => {
    const user = await openCurator();
    const anyaTile = screen.getByRole("button", { name: /open anya reed/i });

    await user.click(anyaTile);

    expect(
      screen.getByRole("heading", { name: "Care with Anya Reed" }),
    ).toBeInTheDocument();
    const request = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    expect(
      within(request).getByRole("button", { name: "I can help" }),
    ).toBeInTheDocument();
    expect(
      within(request).getByRole("button", { name: "Pass this time" }),
    ).toBeInTheDocument();

    await user.click(
      within(request).getByRole("button", { name: "I can help" }),
    );
    await user.click(screen.getByRole("button", { name: "Not now" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "I can help" })).toHaveFocus(),
    );

    await user.click(screen.getByRole("button", { name: "Back to Curator" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /open anya reed/i }),
      ).toHaveFocus(),
    );
  });

  it("keeps active requests, commitments, and history separate in My Care", async () => {
    window.localStorage.setItem(
      "cloud-forest:care-lifecycle:v2",
      JSON.stringify({
        version: 2,
        claims: [],
        passes: [],
        seenStates: [],
        completions: [],
        dispositions: [],
        history: [
          {
            id: "care-history-you-withdrawn",
            requestId: "care-request-anya-meal-001",
            ownerId: "you",
            outcome: "withdrawn",
            recordedAt: "2026-09-03T18:00:00.000Z",
          },
        ],
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Open My Care" }));

    expect(
      screen.getByRole("heading", { name: "My requests" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "I’m helping" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Private history" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Withdrawn")).toBeInTheDocument();
    expect(screen.getByText("A meal")).toBeInTheDocument();
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

    const filteredOffer = screen.getByRole("article", {
      name: "Open meal care offer",
    });
    await user.click(
      within(filteredOffer).getByRole("button", { name: "Withdraw offer" }),
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
    const filteredIncomingRequest = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    await user.click(
      within(filteredIncomingRequest).getByRole("button", {
        name: "I can help",
      }),
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
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toHaveTextContent("You’re helping Anya.");
    await user.click(screen.getByRole("button", { name: "Not completed" }));
    expect(
      screen.getByRole("region", {
        name: "Care was not completed for Anya Reed",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("region", { name: "My Care" })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Not completed" }),
      ).toHaveFocus(),
    );
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
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toBeInTheDocument();
  });

  it("keeps care active after one completion and closes it after both participants complete", async () => {
    const user = userEvent.setup();
    render(<App />);
    await claimIncomingRequest(user);

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(
      screen.getByText(
        "You marked this completed. Waiting for the other person.",
      ),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Reviewing as"), "anya");
    expect(
      screen.getByText(
        "The other person marked this completed. What happened for you?",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Completed" }));
    await user.click(
      screen.getByRole("radio", {
        name: "Thank you for feeding me when I needed it.",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save to history" }));
    expect(
      screen.queryByRole("article", { name: "Claimed meal care request" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    expect(
      within(screen.getByRole("region", { name: "Private history" })).getByText(
        "Completed",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You’re not helping with any care requests right now."),
    ).toBeInTheDocument();

    const stored = JSON.parse(
      window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
    );
    expect(stored.completions).toHaveLength(2);
    expect(stored.history).toHaveLength(2);
    expect(stored.gratitudes).toHaveLength(1);
  });

  it("publishes receiver gratitude immediately while care awaits the giver", async () => {
    const user = userEvent.setup();
    render(<App />);
    await claimIncomingRequest(user);
    await user.selectOptions(screen.getByLabelText("Reviewing as"), "anya");

    await user.click(screen.getByRole("button", { name: "Completed" }));
    const gratitude = screen.getByRole("region", {
      name: "Thank Anya Reed's helper",
    });
    await user.click(
      within(gratitude).getByRole("radio", {
        name: "Thank you for making care feel easy.",
      }),
    );
    await user.type(
      within(gratitude).getByLabelText(/add your own words/i),
      "The soup made tonight possible.",
    );
    await user.click(
      within(gratitude).getByRole("button", { name: "Continue" }),
    );
    expect(gratitude).toHaveTextContent("Save to history");
    expect(gratitude).toHaveTextContent("Post to Tribe and save to history");
    await user.click(
      within(gratitude).getByRole("checkbox", {
        name: "Post to Tribe as “A neighbor”",
      }),
    );
    await user.click(
      within(gratitude).getByRole("button", {
        name: "Post to Tribe and save to history",
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          "You marked this completed. Waiting for the other person.",
        ),
      ).toHaveFocus(),
    );
    const tribePost = screen.getByRole("article", {
      name: "Tribe gratitude from A neighbor",
    });
    expect(tribePost).toHaveTextContent("Thank you for making care feel easy.");
    expect(tribePost).toHaveTextContent("The soup made tonight possible.");
    expect(tribePost).not.toHaveTextContent("Anya Reed");

    const stored = JSON.parse(
      window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
    );
    expect(stored.gratitudes).toEqual([
      expect.objectContaining({
        receiverId: "anya",
        giverId: "you",
        postToTimeline: true,
        anonymized: true,
      }),
    ]);
    expect(stored.history).toEqual([]);

    await user.selectOptions(screen.getByLabelText("Reviewing as"), "you");
    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    const privateHistory = screen.getByRole("region", {
      name: "Private history",
    });
    expect(privateHistory).toHaveTextContent("From Anya Reed to you.");
    expect(privateHistory).toHaveTextContent("The soup made tonight possible.");

    await user.click(
      within(
        screen.getByRole("article", {
          name: "Incoming meal care request from Anya Reed",
        }),
      ).getByRole("button", { name: "Completed" }),
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("article", {
        name: "Tribe gratitude from A neighbor",
      }),
    ).toBeInTheDocument();
  });

  it("collects a private reason before closing not-completed care", async () => {
    const user = userEvent.setup();
    render(<App />);
    await claimIncomingRequest(user);

    await user.click(screen.getByRole("button", { name: "Not completed" }));
    const outcome = screen.getByRole("region", {
      name: "Care was not completed for Anya Reed",
    });
    expect(outcome).toHaveTextContent("not a rating or a public report");
    expect(
      within(outcome).getByRole("button", { name: "Close" }),
    ).toBeDisabled();
    await user.type(
      within(outcome).getByLabelText("Reason"),
      "The timing did not work",
    );
    await user.click(within(outcome).getByRole("button", { name: "Close" }));

    expect(
      screen.queryByRole("article", { name: "Claimed meal care request" }),
    ).not.toBeInTheDocument();
    const stored = JSON.parse(
      window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
    );
    expect(stored.dispositions).toEqual([
      expect.objectContaining({
        kind: "close",
        reason: "The timing did not work",
      }),
    ]);
    expect(stored.history).toHaveLength(2);
  });

  it("closes the original care and creates a linked request when trying again", async () => {
    const user = userEvent.setup();
    render(<App />);
    await claimIncomingRequest(user);

    await user.click(screen.getByRole("button", { name: "Not completed" }));
    const outcome = screen.getByRole("region", {
      name: "Care was not completed for Anya Reed",
    });
    await user.type(
      within(outcome).getByLabelText("Reason"),
      "We missed each other",
    );
    await user.click(
      within(outcome).getByRole("button", { name: "Postpone / try again" }),
    );

    const retry = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    expect(
      within(retry).getByRole("button", { name: "I can help" }),
    ).toBeInTheDocument();
    const stored = JSON.parse(
      window.localStorage.getItem("cloud-forest:care-lifecycle:v2") ?? "{}",
    );
    expect(stored.dispositions).toEqual([
      expect.objectContaining({
        kind: "retry",
        successorRequestId: expect.stringContaining(
          "care-request-anya-meal-001-retry-",
        ),
      }),
    ]);
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
