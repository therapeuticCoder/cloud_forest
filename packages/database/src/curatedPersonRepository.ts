import { randomUUID } from "node:crypto";

import { and, asc, eq, sql } from "drizzle-orm";
import type { CuratedPersonPlacement } from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import { curatedPersons } from "./schema.ts";

const partyCapacity = 5;
type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

export type CuratedPersonRepositoryError =
  | "curated-person-not-found"
  | "party-capacity-exceeded"
  | "stale-write-conflict";

export type CuratedPersonRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CuratedPersonRepositoryError };

export function createCuratedPersonRepository(database: DatabaseClient) {
  async function lockOwner(
    transaction: TransactionClient,
    ownerUserId: string,
  ) {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${ownerUserId}))`,
    );
  }

  async function countParty(
    transaction: TransactionClient,
    ownerUserId: string,
  ) {
    const rows = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, ownerUserId),
          eq(curatedPersons.placement, "party"),
        ),
      );
    return rows.length;
  }

  return {
    async listOwned(ownerUserId: string) {
      return database
        .select()
        .from(curatedPersons)
        .where(eq(curatedPersons.ownerUserId, ownerUserId))
        .orderBy(asc(curatedPersons.createdAt), asc(curatedPersons.id));
    },

    async create(input: {
      ownerUserId: string;
      nickname: string;
      relationshipShape: string;
      privateDescription: string;
      placement: CuratedPersonPlacement;
      now: Date;
    }): Promise<
      CuratedPersonRepositoryResult<typeof curatedPersons.$inferSelect>
    > {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
        if (
          input.placement === "party" &&
          (await countParty(transaction, input.ownerUserId)) >= partyCapacity
        ) {
          return { ok: false, error: "party-capacity-exceeded" };
        }

        const [created] = await transaction
          .insert(curatedPersons)
          .values({
            id: `curated-person-${randomUUID()}`,
            ownerUserId: input.ownerUserId,
            nickname: input.nickname,
            relationshipShape: input.relationshipShape,
            privateDescription: input.privateDescription,
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
    },

    async update(input: {
      ownerUserId: string;
      curatedPersonId: string;
      nickname: string;
      relationshipShape: string;
      privateDescription: string;
      placement: CuratedPersonPlacement;
      expectedVersion: number;
      now: Date;
    }): Promise<
      CuratedPersonRepositoryResult<typeof curatedPersons.$inferSelect>
    > {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
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
        if (!existing) return { ok: false, error: "curated-person-not-found" };
        if (existing.version !== input.expectedVersion)
          return { ok: false, error: "stale-write-conflict" };
        if (
          input.placement === "party" &&
          existing.placement !== "party" &&
          (await countParty(transaction, input.ownerUserId)) >= partyCapacity
        ) {
          return { ok: false, error: "party-capacity-exceeded" };
        }

        const [updated] = await transaction
          .update(curatedPersons)
          .set({
            nickname: input.nickname,
            relationshipShape: input.relationshipShape,
            privateDescription: input.privateDescription,
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
        return updated
          ? { ok: true, value: updated }
          : { ok: false, error: "stale-write-conflict" };
      });
    },

    async remove(input: {
      ownerUserId: string;
      curatedPersonId: string;
      expectedVersion: number;
    }): Promise<CuratedPersonRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        await lockOwner(transaction, input.ownerUserId);
        const [existing] = await transaction
          .select({ version: curatedPersons.version })
          .from(curatedPersons)
          .where(
            and(
              eq(curatedPersons.id, input.curatedPersonId),
              eq(curatedPersons.ownerUserId, input.ownerUserId),
            ),
          )
          .limit(1);
        if (!existing) return { ok: false, error: "curated-person-not-found" };
        if (existing.version !== input.expectedVersion)
          return { ok: false, error: "stale-write-conflict" };
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
    },
  };
}

export type CuratedPersonRepository = ReturnType<
  typeof createCuratedPersonRepository
>;
