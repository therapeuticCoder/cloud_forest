import type { GetTimelineItemResponse } from "@cloud-forest/api-client";

type TimelineItemRecord = GetTimelineItemResponse["data"]["timelineItem"];

export const TIMELINE_ITEM_STORAGE_KEY = "cloud-forest:timeline-item:v1";

type StoredTimelineItemV1 = {
  item: TimelineItemRecord;
  ownerId: string;
  version: 1;
};

function storageKey(ownerId: string) {
  return `${TIMELINE_ITEM_STORAGE_KEY}:${encodeURIComponent(ownerId)}`;
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

function isTimelineItemRecord(value: unknown): value is TimelineItemRecord {
  if (!isRecord(value) || !isRecord(value.actor)) return false;

  return (
    isString(value.id) &&
    value.id.length > 0 &&
    isString(value.content) &&
    value.content.length > 0 &&
    isString(value.publishedAt) &&
    Number.isFinite(Date.parse(value.publishedAt)) &&
    isString(value.actor.id) &&
    value.actor.id.length > 0 &&
    isString(value.actor.displayName) &&
    value.actor.displayName.length > 0 &&
    (value.actor.layer === "party" ||
      value.actor.layer === "tribe" ||
      value.actor.layer === "guild" ||
      value.actor.layer === "signal") &&
    (value.actor.initials === undefined || isString(value.actor.initials)) &&
    (value.actor.avatarUrl === undefined || isString(value.actor.avatarUrl))
  );
}

function isStoredTimelineItemV1(
  value: unknown,
  ownerId: string,
): value is StoredTimelineItemV1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    value.ownerId === ownerId &&
    isTimelineItemRecord(value.item)
  );
}

export function loadTimelineItemSnapshot(
  ownerId: string,
): TimelineItemRecord | undefined {
  if (!ownerId) return undefined;

  try {
    const storedValue = getBrowserStorage()?.getItem(storageKey(ownerId));
    if (!storedValue) return undefined;

    const parsed: unknown = JSON.parse(storedValue);
    return isStoredTimelineItemV1(parsed, ownerId) ? parsed.item : undefined;
  } catch {
    return undefined;
  }
}

export function saveTimelineItemSnapshot(
  ownerId: string,
  item: TimelineItemRecord,
) {
  if (!ownerId) return;

  try {
    const stored: StoredTimelineItemV1 = {
      item,
      ownerId,
      version: 1,
    };
    getBrowserStorage()?.setItem(storageKey(ownerId), JSON.stringify(stored));
  } catch {
    // The live response remains usable when browser storage is unavailable.
  }
}

export function clearTimelineItemSnapshot(ownerId: string) {
  if (!ownerId) return;

  try {
    getBrowserStorage()?.removeItem(storageKey(ownerId));
  } catch {
    // There is no local fallback to clear when browser storage is unavailable.
  }
}
