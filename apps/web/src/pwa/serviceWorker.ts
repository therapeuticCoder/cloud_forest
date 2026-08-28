/// <reference lib="webworker" />

import { shellCachePrefix, shouldDeleteShellCache } from "./cachePolicy";

export {};

type PrecacheEntry = {
  revision?: string;
  url: string;
};

const worker = globalThis as unknown as ServiceWorkerGlobalScope;
// Workbox replaces this exact marker with the generated static-shell entries.
// @ts-expect-error The injected property exists only in the service-worker build.
const precacheEntries = self.__WB_MANIFEST as PrecacheEntry[];
const precacheUrls = precacheEntries.map(
  (entry) => new URL(entry.url, worker.registration.scope).href,
);
const precacheUrlSet = new Set(precacheUrls);

function hashPrecacheEntries(entries: PrecacheEntry[]) {
  const source = entries
    .map((entry) => `${entry.url}:${entry.revision ?? "unversioned"}`)
    .join("|");
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
}

const cacheName = `${shellCachePrefix}${hashPrecacheEntries(precacheEntries)}`;
const shellUrl = new URL("index.html", worker.registration.scope).href;

worker.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(precacheUrls)),
  );
});

worker.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((existingCacheName) =>
              shouldDeleteShellCache(existingCacheName, cacheName),
            )
            .map((existingCacheName) => caches.delete(existingCacheName)),
        ),
      ),
  );
});

worker.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void worker.skipWaiting();
  }
});

worker.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== worker.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    if (requestUrl.pathname.startsWith("/api/")) {
      return;
    }

    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedShell = await caches.match(shellUrl, { cacheName });
        return cachedShell ?? Response.error();
      }),
    );
    return;
  }

  if (precacheUrlSet.has(requestUrl.href)) {
    event.respondWith(
      caches.match(event.request, { cacheName }).then((cachedResponse) => {
        return cachedResponse ?? fetch(event.request);
      }),
    );
  }
});
