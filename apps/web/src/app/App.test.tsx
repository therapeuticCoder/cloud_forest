import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  GetCareOffersResponse,
  GetCareOffersResult,
  GetCareRequestsResponse,
  GetCareRequestsResult,
} from "@cloud-forest/api-client";
import { App } from "./App";
import type {
  CareOfferApiClient,
  CareRequestApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { curatorPartyPeople } from "@/data/curatorMockData";

type TestCareRequest = GetCareRequestsResponse["data"]["requests"][number];
type TestCareOffer = GetCareOffersResponse["data"]["offers"][number];

function careRequest(
  overrides: Partial<TestCareRequest> = {},
): TestCareRequest {
  return {
    id: "care-request-anya-meal-001",
    kind: "meal",
    direction: "receive",
    need: "A meal",
    helpfulWhen: "Thursday evening",
    foodWorks: "Soup or rice",
    foodDoesNotWork: "Nothing spicy",
    handoffStyle: "Leave it at my door",
    audience: "Party",
    status: "open",
    createdAt: "2026-09-14T12:00:00.000Z",
    requester: { personId: "anya", displayName: "Anya Reed" },
    ...overrides,
  };
}

function careSuccess(requests: TestCareRequest[]): GetCareRequestsResult {
  return {
    ok: true,
    status: 200,
    value: { apiVersion: "v1", data: { requests } },
  };
}

function careOffersSuccess(offers: TestCareOffer[]): GetCareOffersResult {
  return {
    ok: true,
    status: 200,
    value: { apiVersion: "v1", data: { offers } },
  };
}

function createCareOfferApiClient(
  initialOffers: TestCareOffer[] = [],
): CareOfferApiClient {
  let offers = [...initialOffers];

  return {
    getCareOffers: vi.fn(async () => careOffersSuccess(offers)),
    createCareOffer: vi.fn(async (input) => {
      const offer: TestCareOffer = {
        id: `care-offer-test-${offers.length + 1}`,
        kind: "meal",
        direction: "give",
        offer: "A meal",
        mealDescription: input.mealDescription,
        availableWhen: input.availableWhen,
        handoffStyle: input.handoffStyle,
        audience: "Party",
        status: "available",
        createdAt: "2026-09-14T13:00:00.000Z",
        giver: { personId: "you", displayName: "River Tester" },
      };
      offers = [offer, ...offers];
      return careOffersSuccess(offers);
    }),
    withdrawCareOffer: vi.fn(async ({ careOfferId }) => {
      offers = offers.filter((offer) => offer.id !== careOfferId);
      return careOffersSuccess(offers);
    }),
    claimCareOffer: vi.fn(async ({ careOfferId }) => {
      offers = offers.filter((offer) => offer.id !== careOfferId);
      return careOffersSuccess(offers);
    }),
    passCareOffer: vi.fn(async ({ careOfferId }) => {
      offers = offers.filter((offer) => offer.id !== careOfferId);
      return careOffersSuccess(offers);
    }),
  };
}

function createCareApiClient(
  initialRequests: TestCareRequest[] = [careRequest()],
): CareRequestApiClient {
  let requests = [...initialRequests];
  const notFound = () => ({
    ok: false as const,
    kind: "http" as const,
    status: 404 as const,
    error: {
      apiVersion: "v1" as const,
      error: {
        code: "NOT_FOUND" as const,
        message: "The requested Care request was not found.",
      },
    },
  });

  return {
    getCareRequests: vi.fn(async () => careSuccess(requests)),
    createCareRequest: vi.fn(async (input) => {
      requests = [
        careRequest({
          id: `care-request-test-${requests.length + 1}`,
          helpfulWhen: input.helpfulWhen,
          foodWorks: input.foodWorks,
          foodDoesNotWork: input.foodDoesNotWork,
          handoffStyle: input.handoffStyle,
          requester: { personId: "you", displayName: "River Tester" },
          createdAt: "2026-09-14T13:00:00.000Z",
        }),
        ...requests,
      ];
      return careSuccess(requests);
    }),
    claimCareRequest: vi.fn(async ({ careRequestId }) => {
      const request = requests.find(
        (candidate) => candidate.id === careRequestId,
      );
      if (!request) return notFound();
      if (request.status === "claimed") {
        return {
          ok: false as const,
          kind: "http" as const,
          status: 409 as const,
          error: {
            apiVersion: "v1" as const,
            error: {
              code: "ALREADY_CLAIMED" as const,
              message: "This Care request is no longer available.",
            },
          },
        };
      }
      requests = requests.map((candidate) =>
        candidate.id === careRequestId
          ? {
              ...candidate,
              status: "claimed" as const,
              claimedAt: "2026-09-14T13:05:00.000Z",
              claimant: { personId: "you", displayName: "River Tester" },
            }
          : candidate,
      );
      return careSuccess(requests);
    }),
    passCareRequest: vi.fn(async ({ careRequestId }) => {
      requests = requests.filter((request) => request.id !== careRequestId);
      return careSuccess(requests);
    }),
    completeCareRequest: vi.fn(async ({ careRequestId }) => {
      const request = requests.find(
        (candidate) => candidate.id === careRequestId,
      );
      if (!request || request.status !== "claimed") return notFound();
      const completedAt = new Date().toISOString();
      requests = requests.map((candidate) => {
        if (candidate.id !== careRequestId) return candidate;
        const claimantCompletedAt =
          candidate.claimant?.personId === "you"
            ? completedAt
            : candidate.claimantCompletedAt;
        const requesterCompletedAt =
          candidate.requester.personId === "you"
            ? completedAt
            : candidate.requesterCompletedAt;
        return {
          ...candidate,
          ...(requesterCompletedAt
            ? { requesterCompletedAt }
            : { requesterCompletedAt: undefined }),
          ...(claimantCompletedAt
            ? { claimantCompletedAt }
            : { claimantCompletedAt: undefined }),
          ...(requesterCompletedAt && claimantCompletedAt
            ? { status: "completed" as const, completedAt }
            : {}),
        };
      });
      return careSuccess(requests);
    }),
    recordCareGratitude: vi.fn(async ({ careRequestId }, input) => {
      const request = requests.find(
        (candidate) => candidate.id === careRequestId,
      );
      if (!request) return notFound();
      requests = requests.map((candidate) =>
        candidate.id === careRequestId
          ? {
              ...candidate,
              gratitude: {
                statementId: input.statementId,
                message: input.message,
                createdAt: "2026-09-14T13:10:00.000Z",
              },
            }
          : candidate,
      );
      return careSuccess(requests);
    }),
  };
}

function curatedPeopleResponse(
  people: Array<{
    id: string;
    firstName: string;
    lastName: string;
    nickname: string;
    relationshipShape: string;
    privateDescription: string;
    placement: "party";
    linkedUserId: string | null;
    linkedPersonId: string | null;
    relationshipState: "character" | "connected" | "blocked";
    version: number;
    createdAt: string;
    updatedAt: string;
  }>,
  changedPersonId: string | null = null,
) {
  return {
    apiVersion: "v1",
    data: { people, changedPersonId },
  };
}

function createCuratedPeopleFixture() {
  let people: Parameters<typeof curatedPeopleResponse>[0] = curatorPartyPeople
    .slice(0, 4)
    .map((person, index) => ({
      id: person.id,
      firstName: "",
      lastName: "",
      nickname: person.displayName,
      relationshipShape: person.relationshipNote,
      privateDescription: person.relationshipTitle,
      placement: "party" as const,
      linkedUserId: `connected-user-${index + 1}`,
      linkedPersonId: person.id,
      relationshipState: "connected" as const,
      version: 1,
      createdAt: `2026-09-07T12:0${index}:00.000Z`,
      updatedAt: `2026-09-07T12:0${index}:00.000Z`,
    }));

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!String(input).includes("/api/v1/curated-persons")) {
      return new Promise<Response>(() => undefined);
    }

    if ((init?.method ?? "GET") === "POST") {
      const draft = JSON.parse(String(init?.body));
      const created = {
        id: `curated-person-test-${people.length + 1}`,
        firstName: draft.firstName,
        lastName: draft.lastName,
        nickname: draft.nickname,
        relationshipShape: draft.relationshipShape,
        privateDescription: draft.privateDescription,
        placement: draft.placement,
        linkedUserId: null,
        linkedPersonId: null,
        relationshipState: "character" as const,
        version: 1,
        createdAt: "2026-09-07T13:00:00.000Z",
        updatedAt: "2026-09-07T13:00:00.000Z",
      };
      people = [...people, created];
      return {
        status: 200,
        async text() {
          return JSON.stringify(curatedPeopleResponse(people, created.id));
        },
      } as Response;
    }

    return {
      status: 200,
      async text() {
        return JSON.stringify(curatedPeopleResponse(people));
      },
    } as Response;
  };
}

