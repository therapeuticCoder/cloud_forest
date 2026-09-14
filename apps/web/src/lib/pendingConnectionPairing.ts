export const PENDING_CONNECTION_PAIRING_STORAGE_KEY =
  "cloud-forest:pending-connection-pairing:v1";

function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isPairingToken(value: string | null): value is string {
  return value !== null && value.length > 0 && value.length <= 128;
}

type StoredPendingPairing = {
  pairingToken: string;
  signupCode?: string;
};

function isStoredPendingPairing(value: unknown): value is StoredPendingPairing {
  if (!value || typeof value !== "object") return false;
  const pairingToken = (value as { pairingToken?: unknown }).pairingToken;
  const signupCode = (value as { signupCode?: unknown }).signupCode;
  return (
    typeof pairingToken === "string" &&
    isPairingToken(pairingToken) &&
    (signupCode === undefined ||
      (typeof signupCode === "string" && signupCode.length <= 256))
  );
}

function readStoredPairingToken() {
  const storage = getBrowserStorage();
  if (!storage) return null;
  try {
    const value = storage.getItem(PENDING_CONNECTION_PAIRING_STORAGE_KEY);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    return isStoredPendingPairing(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredPairing(value: StoredPendingPairing) {
  const storage = getBrowserStorage();
  if (!storage) return;
  try {
    storage.setItem(
      PENDING_CONNECTION_PAIRING_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // The current URL remains the source of truth when browser storage is unavailable.
  }
}

export function restorePendingConnectionPairing() {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const currentToken = url.searchParams.get("pairing");
  if (isPairingToken(currentToken)) {
    const signupCode = url.searchParams.get("signup");
    writeStoredPairing({
      pairingToken: currentToken,
      ...(signupCode ? { signupCode } : {}),
    });
    return currentToken;
  }

  const storedPairing = readStoredPairingToken();
  if (!storedPairing) return null;

  url.searchParams.set("pairing", storedPairing.pairingToken);
  if (storedPairing.signupCode && !url.searchParams.has("signup")) {
    url.searchParams.set("signup", storedPairing.signupCode);
  }
  window.history.replaceState(
    { ...window.history.state, cloudForestPairingRestored: true },
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  return storedPairing.pairingToken;
}

export function rememberPendingConnectionPairing(
  token: string,
  signupCode?: string | null,
) {
  if (!isPairingToken(token)) return;
  const currentSignupCode =
    signupCode === undefined && typeof window !== "undefined"
      ? new URL(window.location.href).searchParams.get("signup")
      : signupCode;
  writeStoredPairing({
    pairingToken: token,
    ...(currentSignupCode ? { signupCode: currentSignupCode } : {}),
  });
}

export function clearPendingConnectionPairing() {
  const storage = getBrowserStorage();
  if (!storage) return;
  try {
    storage.removeItem(PENDING_CONNECTION_PAIRING_STORAGE_KEY);
  } catch {
    // Clearing browser storage is best effort; terminal URL state is still removed by the caller.
  }
}
