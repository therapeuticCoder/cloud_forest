import { describe, expect, it } from "vitest";

import { shellCachePrefix, shouldDeleteShellCache } from "./cachePolicy";

describe("service-worker shell cache cleanup", () => {
  const currentCacheName = `${shellCachePrefix}current`;

  it("retains the current Cloud Forest shell cache", () => {
    expect(shouldDeleteShellCache(currentCacheName, currentCacheName)).toBe(
      false,
    );
  });

  it("deletes obsolete Cloud Forest and legacy Human Forest shell caches", () => {
    expect(
      shouldDeleteShellCache("cloud-forest-shell-old", currentCacheName),
    ).toBe(true);
    expect(
      shouldDeleteShellCache("human-forest-shell-old", currentCacheName),
    ).toBe(true);
  });

  it("does not delete unrelated origin caches", () => {
    expect(shouldDeleteShellCache("another-app-shell", currentCacheName)).toBe(
      false,
    );
  });
});
