import { describe, expect, it, vi } from "vitest";

import { resolveNetworkFirst } from "./navigationPolicy";

describe("service-worker navigation policy", () => {
  it("uses a successful network response without reading the cache", async () => {
    const fallback = vi.fn(async () => "cached shell");

    await expect(
      resolveNetworkFirst({
        fallback,
        network: async () => "network shell",
        timeoutMs: 10,
      }),
    ).resolves.toBe("network shell");
    expect(fallback).not.toHaveBeenCalled();
  });

  it("uses the cached shell when navigation fails", async () => {
    await expect(
      resolveNetworkFirst({
        fallback: async () => "cached shell",
        network: async () => {
          throw new Error("offline");
        },
        timeoutMs: 10,
      }),
    ).resolves.toBe("cached shell");
  });

  it("uses the cached shell when navigation does not settle promptly", async () => {
    vi.useFakeTimers();

    try {
      const response = resolveNetworkFirst({
        fallback: async () => "cached shell",
        network: () => new Promise<string>(() => undefined),
        timeoutMs: 10,
      });

      await vi.advanceTimersByTimeAsync(10);
      await expect(response).resolves.toBe("cached shell");
    } finally {
      vi.useRealTimers();
    }
  });
});
