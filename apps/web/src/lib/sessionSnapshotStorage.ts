export const SESSION_SNAPSHOT_STORAGE_KEY = "cloud-forest:session:v1";

export type SessionSnapshot = {
  currentPersonId: string;
  displayName: string;
  role: "admin" | "user";
};

function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.currentPersonId === "string" &&
    snapshot.currentPersonId.length > 0 &&
    typeof snapshot.displayName === "string" &&
    (snapshot.role === "admin" || snapshot.role === "user")
  );
}

export function loadSessionSnapshot(): SessionSnapshot | undefined {
  try {
    const storedValue = getBrowserStorage()?.getItem(
      SESSION_SNAPSHOT_STORAGE_KEY,
    );
    if (!storedValue) return undefined;

    const parsed: unknown = JSON.parse(storedValue);
    return isSessionSnapshot(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function saveSessionSnapshot(snapshot: SessionSnapshot) {
  try {
    getBrowserStorage()?.setItem(
      SESSION_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    // The live session remains usable when browser storage is unavailable.
  }
}

export function clearSessionSnapshot() {
  try {
    getBrowserStorage()?.removeItem(SESSION_SNAPSHOT_STORAGE_KEY);
  } catch {
    // There is no local fallback to clear when browser storage is unavailable.
  }
}
