import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiClient, GetCaresResponse } from "@cloud-forest/api-client";
import { App } from "./App";
import type { CareApiClient } from "@/components/cloud-forest/DashboardShell";

type TestCare = GetCaresResponse["data"]["cares"][number];

const originator = { personId: "anya", displayName: "Anya Reed" } as const;
const viewer = { personId: "you", displayName: "River Tester" } as const;

function care(overrides: Partial<TestCare> = {}): TestCare {
  return {
    id: "care-anya-transportation-001",
    direction: "receive",
    category: "transportation",
    subtype: "Give me a ride",
    days: ["monday"],
    times: ["morning"],
    timeNote: "Flexible",
    location: "Downtown",
    requirements: "A ride to an appointment",
    sensitivities: "",
    audience: "Party",
    status: "open",
    createdAt: "2026-09-21T12:00:00.000Z",
    originator,
    ...overrides,
  };
}

function success(cares: TestCare[]) {
  return {
    ok: true as const,
    status: 200 as const,
    value: {
      apiVersion: "v1" as const,
      data: { cares },
    },
  };
}

function createCareClient(initialCares: TestCare[] = [care()]): CareApiClient {
  let cares = [...initialCares];
  const client: CareApiClient = {
    getCares: vi.fn(async () => success(cares)),
    createCare: vi.fn(async (input) => {
      const created = care({
        id: `care-test-${cares.length + 1}`,
        direction: input.direction,
        category: input.category ?? "food",
        subtype: input.subtype ?? "",
        days: input.days ?? [],
        times: input.times ?? [],
        timeNote: input.timeNote ?? "",
        location: input.location ?? "Not specified",
        requirements: input.requirements ?? "",
        sensitivities: input.sensitivities ?? "",
        audience: input.audience ?? "Party",
        originator: viewer,
      });
      cares = [created, ...cares];
      return success(cares);
    }),
    claimCare: vi.fn(async ({ careId }) => {
      cares = cares.map((candidate) =>
        candidate.id === careId
          ? {
              ...candidate,
              status: "claimed" as const,
              claimedAt: "2026-09-21T12:05:00.000Z",
              participant: viewer,
            }
          : candidate,
      );
      return success(cares);
    }),
    passCare: vi.fn(async ({ careId }) => {
      cares = cares.filter((candidate) => candidate.id !== careId);
      return success(cares);
    }),
    completeCare: vi.fn(async ({ careId }) => {
      cares = cares.map((candidate) =>
        candidate.id === careId
          ? {
              ...candidate,
              participantCompletedAt: "2026-09-21T12:10:00.000Z",
            }
          : candidate,
      );
      return success(cares);
    }),
    withdrawCare: vi.fn(async ({ careId }) => {
      cares = cares.filter((candidate) => candidate.id !== careId);
      return success(cares);
    }),
    recordCareGratitude: vi.fn(async () => success(cares)),
  } satisfies Pick<
    ApiClient,
    | "getCares"
    | "createCare"
    | "claimCare"
    | "passCare"
    | "completeCare"
    | "withdrawCare"
    | "recordCareGratitude"
  >;
  return client;
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

async function renderAuthenticatedApp(careApiClient: CareApiClient) {
  render(
    <App
      careApiClient={careApiClient}
      sessionClient={authenticatedSessionClient}
    />,
  );
  await screen.findByRole("region", { name: /timeline view/i });
}

describe("unified Care", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            apiVersion: "v1",
            data: { people: [], changedPersonId: null },
          }),
          { status: 200 },
        ),
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("renders give and receive records through one Care listing", async () => {
    const client = createCareClient([
      care(),
      care({
        id: "care-mira-food-001",
        direction: "give",
        category: "food",
        subtype: "",
        originator: { personId: "mira", displayName: "Mira Vale" },
        requirements: "A warm meal",
      }),
    ]);

    await renderAuthenticatedApp(client);

    expect(await screen.findByText("Transportation Care")).toBeInTheDocument();
    expect(await screen.findByText("Food Care")).toBeInTheDocument();
  });

  it("claims a Care without changing its identity", async () => {
    const client = createCareClient();
    await renderAuthenticatedApp(client);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "I can help" }));
    await screen.findByRole("heading", { name: /help anya reed/i });
    await user.click(
      screen.getByRole("button", { name: "I’ll help with this" }),
    );

    await waitFor(() =>
      expect(client.claimCare).toHaveBeenCalledWith({
        careId: "care-anya-transportation-001",
      }),
    );
    expect(await screen.findByText("Committed")).toBeInTheDocument();
  });

  it("places claimed Care in the tab matching the viewer's role", async () => {
    const client = createCareClient([
      care({
        id: "care-anya-transportation-claimed-001",
        status: "claimed",
        claimedAt: "2026-09-21T12:05:00.000Z",
        participant: viewer,
      }),
      care({
        id: "care-mira-food-claimed-001",
        direction: "give",
        category: "food",
        originator: { personId: "mira", displayName: "Mira Vale" },
        status: "claimed",
        claimedAt: "2026-09-21T12:05:00.000Z",
        participant: viewer,
      }),
    ]);

    await renderAuthenticatedApp(client);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Open My Care" }));
    await user.click(screen.getByRole("tab", { name: "Receive" }));

    expect(
      await screen.findByRole("article", {
        name: "Mira Vale shared food Care",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("article", {
        name: "Anya Reed shared transportation Care",
      }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Give" }));

    expect(
      await screen.findByRole("article", {
        name: "Anya Reed shared transportation Care",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("article", {
        name: "Mira Vale shared food Care",
      }),
    ).not.toBeInTheDocument();
  });
});
