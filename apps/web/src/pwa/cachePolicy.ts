export const shellCachePrefix = "cloud-forest-shell-";

const legacyShellCachePrefixes = ["human-forest-shell-"];

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
