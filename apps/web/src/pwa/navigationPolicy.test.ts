import { describe, expect, it, vi } from "vitest";
import { resolveShellNavigation } from "./navigationPolicy";

describe("service-worker shell navigation", () => {
  it("opens a saved shell without contacting an unreachable host", async () => {
    const network = vi.fn(() => new Promise<string>(() => undefined));
    await expect(
      resolveShellNavigation({
        readCache: async () => "cached shell",
        network,
      }),
    ).resolves.toBe("cached shell");
    expect(network).not.toHaveBeenCalled();
  });

  it("uses the network on a first visit without a saved shell", async () => {
    await expect(
      resolveShellNavigation({
        readCache: async () => undefined,
        network: async () => "network shell",
      }),
    ).resolves.toBe("network shell");
  });

  it("does not invent a shell when neither storage nor the network has one", async () => {
    await expect(
      resolveShellNavigation({
        readCache: async () => undefined,
        network: async () => {
          throw new Error("offline");
        },
      }),
    ).rejects.toThrow("offline");
  });
});
