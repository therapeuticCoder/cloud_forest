import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthBoundary } from "./AuthBoundary";

function unauthorizedSessionClient() {
  return {
    getCurrentSession: vi.fn(async () => ({
      ok: false as const,
      kind: "http" as const,
      status: 401 as const,
      error: {
        apiVersion: "v1" as const,
        error: {
          code: "UNAUTHORIZED" as const,
          message: "A valid invited session is required." as const,
        },
      },
    })),
    signIn: vi.fn(async () => ({
      ok: false as const,
      kind: "http" as const,
      message: "That email and password combination wasn’t recognized.",
    })),
    logout: vi.fn(async () => ({
      ok: true as const,
      status: 204 as const,
      value: null,
    })),
  };
}

describe("AuthBoundary", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        ({
          status: 404,
          async text() {
            return JSON.stringify({
              apiVersion: "v1",
              error: {
                code: "TIMELINE_ITEM_NOT_FOUND",
                message: "Timeline item not found.",
              },
            });
          },
        }) as Response,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the real application behind an invited session", async () => {
    const sessionClient = unauthorizedSessionClient();

    render(<AuthBoundary sessionClient={sessionClient} />);

    expect(
      await screen.findByRole("heading", { name: "Enter Cloud Forest" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Timeline view" }),
    ).not.toBeInTheDocument();
  });

  it("signs in from the entry screen", async () => {
    const user = userEvent.setup();
    let authenticated = false;
    const sessionClient = {
      ...unauthorizedSessionClient(),
      getCurrentSession: vi.fn(async () =>
        authenticated
          ? {
              ok: true as const,
              status: 200 as const,
              value: {
                apiVersion: "v1" as const,
                data: { currentPersonId: "you", displayName: "River Tester" },
              },
            }
          : unauthorizedSessionClient().getCurrentSession(),
      ),
      signIn: vi.fn(async () => {
        authenticated = true;
        return { ok: true as const };
      }),
    };

    render(<AuthBoundary sessionClient={sessionClient} />);
    await user.type(
      await screen.findByLabelText("Email"),
      "river@example.test",
    );
    await user.type(
      screen.getByLabelText("Password"),
      "cloud-forest-local-password",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(sessionClient.signIn).toHaveBeenCalledWith(
        "river@example.test",
        "cloud-forest-local-password",
      ),
    );
    expect(
      (await screen.findAllByRole("button", { name: "Open My Care" }))[0],
    ).toBeVisible();
  });

  it("returns to the entry screen after signing out", async () => {
    const user = userEvent.setup();
    const sessionClient = {
      ...unauthorizedSessionClient(),
      getCurrentSession: vi.fn(async () => ({
        ok: true as const,
        status: 200 as const,
        value: {
          apiVersion: "v1" as const,
          data: { currentPersonId: "you", displayName: "River Tester" },
        },
      })),
    };

    render(<AuthBoundary sessionClient={sessionClient} />);
    await user.click(
      (await screen.findAllByRole("button", { name: "Open My Care" }))[0],
    );
    await user.click(
      screen.getByRole("button", { name: "Sign out of Cloud Forest" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Enter Cloud Forest" }),
      ).toBeVisible(),
    );
    expect(sessionClient.logout).toHaveBeenCalledTimes(1);
  });
});
