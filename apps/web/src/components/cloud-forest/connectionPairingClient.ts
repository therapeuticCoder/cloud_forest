export type ConnectionPairing = {
  state: "pending" | "completed" | "cancelled" | "superseded" | "expired";
  expiresAt: string;
  initiator: { displayName: string };
  receiver?: { displayName: string };
  receiverResolved: boolean;
  viewerRole: "initiator" | "receiver" | "visitor";
  initiatorConfirmed: boolean;
  receiverConfirmed: boolean;
  viewerPlacement?: "party" | "tribe" | "holding";
};

type ConnectionPairingError = { error: { message: string } };
type CreateConnectionPairingResult =
  | { state: "pending"; token: string; signupCode: string; expiresAt: string }
  | { state: "already-connected" };

type ApiResult<T> = { ok: true; value: T } | { ok: false; message: string };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method,
      credentials: "include",
      headers:
        body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const value = (await response.json()) as
      | { data: T }
      | ConnectionPairingError;
    if (response.ok && "data" in value) return { ok: true, value: value.data };
    return {
      ok: false,
      message:
        "error" in value
          ? value.error.message
          : "Cloud Forest could not complete that connection step.",
    };
  } catch {
    return {
      ok: false,
      message: "Cloud Forest could not reach this connection pairing.",
    };
  }
}

export function createConnectionPairing(curatedPersonId: string) {
  return request<CreateConnectionPairingResult>(
    "POST",
    "/api/v1/connection-pairings",
    { curatedPersonId },
  );
}

export function getConnectionPairing(token: string) {
  return request<ConnectionPairing>(
    "GET",
    `/api/v1/connection-pairings/${encodeURIComponent(token)}`,
  );
}

export function resolveConnectionPairing(
  token: string,
  curatedPersonId: string,
) {
  return request<ConnectionPairing>(
    "POST",
    `/api/v1/connection-pairings/${encodeURIComponent(token)}/resolve`,
    { curatedPersonId },
  );
}

export function confirmConnectionPairing(token: string) {
  return request<ConnectionPairing>(
    "POST",
    `/api/v1/connection-pairings/${encodeURIComponent(token)}/confirm`,
  );
}

export function cancelConnectionPairing(token: string) {
  return request<null>(
    "POST",
    `/api/v1/connection-pairings/${encodeURIComponent(token)}/cancel`,
  );
}
