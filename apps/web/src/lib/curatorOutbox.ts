import type {
  CuratedPersonInput,
  GetCuratedPersonsResponse,
  UpdateCuratedPersonInput,
  DeleteCuratedPersonInput,
} from "@cloud-forest/api-client";
import {
  deviceOwnerGeneration,
  openDeviceDatabase,
  loadDeviceRead,
} from "./deviceReadStorage";

export type CuratorRecord = GetCuratedPersonsResponse["data"]["people"][number];
export type CuratorFields = Omit<CuratedPersonInput, "mutationId">;
export type CuratorOperation = {
  id: string;
  personId: string;
  kind: "create" | "update" | "delete";
  fields: Partial<CuratorFields>;
  label: string;
  status: "pending" | "rejected";
  error?: string;
  request?: {
    personId: string;
    body:
      | CuratedPersonInput
      | UpdateCuratedPersonInput
      | DeleteCuratedPersonInput;
  };
};
export type CuratorDeviceState = {
  base: CuratorRecord[];
  operations: CuratorOperation[];
  people: CuratorRecord[];
  aliases: Record<string, string>;
};
const fields = [
  "firstName",
  "lastName",
  "nickname",
  "relationshipShape",
  "privateDescription",
  "portraitUrl",
  "placement",
] as const;

export function privateFields(person: CuratorFields): CuratorFields {
  return Object.fromEntries(
    fields.map((key) => [
      key,
      key === "portraitUrl" ? (person[key] ?? "") : person[key],
    ]),
  ) as CuratorFields;
}

export function projectCurator(
  base: CuratorRecord[],
  operations: CuratorOperation[],
): CuratorRecord[] {
  let people = base.map((person) => ({ ...person }));
  for (const operation of operations) {
    const person = people.find(
      (candidate) => candidate.id === operation.personId,
    );
    if (operation.kind === "create" && !person) {
      const now = new Date().toISOString();
      people.push({
        ...(operation.fields as CuratorFields),
        id: operation.personId,
        linkedUserId: null,
        linkedPersonId: null,
        relationshipState: "character",
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
    } else if (operation.kind === "update" && person) {
      Object.assign(person, operation.fields);
    } else if (
      operation.kind === "delete" &&
      person?.relationshipState !== "connected"
    ) {
      people = people.filter(
        (candidate) => candidate.id !== operation.personId,
      );
    }
  }
  return people;
}

// Native requests remain in one transaction: a successful save always commits
// both the outbox and the projection, including portraits.
export async function changeCuratorDevice(
  ownerId: string,
  change: (state: CuratorDeviceState) => void = () => {},
) {
  const generation = deviceOwnerGeneration(ownerId);
  const database = await openDeviceDatabase();
  if (
    !ownerId ||
    generation === null ||
    !database ||
    generation !== deviceOwnerGeneration(ownerId)
  )
    throw new Error(
      "Your device could not save this Character. Free some storage and try again.",
    );
  const key = `${encodeURIComponent(ownerId)}:curator`;
  return new Promise<CuratorDeviceState>((resolve, reject) => {
    const transaction = database.transaction(
      ["reads", "curator-outbox"],
      "readwrite",
    );
    const reads = transaction.objectStore("reads");
    const outbox = transaction.objectStore("curator-outbox");
    const snapshot = reads.get(key);
    const pending = outbox.get(ownerId);
    let completed = 0;
    let state: CuratorDeviceState;
    const apply = () => {
      if (++completed !== 2) return;
      try {
        if (generation !== deviceOwnerGeneration(ownerId))
          throw new Error("Sign in again to access your private edits.");
        state = {
          base: snapshot.result?.serverPeople ?? snapshot.result?.value ?? [],
          operations: pending.result ?? [],
          people: [],
          aliases: snapshot.result?.aliases ?? {},
        };
        state.people = projectCurator(state.base, state.operations);
        change(state);
        state.people = projectCurator(state.base, state.operations);
        reads.put(
          {
            version: 1,
            ownerId,
            collection: "curator",
            serverPeople: state.base,
            value: state.people,
            aliases: state.aliases,
          },
          key,
        );
        outbox.put(state.operations, ownerId);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    };
    snapshot.onsuccess = apply;
    pending.onsuccess = apply;
    transaction.oncomplete = () => resolve(state);
    transaction.onabort = transaction.onerror = () =>
      reject(
        new Error(
          "Your device could not save this Character. Free some storage and try again.",
        ),
      );
  });
}

export async function readCuratorDevice(ownerId: string) {
  await loadDeviceRead(ownerId, "curator"); // Migrate the previous snapshot first.
  return changeCuratorDevice(ownerId);
}

export async function enqueueCurator(
  ownerId: string,
  kind: CuratorOperation["kind"],
  personId: string,
  input: Partial<CuratorFields>,
) {
  const id = crypto.randomUUID();
  let localId = personId || `local-character-${id}`;
  const state = await changeCuratorDevice(ownerId, (state) => {
    localId = state.aliases[localId] ?? localId;
    const current = state.people.find((person) => person.id === localId);
    if (kind !== "create" && !current)
      throw new Error(
        "This Character no longer exists. Discard its pending change.",
      );
    if (kind === "delete" && current?.relationshipState === "connected")
      throw new Error(
        "End the Connection online before deleting this Character.",
      );
    const patch =
      kind === "update" && current
        ? Object.fromEntries(
            Object.entries(input).filter(
              ([key, value]) => value !== current[key as keyof CuratorRecord],
            ),
          )
        : input;
    if (kind === "update" && Object.keys(patch).length === 0) return;
    const placement = patch.placement;
    if (
      placement &&
      placement !== current?.placement &&
      (placement === "holding" ||
        placement === "party" ||
        placement === "tribe") &&
      state.people.filter(
        (person) =>
          person.placement === placement &&
          person.relationshipState !== "blocked",
      ).length >= (placement === "tribe" ? 100 : 5)
    )
      throw new Error(
        `${placement === "tribe" ? "Tribe already has 100 people" : `${placement === "party" ? "Party" : "Holding"} already has five Characters`}. Choose another layer.`,
      );
    const creation = state.operations.find(
      (operation) =>
        operation.personId === localId &&
        operation.kind === "create" &&
        !operation.request,
    );
    if (kind === "delete" && creation) {
      state.operations = state.operations.filter(
        (operation) => operation.personId !== localId,
      );
      return;
    }
    const last = state.operations.findLast(
      (operation) => operation.personId === localId,
    );
    const coalesced =
      kind === "update"
        ? (creation ??
          (last?.personId === localId && last.kind === "update" && !last.request
            ? last
            : undefined))
        : undefined;
    if (coalesced) {
      Object.assign(coalesced.fields, patch);
      coalesced.status = "pending";
      coalesced.error = undefined;
      coalesced.id = id;
      coalesced.label = input.nickname ?? coalesced.label;
      return;
    }
    state.operations.push({
      id,
      personId: localId,
      kind,
      fields: patch,
      label: input.nickname ?? current?.nickname ?? "Character",
      status: "pending",
    });
  });
  return { state, personId: localId };
}
