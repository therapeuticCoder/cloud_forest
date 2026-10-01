import {
  isCaresSuccessResponse,
  isCuratedPersonsSuccessResponse,
  isGetTimelineItemsSuccessResponse,
  type GetCaresResponse,
  type GetCuratedPersonsResponse,
  type GetTimelineItemResponse,
} from "@cloud-forest/api-client";
import {
  clearCuratedPeopleSnapshot,
  loadCuratedPeopleSnapshot,
} from "./curatedPeopleStorage";
import {
  clearTimelineItemSnapshot,
  loadTimelineItemsSnapshot,
} from "./timelineItemStorage";

type ReadCollections = {
  curator: GetCuratedPersonsResponse["data"]["people"];
  timeline: GetTimelineItemResponse["data"]["timelineItem"][];
  care: GetCaresResponse["data"]["cares"];
};
type Collection = keyof ReadCollections;
const collections: Collection[] = ["curator", "timeline", "care"];
const databaseName = "cloud-forest-device";
const storeName = "reads";
const blockedOwners = new Set<string>();
const ownerGenerations = new Map<string, number>();
const ownerPurges = new Map<string, Promise<void>>();
let opening: Promise<IDBDatabase | undefined> | undefined;

export function openDeviceDatabase() {
  opening ??= new Promise<IDBDatabase | undefined>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(undefined);
      return;
    }
    try {
      const request = indexedDB.open(databaseName, 2);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(storeName))
          request.result.createObjectStore(storeName);
        if (!request.result.objectStoreNames.contains("curator-outbox"))
          request.result.createObjectStore("curator-outbox");
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
          database.close();
          opening = undefined;
        };
        resolve(database);
      };
      request.onerror = () => resolve(undefined);
      request.onblocked = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
  return opening;
}

export function deviceOwnerGeneration(ownerId: string) {
  return blockedOwners.has(ownerId)
    ? null
    : (ownerGenerations.get(ownerId) ?? 0);
}

function key(ownerId: string, collection: Collection) {
  return `${encodeURIComponent(ownerId)}:${collection}`;
}

function validCollection<K extends Collection>(
  collection: K,
  value: unknown,
): value is ReadCollections[K] {
  if (collection === "curator") {
    return isCuratedPersonsSuccessResponse({
      apiVersion: "v1",
      data: { people: value, changedPersonId: null },
    });
  }
  if (collection === "timeline") {
    return isGetTimelineItemsSuccessResponse({
      apiVersion: "v1",
      data: { timelineItems: value },
    });
  }
  return isCaresSuccessResponse({ apiVersion: "v1", data: { cares: value } });
}

export async function saveDeviceRead<K extends Collection>(
  ownerId: string,
  collection: K,
  value: ReadCollections[K],
): Promise<boolean> {
  if (!ownerId || blockedOwners.has(ownerId)) return false;
  const generation = ownerGenerations.get(ownerId);
  const database = await openDeviceDatabase();
  if (
    !database ||
    blockedOwners.has(ownerId) ||
    generation !== ownerGenerations.get(ownerId)
  )
    return false;
  return new Promise((resolve) => {
    try {
      const transaction = database.transaction(storeName, "readwrite");
      transaction
        .objectStore(storeName)
        .put(
          { version: 1, ownerId, collection, value },
          key(ownerId, collection),
        );
      transaction.oncomplete = () => resolve(true);
      transaction.onabort = () => resolve(false);
      transaction.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function loadDeviceRead<K extends Collection>(
  ownerId: string,
  collection: K,
): Promise<ReadCollections[K] | undefined> {
  if (!ownerId || blockedOwners.has(ownerId)) return undefined;
  const generation = ownerGenerations.get(ownerId);
  const database = await openDeviceDatabase();
  const stored = database
    ? await new Promise<unknown>((resolve) => {
        try {
          const request = database
            .transaction(storeName)
            .objectStore(storeName)
            .get(key(ownerId, collection));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      })
    : undefined;
  if (
    blockedOwners.has(ownerId) ||
    generation !== ownerGenerations.get(ownerId)
  )
    return undefined;
  if (stored && typeof stored === "object") {
    const snapshot = stored as Record<string, unknown>;
    if (
      snapshot.version === 1 &&
      snapshot.ownerId === ownerId &&
      snapshot.collection === collection &&
      validCollection(collection, snapshot.value)
    )
      return snapshot.value;
  }

  const legacy =
    collection === "curator"
      ? loadCuratedPeopleSnapshot(ownerId)?.map((person) => ({
          ...person,
          firstName: person.firstName ?? "",
          lastName: person.lastName ?? "",
          linkedPersonId: person.linkedPersonId ?? null,
        }))
      : collection === "timeline"
        ? loadTimelineItemsSnapshot(ownerId)
        : undefined;
  if (!validCollection(collection, legacy)) return undefined;
  if (await saveDeviceRead(ownerId, collection, legacy)) {
    if (collection === "curator") clearCuratedPeopleSnapshot(ownerId);
    if (collection === "timeline") clearTimelineItemSnapshot(ownerId);
  }
  return blockedOwners.has(ownerId) ||
    generation !== ownerGenerations.get(ownerId)
    ? undefined
    : legacy;
}

export async function clearDeviceRead(ownerId: string, collection: Collection) {
  if (collection === "curator") clearCuratedPeopleSnapshot(ownerId);
  if (collection === "timeline") clearTimelineItemSnapshot(ownerId);
  const database = await openDeviceDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    try {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).delete(key(ownerId, collection));
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => resolve();
      transaction.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function allowDeviceReads(ownerId: string) {
  const generation = ownerGenerations.get(ownerId);
  await ownerPurges.get(ownerId);
  if (generation === ownerGenerations.get(ownerId))
    blockedOwners.delete(ownerId);
}

export function clearOwnerDeviceReads(ownerId: string) {
  blockedOwners.add(ownerId);
  ownerGenerations.set(ownerId, (ownerGenerations.get(ownerId) ?? 0) + 1);
  const purging = Promise.all(
    collections.map((collection) => clearDeviceRead(ownerId, collection)),
  ).then(() => undefined);
  ownerPurges.set(ownerId, purging);
  return purging;
}

export function reportExpiredDeviceSession(ownerId: string) {
  void clearOwnerDeviceReads(ownerId);
  window.dispatchEvent(
    new CustomEvent("cloud-forest:session-expired", {
      detail: { ownerId },
    }),
  );
}