const authenticatedSessionClient = {
  getCurrentSession: async () => ({
    ok: true as const,
    status: 200 as const,
    value: {
      apiVersion: "v1" as const,
      data: { currentPersonId: "you", displayName: "River Tester" },
    },
  }),
  signIn: async () => ({ ok: true as const }),
  logout: async () => ({
    ok: true as const,
    status: 204 as const,
    value: null,
  }),
};

let testCareApiClient: CareRequestApiClient;
let testCareOfferApiClient: CareOfferApiClient;

async function openCurator(careApiClient = testCareApiClient) {
  const user = userEvent.setup();

  await renderAuthenticatedApp(careApiClient);
  await user.click(screen.getAllByRole("button", { name: /curator/i })[0]);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Open Mira Vale" }),
    ).toBeVisible(),
  );

  return user;
}

async function renderAuthenticatedApp(careApiClient = testCareApiClient) {
  const result = render(
    <App
      careApiClient={careApiClient}
      careOfferApiClient={testCareOfferApiClient}
      sessionClient={authenticatedSessionClient}
    />,
  );
  await screen.findByRole("region", { name: /timeline view/i });
  return result;
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
    testCareApiClient = createCareApiClient();
    testCareOfferApiClient = createCareOfferApiClient();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      createCuratedPeopleFixture(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders Timeline as a standalone default view", async () => {
    await renderAuthenticatedApp();

    expect(
      screen.getByRole("button", { name: "Current view: Timeline" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "Go to Curator" }),
    ).toBeInTheDocument();
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
  });

  it("renders durable layers and Coming soon placeholders", async () => {
    await openCurator();

    const holdingLayer = screen.getByRole("article", {
      name: /holding layer/i,
    });
    const partyLayer = screen.getByRole("article", { name: /party layer/i });
    const tribeLayer = screen.getByRole("article", { name: /tribe layer/i });
    const guildLayer = screen.getByRole("article", { name: /guilds layer/i });
    const signalLayer = screen.getByRole("article", { name: /signals layer/i });

    expect(
      within(holdingLayer).queryByRole("button", {
        name: /add a character/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(holdingLayer).getByText(/a quiet place to begin/i),
    ).toBeInTheDocument();
    expect(partyLayer.querySelectorAll("[data-curator-tile]")).toHaveLength(5);
    expect(
      screen.getAllByRole("button", { name: /open my care/i }),
    ).not.toHaveLength(0);
    expect(
      within(tribeLayer).getByText(/your tribe is waiting/i),
    ).toBeInTheDocument();
    expect(within(guildLayer).getByText("Coming soon")).toBeInTheDocument();
    expect(
      within(guildLayer).getByText(
        /shared work, interests, and mutual support/i,
      ),
    ).toBeInTheDocument();
    expect(within(signalLayer).getByText("Coming soon")).toBeInTheDocument();
    expect(
      within(signalLayer).getByText(/broader cultural and civic context/i),
    ).toBeInTheDocument();
    expect(guildLayer.querySelectorAll("[data-curator-tile]")).toHaveLength(0);
    expect(signalLayer.querySelectorAll("[data-curator-tile]")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
    expect(screen.getByLabelText("Party count")).toHaveTextContent("4/5");
    expect(
      within(partyLayer).queryByRole("heading", { name: "Party" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /studio night/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /climate lab/i }),
    ).not.toBeInTheDocument();
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

  it("restores Curator detail after switching to Timeline and going back", async () => {
    const user = await openCurator();

    await user.click(screen.getByRole("button", { name: /open mira vale/i }));
    await user.click(screen.getByRole("button", { name: "Go to Timeline" }));

    expect(
      screen.getByRole("region", { name: /timeline view/i }),
    ).toBeInTheDocument();

    window.history.back();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: /mira vale details/i }),
      ).toBeInTheDocument(),
    );
  });

  it("shows shared Care in the connected Character detail", async () => {
    const user = await openCurator();
    const anyaTile = screen.getByRole("button", { name: /open anya reed/i });

    await user.click(anyaTile);

    expect(
      screen.getByRole("heading", { name: "Care with Anya Reed" }),
    ).toBeInTheDocument();
    const careCard = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    expect(careCard).toHaveTextContent("Anya is asking for a meal");
    expect(
      within(careCard).queryByRole("button", { name: "I’ve seen this" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to Curator" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /open anya reed/i }),
      ).toHaveFocus(),
    );
  });

  it("records completion from connected Character detail", async () => {
    const careApiClient = createCareApiClient([
      careRequest({
        status: "claimed",
        claimedAt: "2026-09-14T13:05:00.000Z",
        claimant: { personId: "you", displayName: "River Tester" },
      }),
    ]);
    const user = await openCurator(careApiClient);
    await user.click(screen.getByRole("button", { name: /open anya reed/i }));

    const careCard = screen.getByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });
    await user.click(
      within(careCard).getByRole("button", { name: "Mark done" }),
    );

    await waitFor(() =>
      expect(careApiClient.completeCareRequest).toHaveBeenCalledWith({
        careRequestId: "care-request-anya-meal-001",
      }),
    );
    expect(
      await within(careCard).findByText(
        "You marked this completed. Waiting for the other person.",
      ),
    ).toBeInTheDocument();
  });

  it("shows durable requests in My Care without browser history", async () => {
    const careApiClient = createCareApiClient([
      careRequest({
        requester: { personId: "you", displayName: "River Tester" },
      }),
    ]);
    const user = userEvent.setup();
    await renderAuthenticatedApp(careApiClient);

    await user.click(screen.getByRole("button", { name: "Open My Care" }));

    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /receive/i }));
    expect(
      screen.getByRole("heading", { name: "My open requests" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Requests I'm taking care of" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /give/i }));
    expect(
      screen.getByRole("heading", { name: "Requests I'm taking care of" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /receive/i }));
    expect(
      screen.queryByRole("heading", { name: "Private history" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Open meal care request" }),
    ).toHaveTextContent("Your meal request");
  });

  it("adds a Party member through the mobile wizard", async () => {
    const user = await openCurator();

    await user.click(
      within(screen.getByRole("article", { name: /party layer/i })).getByRole(
        "button",
        { name: /add$/i },
      ),
    );
    await user.type(screen.getByPlaceholderText("First name"), "Nia");
    await user.type(screen.getByPlaceholderText("Last name"), "Patel");
    await user.type(screen.getByPlaceholderText("Nickname"), "Nia");
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
    expect(
      within(screen.getByRole("article", { name: /party layer/i })).getByRole(
        "button",
        { name: /^add$/i },
      ),
    ).toBeDisabled();
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

  it("asks the Party for a meal and receives the durable open request", async () => {
    const user = userEvent.setup();
    await renderAuthenticatedApp(createCareApiClient([]));

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
    await user.click(screen.getByRole("button", { name: "1 day" }));
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
  });

  it("does not use browser-local presentation state for durable requests", async () => {
    const firstRender = await renderAuthenticatedApp();
    const incomingRequest = await screen.findByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });

    expect(
      within(incomingRequest).queryByRole("button", { name: "I’ve seen this" }),
    ).not.toBeInTheDocument();

    firstRender.unmount();
    await renderAuthenticatedApp();
    expect(
      await screen.findByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toHaveTextContent("Nothing spicy");
  });

  it("passes a durable request and keeps it hidden after remount", async () => {
    const careApiClient = createCareApiClient();
    const user = userEvent.setup();
    const firstRender = await renderAuthenticatedApp(careApiClient);
    const incomingRequest = await screen.findByRole("article", {
      name: "Incoming meal care request from Anya Reed",
    });

    await user.click(
      within(incomingRequest).getByRole("button", {
        name: "Pass this time",
      }),
    );
    await waitFor(() =>
      expect(careApiClient.passCareRequest).toHaveBeenCalledWith({
        careRequestId: "care-request-anya-meal-001",
      }),
    );
    expect(
      screen.queryByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).not.toBeInTheDocument();

    firstRender.unmount();
    await renderAuthenticatedApp(careApiClient);
    expect(
      screen.queryByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).not.toBeInTheDocument();
  });

  it("does not expire durable requests in the browser", async () => {
    vi.setSystemTime(new Date("2031-09-04T12:00:00.000Z"));

    await renderAuthenticatedApp();

    expect(
      await screen.findByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toBeInTheDocument();
  });

  it("opens Receive from Curator and returns to Timeline after asking", async () => {
    const user = await openCurator();

    await user.click(
      within(screen.getByRole("article", { name: /party layer/i })).getByRole(
        "button",
        { name: "Receive" },
      ),
    );
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
    await renderAuthenticatedApp();

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
    await user.click(screen.getByRole("button", { name: "1 day" }));
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
    expect(offer).toHaveTextContent("Offered to: Party");

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

    await user.click(
      within(screen.getByRole("article", { name: /party layer/i })).getByRole(
        "button",
        { name: "Give" },
      ),
    );
    expect(
      screen.getByRole("region", { name: /offer a meal to my party/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meal" })).toBeEnabled();
    await user.click(
      screen.getByRole("button", { name: /cancel offering care/i }),
    );
    expect(screen.getByRole("heading", { name: "Party" })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(screen.getByRole("article", { name: /party layer/i })).getByRole(
          "button",
          { name: "Give" },
        ),
      ).toHaveFocus(),
    );
  });

  it("claims an incoming request, keeps it after reload, and shows it in My Care", async () => {
    const user = userEvent.setup();
    const firstRender = await renderAuthenticatedApp();
    const incomingRequest = await screen.findByRole("article", {
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
    await user.click(screen.getByRole("tab", { name: /give/i }));
    expect(
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toHaveTextContent("You’re helping Anya.");

    firstRender.unmount();
    await renderAuthenticatedApp();

    expect(await screen.findByText("You’re helping Anya.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    await user.click(screen.getByRole("tab", { name: /give/i }));
    expect(
      screen.getByRole("article", {
        name: "Incoming meal care request from Anya Reed",
      }),
    ).toBeInTheDocument();
  });

  it.skip("collects a private reason before closing not-completed care", async () => {
    const user = userEvent.setup();
    await renderAuthenticatedApp();
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

  it.skip("closes the original care and creates a linked request when trying again", async () => {
    const user = userEvent.setup();
    await renderAuthenticatedApp();
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

  it.skip("reviews open, passed, demoted, and claimed care without changing state on switch", async () => {
    const user = userEvent.setup();
    await renderAuthenticatedApp();
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
