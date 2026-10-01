import type {
  ApiClient,
  GetCuratedPersonsResult,
  UpdateCuratedPersonInput,
  DeleteCuratedPersonInput,
  CuratedPersonInput,
} from "@cloud-forest/api-client";
import {
  changeCuratorDevice,
  privateFields,
  type CuratorDeviceState,
} from "@/lib/curatorOutbox";
import { reportExpiredDeviceSession } from "@/lib/deviceReadStorage";

type Client = Pick<
  ApiClient,
  | "getCuratedPersons"
  | "createCuratedPerson"
  | "updateCuratedPerson"
  | "deleteCuratedPerson"
>;
const runners = new Map<string, Promise<void>>();

export function synchronizeCurator(
  owner: string,
  client: Client,
  isLive: () => boolean,
  publish: (state: CuratorDeviceState, offline?: boolean) => void,
): Promise<void> {
  const existing = runners.get(owner);
  if (existing)
    return existing.then(() =>
      synchronizeCurator(owner, client, isLive, publish),
    );
  const run = async () => {
    let conflicts = 0;
    let conflictOperationId: string | undefined;
    while (isLive()) {
      const state = await changeCuratorDevice(owner);
      // Retain rejected edits for correction without blocking later work.
      const head = state.operations.find(
        (operation) => operation.status === "pending",
      );
      if (!head) return;
      if (head.id !== conflictOperationId) {
        conflicts = 0;
        conflictOperationId = head.id;
      }
      if (!head.request) {
        const refreshed = await client.getCuratedPersons();
        if (!isLive()) return;
        if (!refreshed.ok) {
          failure(refreshed);
          if (refreshed.kind === "network" || refreshed.status !== 401)
            publish(await changeCuratorDevice(owner), true);
          return;
        }
        const prepared = await changeCuratorDevice(owner, (state) => {
          state.base = [...refreshed.value.data.people];
          const operation = state.operations.find(
            (operation) => operation.id === head.id,
          );
          if (
            !operation ||
            operation.id !== head.id ||
            operation.status !== "pending" ||
            operation.request
          )
            return;
          const current = state.base.find(
            (person) => person.id === operation.personId,
          );
          if (operation.kind !== "create" && !current) {
            operation.status = "rejected";
            operation.error =
              "This Character was deleted on the server. Discard this change; an update cannot recreate it.";
          } else if (
            operation.kind === "delete" &&
            current?.relationshipState === "connected"
          ) {
            operation.status = "rejected";
            operation.error =
              "This Character is now connected. Discard this deletion and end the Connection online first.";
          } else {
            const body =
              operation.kind === "create"
                ? {
                    ...(operation.fields as CuratedPersonInput),
                    mutationId: operation.id,
                  }
                : operation.kind === "delete"
                  ? {
                      expectedVersion: current!.version,
                      mutationId: operation.id,
                    }
                  : {
                      ...privateFields(current!),
                      ...operation.fields,
                      expectedVersion: current!.version,
                      mutationId: operation.id,
                    };
            operation.request = { personId: operation.personId, body };
          }
        });
        publish(prepared, false);
        continue;
      }
      const result: GetCuratedPersonsResult =
        head.kind === "create"
          ? await client.createCuratedPerson(
              head.request.body as CuratedPersonInput,
            )
          : head.kind === "update"
            ? await client.updateCuratedPerson(
                head.request.personId,
                head.request.body as UpdateCuratedPersonInput,
              )
            : await client.deleteCuratedPerson(
                head.request.personId,
                head.request.body as DeleteCuratedPersonInput,
              );
      if (!isLive()) return;
      if (result.ok) {
        conflicts = 0;
        const saved = await changeCuratorDevice(owner, (state) => {
          state.base = [...result.value.data.people];
          const operation = state.operations.find(
            (operation) => operation.id === head.id,
          );
          if (!operation) return;
          if (
            operation.kind === "create" &&
            result.value.data.changedPersonId
          ) {
            const localPersonId = operation.personId;
            state.aliases[localPersonId] = result.value.data.changedPersonId;
            for (const queued of state.operations)
              if (queued.personId === localPersonId)
                queued.personId = result.value.data.changedPersonId;
          }
          state.operations = state.operations.filter(
            (operation) => operation.id !== head.id,
          );
        });
        publish(saved, false);
      } else if (
        result.kind === "network" ||
        (result.kind === "unexpected-response" &&
          (result.status >= 500 || result.status < 300))
      ) {
        publish(await changeCuratorDevice(owner), true); // Keep the exact durable request for lost acknowledgements.
        return;
      } else if (result.status === 401) {
        reportExpiredDeviceSession(owner);
        return;
      } else {
        const stale =
          result.kind === "http" &&
          result.error.error.code === "STALE_WRITE_CONFLICT";
        const retry = stale && ++conflicts < 3;
        const rejected = await changeCuratorDevice(owner, (state) => {
          const operation = state.operations.find(
            (operation) => operation.id === head.id,
          );
          if (!operation) return;
          operation.request = undefined;
          operation.status = retry ? "pending" : "rejected";
          operation.error =
            result.kind === "http"
              ? result.error.error.message
              : "The server rejected this change. Correct it, retry, or discard it.";
        });
        publish(rejected);
        if (!retry) conflicts = 0;
      }
    }
  };
  function failure(result: Exclude<GetCuratedPersonsResult, { ok: true }>) {
    if (result.kind !== "network" && result.status === 401)
      reportExpiredDeviceSession(owner);
  }
  const promise = run().finally(() => runners.delete(owner));
  runners.set(owner, promise);
  return promise;
}
