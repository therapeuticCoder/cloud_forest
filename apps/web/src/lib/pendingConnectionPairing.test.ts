import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearPendingConnectionPairing,
  PENDING_CONNECTION_PAIRING_STORAGE_KEY,
  rememberPendingConnectionPairing,
  restorePendingConnectionPairing,
} from "./pendingConnectionPairing";

const pairingToken = "pairing-token-12345678901234567890";
const signupCode = "signup-code-12345678901234567890";

describe("pending connection pairing continuity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("remembers pairing and invitation context from the current URL", () => {
    window.history.replaceState(
      {},
      "",
      `/?pairing=${pairingToken}&signup=${signupCode}`,
    );

    expect(restorePendingConnectionPairing()).toBe(pairingToken);
    expect(
      JSON.parse(
        window.localStorage.getItem(PENDING_CONNECTION_PAIRING_STORAGE_KEY) ??
          "null",
      ),
    ).toEqual({ pairingToken, signupCode });
  });

  it("restores the pairing and invitation context after a PWA launch", () => {
    rememberPendingConnectionPairing(pairingToken, signupCode);
    window.history.replaceState({}, "", "/");

    expect(restorePendingConnectionPairing()).toBe(pairingToken);
    expect(window.location.search).toBe(
      `?pairing=${pairingToken}&signup=${signupCode}`,
    );
  });

  it("clears the stored request when the pairing flow is closed", () => {
    rememberPendingConnectionPairing(pairingToken);

    clearPendingConnectionPairing();

    expect(
      window.localStorage.getItem(PENDING_CONNECTION_PAIRING_STORAGE_KEY),
    ).toBeNull();
  });
});
