type RelationshipActionError = { error: { message: string } };

type RelationshipActionResult = { ok: true } | { ok: false; message: string };

async function request(
  method: string,
  path: string,
  body?: unknown,
): Promise<RelationshipActionResult> {
  try {
    const response = await fetch(path, {
      method,
      credentials: "include",
      headers:
        body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const value = (await response.json()) as RelationshipActionError;
    if (response.ok) return { ok: true };
    return {
      ok: false,
      message:
        "error" in value
          ? value.error.message
          : "Cloud Forest could not complete that relationship action.",
    };
  } catch {
    return {
      ok: false,
      message: "Cloud Forest could not reach your relationship data.",
    };
  }
}

export function endConnection(
  curatedPersonId: string,
  deleteCharacter: boolean,
) {
  return request(
    "POST",
    `/api/v1/curated-persons/${encodeURIComponent(curatedPersonId)}/end-connection`,
    { deleteCharacter },
  );
}

export function blockCuratedPerson(curatedPersonId: string) {
  return request(
    "POST",
    `/api/v1/curated-persons/${encodeURIComponent(curatedPersonId)}/block`,
  );
}

export function unblockCuratedPerson(
  curatedPersonId: string,
  blockedUserId: string,
) {
  return request(
    "POST",
    `/api/v1/curated-persons/${encodeURIComponent(curatedPersonId)}/unblock`,
    { blockedUserId },
  );
}
