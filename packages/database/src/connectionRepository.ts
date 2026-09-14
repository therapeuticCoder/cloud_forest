import { createHash, randomBytes, randomUUID } from "node:crypto";

import { and, eq, isNull, or, sql } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import {
  connectionPairings,
  connections,
  curatedPersons,
  users,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

type PairingState =
  | "pending"
  | "completed"
  | "cancelled"
  | "superseded"
  | "expired";
type PairingRow = typeof connectionPairings.$inferSelect;

export type ConnectionRepositoryError =
  | "already-connected"
  | "character-not-found"
  | "character-linked-to-another-user"
  | "inactive-pairing"
  | "not-pairing-participant"
  | "receiver-required";

export type ConnectionRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ConnectionRepositoryError };

export function pairingTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPairingToken() {
  return randomBytes(32).toString("base64url");
}

function stateFor(pairing: PairingRow, now: Date): PairingState {
  if (pairing.status !== "pending") return pairing.status;
  return pairing.expiresAt <= now ? "expired" : "pending";
}

function orderedUsers(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? ([firstUserId, secondUserId] as const)
    : ([secondUserId, firstUserId] as const);
}

export function createConnectionRepository(database: DatabaseClient) {
  async function lockUsers(
    transaction: TransactionClient,
    firstUserId: string,
    secondUserId: string,
  ) {
    const [first, second] = orderedUsers(firstUserId, secondUserId);
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`${first}:${second}`}))`,
    );
  }

  async function findPairing(transaction: TransactionClient, token: string) {
    const [pairing] = await transaction
      .select()
      .from(connectionPairings)
      .where(eq(connectionPairings.tokenHash, pairingTokenHash(token)))
      .limit(1);
    return pairing ?? null;
  }

  async function existingConnection(
    transaction: TransactionClient,
    firstUserId: string,
    secondUserId: string,
  ) {
    const [first, second] = orderedUsers(firstUserId, secondUserId);
    const [connection] = await transaction
      .select({ id: connections.id })
      .from(connections)
      .where(
        and(
          eq(connections.firstUserId, first),
          eq(connections.secondUserId, second),
        ),
      )
      .limit(1);
    return connection ?? null;
  }

  async function ownedCharacter(
    transaction: TransactionClient,
    ownerUserId: string,
    curatedPersonId: string,
  ) {
    const [character] = await transaction
      .select()
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.id, curatedPersonId),
          eq(curatedPersons.ownerUserId, ownerUserId),
        ),
      )
      .limit(1);
    return character ?? null;
  }

  return {
    async start(input: {
      initiatorUserId: string;
      initiatorCuratedPersonId: string;
      token: string;
      now: Date;
    }): Promise<
      ConnectionRepositoryResult<{
        pairing: PairingRow;
        state: "pending" | "already-connected";
      }>
    > {
      return database.transaction(async (transaction) => {
        const character = await ownedCharacter(
          transaction,
          input.initiatorUserId,
          input.initiatorCuratedPersonId,
        );
        if (character === null) {
          return { ok: false, error: "character-not-found" };
        }
        if (character.linkedUserId !== null) {
          const connection = await existingConnection(
            transaction,
            input.initiatorUserId,
            character.linkedUserId,
          );
          if (connection !== null) {
            return {
              ok: true,
              value: { pairing: null as never, state: "already-connected" },
            };
          }
        }

        await transaction
          .update(connectionPairings)
          .set({
            status: "superseded",
            supersededAt: input.now,
            updatedAt: input.now,
          })
          .where(
            and(
              eq(
                connectionPairings.initiatorCuratedPersonId,
                input.initiatorCuratedPersonId,
              ),
              eq(connectionPairings.status, "pending"),
            ),
          );

        const [pairing] = await transaction
          .insert(connectionPairings)
          .values({
            id: `connection-pairing-${randomUUID()}`,
            tokenHash: pairingTokenHash(input.token),
            initiatorUserId: input.initiatorUserId,
            initiatorCuratedPersonId: input.initiatorCuratedPersonId,
            expiresAt: new Date(input.now.getTime() + 15 * 60 * 1000),
            createdAt: input.now,
            updatedAt: input.now,
          })
          .returning();
        if (!pairing)
          throw new Error("Pairing creation did not return a record.");
        return { ok: true, value: { pairing, state: "pending" } };
      });
    },

    async inspect(input: { token: string; viewerUserId: string; now: Date }) {
      return database.transaction(async (transaction) => {
        const pairing = await findPairing(transaction, input.token);
        if (pairing === null) return null;
        const state = stateFor(pairing, input.now);
        if (
          pairing.receiverUserId !== null &&
          pairing.initiatorUserId !== input.viewerUserId &&
          pairing.receiverUserId !== input.viewerUserId
        ) {
          return null;
        }
        const [initiator] = await transaction
          .select({ displayName: users.name })
          .from(users)
          .where(eq(users.id, pairing.initiatorUserId))
          .limit(1);
        if (!initiator) return null;
        const receiver = pairing.receiverUserId
          ? (
              await transaction
                .select({ displayName: users.name })
                .from(users)
                .where(eq(users.id, pairing.receiverUserId))
                .limit(1)
            )[0]
          : undefined;
        const viewerCuratedPersonId =
          pairing.initiatorUserId === input.viewerUserId
            ? pairing.initiatorCuratedPersonId
            : pairing.receiverUserId === input.viewerUserId
              ? pairing.receiverCuratedPersonId
              : null;
        const viewerCharacter = viewerCuratedPersonId
          ? await ownedCharacter(
              transaction,
              input.viewerUserId,
              viewerCuratedPersonId,
            )
          : null;
        return {
          pairing,
          state,
          initiator,
          receiver,
          viewerPlacement: viewerCharacter?.placement,
        };
      });
    },

    async resolve(input: {
      token: string;
      receiverUserId: string;
      receiverCuratedPersonId: string;
      now: Date;
    }): Promise<
      ConnectionRepositoryResult<{ pairing: PairingRow; state: PairingState }>
    > {
      return database.transaction(async (transaction) => {
        const pairing = await findPairing(transaction, input.token);
        if (pairing === null || stateFor(pairing, input.now) !== "pending") {
          return { ok: false, error: "inactive-pairing" };
        }
        if (pairing.initiatorUserId === input.receiverUserId) {
          return { ok: false, error: "not-pairing-participant" };
        }
        if (
          pairing.receiverUserId !== null &&
          pairing.receiverUserId !== input.receiverUserId
        ) {
          return { ok: false, error: "not-pairing-participant" };
        }
        await lockUsers(
          transaction,
          pairing.initiatorUserId,
          input.receiverUserId,
        );
        if (
          (await existingConnection(
            transaction,
            pairing.initiatorUserId,
            input.receiverUserId,
          )) !== null
        ) {
          return { ok: false, error: "already-connected" };
        }
        const character = await ownedCharacter(
          transaction,
          input.receiverUserId,
          input.receiverCuratedPersonId,
        );
        if (character === null)
          return { ok: false, error: "character-not-found" };
        if (
          character.linkedUserId !== null &&
          character.linkedUserId !== pairing.initiatorUserId
        ) {
          return { ok: false, error: "character-linked-to-another-user" };
        }
        const [resolved] = await transaction
          .update(connectionPairings)
          .set({
            receiverUserId: input.receiverUserId,
            receiverCuratedPersonId: input.receiverCuratedPersonId,
            updatedAt: input.now,
          })
          .where(
            and(
              eq(connectionPairings.id, pairing.id),
              eq(connectionPairings.status, "pending"),
              sql`${connectionPairings.expiresAt} > ${input.now}`,
              or(
                isNull(connectionPairings.receiverUserId),
                and(
                  eq(connectionPairings.receiverUserId, input.receiverUserId),
                  eq(
                    connectionPairings.receiverCuratedPersonId,
                    input.receiverCuratedPersonId,
                  ),
                ),
              ),
            ),
          )
          .returning();
        if (!resolved) return { ok: false, error: "inactive-pairing" };
        return { ok: true, value: { pairing: resolved, state: "pending" } };
      });
    },

    async confirm(input: { token: string; userId: string; now: Date }): Promise<
      ConnectionRepositoryResult<{
        pairing: PairingRow;
        state: "awaiting-confirmation" | "connected";
      }>
    > {
      return database.transaction(async (transaction) => {
        const pairing = await findPairing(transaction, input.token);
        if (pairing === null || stateFor(pairing, input.now) !== "pending") {
          return { ok: false, error: "inactive-pairing" };
        }
        if (
          pairing.receiverUserId === null ||
          pairing.receiverCuratedPersonId === null
        ) {
          return { ok: false, error: "receiver-required" };
        }
        if (
          input.userId !== pairing.initiatorUserId &&
          input.userId !== pairing.receiverUserId
        ) {
          return { ok: false, error: "not-pairing-participant" };
        }
        await lockUsers(
          transaction,
          pairing.initiatorUserId,
          pairing.receiverUserId,
        );
        const confirmation =
          input.userId === pairing.initiatorUserId
            ? { initiatorConfirmedAt: input.now }
            : { receiverConfirmedAt: input.now };
        const [confirmed] = await transaction
          .update(connectionPairings)
          .set({ ...confirmation, updatedAt: input.now })
          .where(
            and(
              eq(connectionPairings.id, pairing.id),
              eq(connectionPairings.status, "pending"),
              sql`${connectionPairings.expiresAt} > ${input.now}`,
            ),
          )
          .returning();
        if (
          !confirmed ||
          confirmed.receiverUserId === null ||
          confirmed.receiverCuratedPersonId === null
        )
          throw new Error("Pairing confirmation did not return a record.");
        const receiverUserId = confirmed.receiverUserId;
        const receiverCuratedPersonId = confirmed.receiverCuratedPersonId;
        if (
          confirmed.initiatorConfirmedAt === null ||
          confirmed.receiverConfirmedAt === null
        ) {
          return {
            ok: true,
            value: { pairing: confirmed, state: "awaiting-confirmation" },
          };
        }
        const [firstUserId, secondUserId] = orderedUsers(
          confirmed.initiatorUserId,
          receiverUserId,
        );
        if (
          (await existingConnection(transaction, firstUserId, secondUserId)) ===
          null
        ) {
          const initiatorCharacter = await ownedCharacter(
            transaction,
            confirmed.initiatorUserId,
            confirmed.initiatorCuratedPersonId,
          );
          const receiverCharacter = await ownedCharacter(
            transaction,
            receiverUserId,
            receiverCuratedPersonId,
          );
          if (
            initiatorCharacter === null ||
            receiverCharacter === null ||
            (initiatorCharacter.linkedUserId !== null &&
              initiatorCharacter.linkedUserId !== receiverUserId) ||
            (receiverCharacter.linkedUserId !== null &&
              receiverCharacter.linkedUserId !== confirmed.initiatorUserId)
          ) {
            throw new Error(
              "Resolved Characters are no longer available for this connection.",
            );
          }
          const [initiatorLinked] = await transaction
            .update(curatedPersons)
            .set({
              linkedUserId: receiverUserId,
              version: sql`${curatedPersons.version} + 1`,
              updatedAt: input.now,
            })
            .where(
              and(
                eq(curatedPersons.id, confirmed.initiatorCuratedPersonId),
                eq(curatedPersons.ownerUserId, confirmed.initiatorUserId),
                or(
                  isNull(curatedPersons.linkedUserId),
                  eq(curatedPersons.linkedUserId, receiverUserId),
                ),
              ),
            )
            .returning({ id: curatedPersons.id });
          const [receiverLinked] = await transaction
            .update(curatedPersons)
            .set({
              linkedUserId: confirmed.initiatorUserId,
              version: sql`${curatedPersons.version} + 1`,
              updatedAt: input.now,
            })
            .where(
              and(
                eq(curatedPersons.id, receiverCuratedPersonId),
                eq(curatedPersons.ownerUserId, receiverUserId),
                or(
                  isNull(curatedPersons.linkedUserId),
                  eq(curatedPersons.linkedUserId, confirmed.initiatorUserId),
                ),
              ),
            )
            .returning({ id: curatedPersons.id });
          if (!initiatorLinked || !receiverLinked) {
            throw new Error(
              "Resolved Characters could not be linked atomically.",
            );
          }
          await transaction.insert(connections).values({
            id: `connection-${randomUUID()}`,
            firstUserId,
            secondUserId,
            createdAt: input.now,
          });
        }
        const [completed] = await transaction
          .update(connectionPairings)
          .set({
            status: "completed",
            completedAt: input.now,
            updatedAt: input.now,
          })
          .where(eq(connectionPairings.id, pairing.id))
          .returning();
        if (!completed)
          throw new Error("Pairing completion did not return a record.");
        return { ok: true, value: { pairing: completed, state: "connected" } };
      });
    },

    async cancel(input: {
      token: string;
      userId: string;
      now: Date;
    }): Promise<ConnectionRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const pairing = await findPairing(transaction, input.token);
        if (pairing === null || stateFor(pairing, input.now) !== "pending") {
          return { ok: false, error: "inactive-pairing" };
        }
        if (
          input.userId !== pairing.initiatorUserId &&
          input.userId !== pairing.receiverUserId
        ) {
          return { ok: false, error: "not-pairing-participant" };
        }
        const cancelled = await transaction
          .update(connectionPairings)
          .set({
            status: "cancelled",
            cancelledAt: input.now,
            updatedAt: input.now,
          })
          .where(
            and(
              eq(connectionPairings.id, pairing.id),
              eq(connectionPairings.status, "pending"),
              sql`${connectionPairings.expiresAt} > ${input.now}`,
            ),
          )
          .returning({ id: connectionPairings.id });
        return cancelled.length === 1
          ? { ok: true, value: null }
          : { ok: false, error: "inactive-pairing" };
      });
    },
  };
}

export type ConnectionRepository = ReturnType<
  typeof createConnectionRepository
>;
