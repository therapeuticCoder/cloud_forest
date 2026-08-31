export const shellCachePrefix = "cloud-forest-shell-";

const legacyShellCachePrefixes = ["human-forest-shell-"];

export function createShellCacheMatchOptions(cacheName: string) {
  return {
    cacheName,
    // Vite preview responses vary by Origin, while precache requests and
    // browser subresource requests can carry different Origin headers.
    ignoreVary: true,
  } satisfies MultiCacheQueryOptions;
}

export function shouldDeleteShellCache(
  existingCacheName: string,
  currentCacheName: string,
) {
  if (existingCacheName === currentCacheName) {
    return false;
  }

  return [shellCachePrefix, ...legacyShellCachePrefixes].some((prefix) =>
    existingCacheName.startsWith(prefix),
  );
}
