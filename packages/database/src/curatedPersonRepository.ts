import { createHash, randomUUID } from "node:crypto";

import { and, asc, eq, notExists, or, sql } from "drizzle-orm";
import type { CuratedPersonPlacement } from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  carePasses,
  connections,
  curatedPersons,
  curatorMutationReceipts,
  relationshipBlocks,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];
const partyCapacity = 5;
const tribeCapacity = 100;
const holdingCapacity = 5;

export type CuratedPersonRepositoryError =
  | "curated-person-not-found"
  | "curated-person-connected"
  | "holding-capacity-exceeded"
  | "party-capacity-exceeded"
  | "tribe-capacity-exceeded"
  | "stale-write-conflict";

export type CuratedPersonRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CuratedPersonRepositoryError };

export function createCuratedPersonRepository(database: DatabaseClient) {
  type Row = typeof curatedPersons.$inferSelect;
  async function recordedMutation<T extends Row | null>(
    transaction: TransactionClient,
    kind: "create" | "update" | "remove",
    input: { ownerUserId: string; mutationId?: string },
    mutate: () => Promise<CuratedPersonRepositoryResult<T>>,
  ): Promise<CuratedPersonRepositoryResult<T>> {
    if (!input.mutationId) return mutate();
    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify([
          kind,
          Object.entries(input)
            .filter(([key]) => key !== "now")
            .sort(([a], [b]) => a.localeCompare(b)),
        ]),
      )
      .digest("hex");
    const [receipt] = await transaction
      .select()
      .from(curatorMutationReceipts)
      .where(
        and(
          eq(curatorMutationReceipts.ownerUserId, input.ownerUserId),
          eq(curatorMutationReceipts.mutationId, input.mutationId),
        ),
      )
      .limit(1);
    if (receipt) {
      if (receipt.fingerprint !== fingerprint)
        return { ok: false, error: "stale-write-conflict" };
      const value = receipt.result
        ? {
            ...receipt.result,
            createdAt: new Date(String(receipt.result.createdAt)),
            updatedAt: new Date(String(receipt.result.updatedAt)),
          }
        : null;
      return { ok: true, value: value as T };
    }
    const result = await mutate();
    if (result.ok)
      await transaction.insert(curatorMutationReceipts).values({
        ownerUserId: input.ownerUserId,
        mutationId: input.mutationId,
        fingerprint,
        result: result.value,
      });
    return result;
  }
  async function lockOwner(
    transaction: TransactionClient,
    ownerUserId: string,
  ) {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${ownerUserId}))`,
    );
  }

  async function countPlacement(
    transaction: TransactionClient,
    ownerUserId: string,
    placement: "holding" | "party" | "tribe",
  ) {
    const rows = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, ownerUserId),
          eq(curatedPersons.placement, placement),
          notExists(
            transaction
              .select({ blockerUserId: relationshipBlocks.blockerUserId })
              .from(relationshipBlocks)
              .where(
                and(
                  eq(relationshipBlocks.blockerUserId, ownerUserId),
                  or(
                    eq(
                      relationshipBlocks.contextCuratedPersonId,
                      curatedPersons.id,
                    ),
                    eq(
                      relationshipBlocks.blockedUserId,
                      curatedPersons.linkedUserId,
                    ),
                  ),
                ),
              ),
          ),
        ),
      );
    return rows.length;
  }

  function capacityFor(placement: CuratedPersonPlacement) {
    if (placement === "holding") return holdingCapacity;
    if (placement === "party") return partyCapacity;
    if (placement === "tribe") return tribeCapacity;
    return null;
  }

  function capacityErrorFor(
    placement: CuratedPersonPlacement,
  ):
    | "holding-capacity-exceeded"
    | "party-capacity-exceeded"
    | "tribe-capacity-exceeded"
    | null {
    if (placement === "holding") return "holding-capacity-exceeded";
    if (placement === "party") return "party-capacity-exceeded";
    if (placement === "tribe") return "tribe-capacity-exceeded";
    return null;
  }

  return {
    async listOwned(ownerUserId: string) {
      return database.transaction(async (transaction) => {
        const people = await transaction
          .select({
            person: curatedPersons,
            linkedPersonId: accountPeople.personId,
          })
          .from(curatedPersons)
          .leftJoin(
            accountPeople,
            eq(curatedPersons.linkedUserId, accountPeople.accountId),
          )
          .where(eq(curatedPersons.ownerUserId, ownerUserId))
          .orderBy(asc(curatedPersons.createdAt), asc(curatedPersons.id));
        const activeConnections = await transaction
          .select({
            firstUserId: connections.firstUserId,
            secondUserId: connections.secondUserId,
          })
          .from(connections)
          .where(
            or(
              eq(connections.firstUserId, ownerUserId),
              eq(connections.secondUserId, ownerUserId),
            ),
          );
        const blocks = await transaction
          .select()
          .from(relationshipBlocks)
          .where(eq(relationshipBlocks.blockerUserId, ownerUserId));
        const connectedUserIds = new Set(
          activeConnections.flatMap(({ firstUserId, secondUserId }) =>
            firstUserId === ownerUserId ? [secondUserId] : [firstUserId],
          ),
        );

        return people.map(({ person, linkedPersonId }) => {
          const block =
            blocks.find(
              (candidate) =>
                candidate.blockedUserId === person.linkedUserId &&
                candidate.contextCuratedPersonId === person.id,
            ) ??
            blocks.find(
              (candidate) => candidate.blockedUserId === person.linkedUserId,
            ) ??
            blocks.find(
              (candidate) =>
                person.linkedUserId === null &&
                candidate.contextCuratedPersonId === person.id,
            );
          const relationshipState: "character" | "connected" | "blocked" = block
            ? "blocked"
            : person.linkedUserId !== null &&
                connectedUserIds.has(person.linkedUserId)
              ? "connected"
              : "character";
          return {
            ...person,
            linkedPersonId,
            relationshipState,
            ...(block ? { blockedUserId: block.blockedUserId } : {}),
          };
        });
      });
    },

    async create(input: {
      ownerUserId: string;
      mutationId?: string;
      firstName: string;
      lastName: string;
      nickname: string;
      relationshipShape: string;
      privateDescription: string;
      portraitUrl?: string;
      placement: CuratedPersonPlacement;
      now: Date;
    }): Promise<
      CuratedPersonRepositoryResult<typeof curatedPersons.$inferSelect>
    > {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
        return recordedMutation(transaction, "create", input, async () => {
          if (
            (input.placement === "holding" ||
              input.placement === "party" ||
              input.placement === "tribe") &&
            (await countPlacement(
              transaction,
              input.ownerUserId,
              input.placement,
            )) >= capacityFor(input.placement)!
          ) {
            return { ok: false, error: capacityErrorFor(input.placement)! };
          }

          const [created] = await transaction
            .insert(curatedPersons)
            .values({
              id: `curated-person-${randomUUID()}`,
              ownerUserId: input.ownerUserId,
              firstName: input.firstName,
              lastName: input.lastName,
              nickname: input.nickname,
              relationshipShape: input.relationshipShape,
              privateDescription: input.privateDescription,
              portraitUrl: input.portraitUrl ?? "",
              placement: input.placement,
              createdAt: input.now,
              updatedAt: input.now,
            })
            .returning();
          if (!created) {
            throw new Error("Curated Person creation did not return a record.");
          }
          return { ok: true, value: created };
        });
      });
    },

    async update(input: {
      ownerUserId: string;
      mutationId?: string;
      curatedPersonId: string;
      firstName: string;
      lastName: string;
      nickname: string;
      relationshipShape: string;
      privateDescription: string;
      portraitUrl?: string;
      placement: CuratedPersonPlacement;
      expectedVersion: number;
      now: Date;
    }): Promise<
      CuratedPersonRepositoryResult<typeof curatedPersons.$inferSelect>
    > {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
        return recordedMutation(transaction, "update", input, async () => {
          const [existing] = await transaction
            .select()
            .from(curatedPersons)
            .where(
              and(
                eq(curatedPersons.id, input.curatedPersonId),
                eq(curatedPersons.ownerUserId, input.ownerUserId),
              ),
            )
            .limit(1);
          if (!existing)
            return { ok: false, error: "curated-person-not-found" };
          if (existing.version !== input.expectedVersion)
            return { ok: false, error: "stale-write-conflict" };
          if (
            (input.placement === "holding" ||
              input.placement === "party" ||
              input.placement === "tribe") &&
            existing.placement !== input.placement &&
            (await countPlacement(
              transaction,
              input.ownerUserId,
              input.placement,
            )) >= capacityFor(input.placement)!
          ) {
            return { ok: false, error: capacityErrorFor(input.placement)! };
          }

          const [updated] = await transaction
            .update(curatedPersons)
            .set({
              firstName: input.firstName,
              lastName: input.lastName,
              nickname: input.nickname,
              relationshipShape: input.relationshipShape,
              privateDescription: input.privateDescription,
              portraitUrl: input.portraitUrl ?? existing.portraitUrl,
              placement: input.placement,
              version: sql`${curatedPersons.version} + 1`,
              updatedAt: input.now,
            })
            .where(
              and(
                eq(curatedPersons.id, input.curatedPersonId),
                eq(curatedPersons.ownerUserId, input.ownerUserId),
                eq(curatedPersons.version, input.expectedVersion),
              ),
            )
            .returning();
          if (
            updated &&
            existing.linkedUserId !== null &&
            existing.placement !== input.placement &&
            (existing.placement === "party" ||
              existing.placement === "tribe") &&
            (input.placement === "party" || input.placement === "tribe")
          ) {
            await transaction
              .delete(carePasses)
              .where(
                and(
                  eq(carePasses.originatorUserId, input.ownerUserId),
                  eq(carePasses.viewerUserId, existing.linkedUserId),
                ),
              );
          }
          return updated
            ? { ok: true, value: updated }
            : { ok: false, error: "stale-write-conflict" };
        });
      });
    },

    async remove(input: {
      ownerUserId: string;
      mutationId?: string;
      curatedPersonId: string;
      expectedVersion: number;
    }): Promise<CuratedPersonRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
        return recordedMutation(transaction, "remove", input, async () => {
          const [existing] = await transaction
            .select()
            .from(curatedPersons)
            .where(
              and(
                eq(curatedPersons.id, input.curatedPersonId),
                eq(curatedPersons.ownerUserId, input.ownerUserId),
              ),
            )
            .limit(1);
          if (!existing)
            return { ok: false, error: "curated-person-not-found" };
          if (existing.version !== input.expectedVersion)
            return { ok: false, error: "stale-write-conflict" };
          if (existing.linkedUserId !== null) {
            const [connection] = await transaction
              .select({ id: connections.id })
              .from(connections)
              .where(
                or(
                  and(
                    eq(connections.firstUserId, input.ownerUserId),
                    eq(connections.secondUserId, existing.linkedUserId),
                  ),
                  and(
                    eq(connections.firstUserId, existing.linkedUserId),
                    eq(connections.secondUserId, input.ownerUserId),
                  ),
                ),
              )
              .limit(1);
            if (connection) {
              return { ok: false, error: "curated-person-connected" };
            }
          }
          await transaction
            .delete(relationshipBlocks)
            .where(eq(relationshipBlocks.contextCuratedPersonId, existing.id));
          await transaction
            .delete(curatedPersons)
            .where(
              and(
                eq(curatedPersons.id, input.curatedPersonId),
                eq(curatedPersons.ownerUserId, input.ownerUserId),
                eq(curatedPersons.version, input.expectedVersion),
              ),
            );
          return { ok: true, value: null };
        });
      });
    },
  };
}

export type CuratedPersonRepository = ReturnType<
  typeof createCuratedPersonRepository
>;
