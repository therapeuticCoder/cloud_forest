import type { LegacyCareClaim } from "@/types/careRequest";

export const CARE_CLAIMS_STORAGE_KEY = "cloud-forest:care-claims:v1";

type StoredCareClaimsV1 = {
  version: 1;
  claims: LegacyCareClaim[];
};

function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isCareClaim(value: unknown): value is LegacyCareClaim {
  if (!value || typeof value !== "object") return false;

  const claim = value as Record<string, unknown>;
  return (
    typeof claim.listingId === "string" &&
    claim.listingId.length > 0 &&
    claim.state === "claimed" &&
    typeof claim.claimedAt === "string" &&
    Number.isFinite(Date.parse(claim.claimedAt))
  );
}

function isStoredCareClaimsV1(value: unknown): value is StoredCareClaimsV1 {
  if (!value || typeof value !== "object") return false;

  const stored = value as Record<string, unknown>;
  return (
    stored.version === 1 &&
    Array.isArray(stored.claims) &&
    stored.claims.every(isCareClaim)
  );
}

export function loadCareClaims(): LegacyCareClaim[] {
  try {
    const storedValue = getBrowserStorage()?.getItem(CARE_CLAIMS_STORAGE_KEY);
    if (!storedValue) return [];

    const parsed: unknown = JSON.parse(storedValue);
    return isStoredCareClaimsV1(parsed) ? parsed.claims : [];
  } catch {
    return [];
  }
}

export function saveCareClaims(claims: LegacyCareClaim[]) {
  try {
    getBrowserStorage()?.setItem(
      CARE_CLAIMS_STORAGE_KEY,
      JSON.stringify({ version: 1, claims } satisfies StoredCareClaimsV1),
    );
  } catch {
    // Prototype state remains usable for this session when storage is unavailable.
  }
}
