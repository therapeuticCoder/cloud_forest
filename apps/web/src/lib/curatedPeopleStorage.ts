import type { GetCuratedPersonsResponse } from "@cloud-forest/api-client";

type CuratedPersonRecord = GetCuratedPersonsResponse["data"]["people"][number];

export const CURATED_PEOPLE_STORAGE_KEY = "cloud-forest:curated-people:v1";

type StoredCuratedPeopleV1 = {
  ownerId: string;
  people: CuratedPersonRecord[];
  version: 1;
};

function storageKey(ownerId: string) {
  return `${CURATED_PEOPLE_STORAGE_KEY}:${encodeURIComponent(ownerId)}`;
}

function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isTimestamp(value: unknown) {
  return isString(value) && Number.isFinite(Date.parse(value));
}

function withoutPortrait(person: CuratedPersonRecord): CuratedPersonRecord {
  const cachedPerson = { ...person };
  delete cachedPerson.portraitUrl;
  return cachedPerson;
}

function isCuratedPersonRecord(value: unknown): value is CuratedPersonRecord {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    value.id.length > 0 &&
    isString(value.nickname) &&
    value.nickname.length > 0 &&
    isString(value.relationshipShape) &&
    value.relationshipShape.length > 0 &&
    isString(value.privateDescription) &&
    (value.portraitUrl === undefined || isString(value.portraitUrl)) &&
    (value.placement === "holding" ||
      value.placement === "party" ||
      value.placement === "tribe" ||
      value.placement === "guild" ||
      value.placement === "signal") &&
    (value.linkedUserId === null ||
      (isString(value.linkedUserId) && value.linkedUserId.length > 0)) &&
    (value.relationshipState === "character" ||
      value.relationshipState === "connected" ||
      value.relationshipState === "blocked") &&
    typeof value.version === "number" &&
    Number.isInteger(value.version) &&
    value.version >= 1 &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

function isStoredCuratedPeopleV1(
  value: unknown,
  ownerId: string,
): value is StoredCuratedPeopleV1 {
  if (!isRecord(value)) return false;

  return (
    value.version === 1 &&
    value.ownerId === ownerId &&
    Array.isArray(value.people) &&
    value.people.every(isCuratedPersonRecord)
  );
}

export function loadCuratedPeopleSnapshot(
  ownerId: string,
): CuratedPersonRecord[] | undefined {
  try {
    const storedValue = getBrowserStorage()?.getItem(storageKey(ownerId));
    if (!storedValue) return undefined;

    const parsed: unknown = JSON.parse(storedValue);
    return isStoredCuratedPeopleV1(parsed, ownerId)
      ? parsed.people.map(withoutPortrait)
      : undefined;
  } catch {
    return undefined;
  }
}

export function saveCuratedPeopleSnapshot(
  ownerId: string,
  people: readonly CuratedPersonRecord[],
) {
  try {
    const stored: StoredCuratedPeopleV1 = {
      version: 1,
      ownerId,
      people: people.map(withoutPortrait),
    };
    getBrowserStorage()?.setItem(storageKey(ownerId), JSON.stringify(stored));
  } catch {
    // The live response remains usable when browser storage is unavailable.
  }
}

export function clearCuratedPeopleSnapshot(ownerId: string) {
  try {
    getBrowserStorage()?.removeItem(storageKey(ownerId));
  } catch {
    // There is no local fallback to clear when browser storage is unavailable.
  }
}
