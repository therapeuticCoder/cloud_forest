import { afterEach, describe, expect, it } from "vitest";

import {
  announceWaitingPwaUpdate,
  dismissPwaNotice,
  getPwaNotice,
  setPwaNoticeForTest,
} from "./pwaLifecycle";

describe("PWA update lifecycle", () => {
  afterEach(() => setPwaNoticeForTest(null));

  it("reannounces a waiting update after Later dismissed it", () => {
    setPwaNoticeForTest("update-ready");
    dismissPwaNotice();

    announceWaitingPwaUpdate(true, true);

    expect(getPwaNotice()).toBe("update-ready");
  });

  it("does not announce an update before a worker controls the page", () => {
    announceWaitingPwaUpdate(true, false);

    expect(getPwaNotice()).toBeNull();
  });
});
