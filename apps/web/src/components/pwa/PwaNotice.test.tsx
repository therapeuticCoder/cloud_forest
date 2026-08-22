import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { setPwaNoticeForTest } from "@/pwa/pwaLifecycle";

import { PwaNotice } from "./PwaNotice";

describe("PwaNotice", () => {
  afterEach(() => setPwaNoticeForTest(null));

  it("announces that the static shell is available offline", async () => {
    const user = userEvent.setup();
    setPwaNoticeForTest("offline-ready");
    render(<PwaNotice />);

    expect(screen.getByText(/ready for offline use/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(
      screen.queryByText(/ready for offline use/i),
    ).not.toBeInTheDocument();
  });

  it("offers an explicit choice when an update is waiting", async () => {
    const user = userEvent.setup();
    setPwaNoticeForTest("update-ready");
    render(<PwaNotice />);

    expect(
      screen.getByRole("button", { name: /update now/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /later/i }));
    expect(
      screen.queryByText(/new human forest version/i),
    ).not.toBeInTheDocument();
  });
});
