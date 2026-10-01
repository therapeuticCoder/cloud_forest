import { afterEach, describe, expect, it, vi } from "vitest";

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

it("offers an update when registration resolves after updatefound, and retries after reconnecting", async () => {
  vi.useFakeTimers();
  vi.stubEnv("PROD", true);
  vi.resetModules();
  const installer = new EventTarget();
  const waiting = { postMessage: vi.fn() };
  const registration = Object.assign(new EventTarget(), {
    installing: installer,
    waiting: null as typeof waiting | null,
    update: vi.fn().mockResolvedValue(undefined),
  });
  const serviceWorker = Object.assign(new EventTarget(), {
    controller: {},
    register: vi.fn().mockResolvedValue(registration),
    ready: Promise.resolve(registration),
  });
  vi.stubGlobal("navigator", {
    serviceWorker,
    onLine: true,
    userAgent: "Test",
  });
  try {
    const lifecycle = await import("./pwaLifecycle");
    await lifecycle.initializePwa();
    expect(lifecycle.getPwaNotice()).toBeNull();
    registration.waiting = waiting;
    installer.dispatchEvent(new Event("statechange"));
    expect(lifecycle.getPwaNotice()).toBe("update-ready");
    lifecycle.activatePwaUpdate();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    registration.update.mockRejectedValueOnce(new Error("Host unreachable"));
    window.dispatchEvent(new Event("online"));
    await Promise.resolve();
    await Promise.resolve();
    expect(registration.update).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  }
});
