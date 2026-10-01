import { randomUUID } from "node:crypto";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import type { DatabaseClient } from "./client.ts";
import { careConversationEligibility } from "./careEligibility.ts";
import {
  accountPeople,
  cares,
  careMessages,
  careMessageReads,
  personProfiles,
} from "./schema.ts";

type Transaction = Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0];
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: "care-not-found" | "message-invalid" };

export function createCareConversationRepository(database: DatabaseClient) {
  async function authorize(
    transaction: Transaction,
    careId: string,
    viewerUserId: string,
  ) {
    // Follow Care mutations' lock order. Closure's row update and trigger cannot
    // race a message insertion after we have checked the current eligibility.
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`care:${careId}`}))`,
    );
    const [care] = await transaction
      .select()
      .from(cares)
      .where(
        and(eq(cares.id, careId), careConversationEligibility(viewerUserId)),
      )
      .limit(1);
    if (!care?.participantUserId) return false;
    const pair = [care.originatorUserId, care.participantUserId]
      .sort()
      .join(":");
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${pair}))`,
    );
    const [current] = await transaction
      .select({ id: cares.id })
      .from(cares)
      .where(
        and(eq(cares.id, careId), careConversationEligibility(viewerUserId)),
      )
      .for("update")
      .limit(1);
    return current !== undefined;
  }

  function listMessages(transaction: Transaction, careId: string) {
    return transaction
      .select({
        id: careMessages.id,
        text: careMessages.text,
        sentAt: careMessages.sentAt,
        sender: {
          personId: accountPeople.personId,
          displayName: personProfiles.displayName,
        },
      })
      .from(careMessages)
      .innerJoin(
        accountPeople,
        eq(careMessages.senderUserId, accountPeople.accountId),
      )
      .innerJoin(
        personProfiles,
        eq(accountPeople.personId, personProfiles.personId),
      )
      .where(eq(careMessages.careId, careId))
      .orderBy(asc(careMessages.sequence));
  }

  return {
    async read(
      careId: string,
      viewerUserId: string,
    ): Promise<Result<Awaited<ReturnType<typeof listMessages>>>> {
      return database.transaction(async (transaction) => {
        if (!(await authorize(transaction, careId, viewerUserId)))
          return { ok: false, error: "care-not-found" };
        return { ok: true, value: await listMessages(transaction, careId) };
      });
    },
    async send(
      careId: string,
      viewerUserId: string,
      text: string,
    ): Promise<Result<null>> {
      if (!text.trim() || text.length > 2000)
        return { ok: false, error: "message-invalid" };
      return database.transaction(async (transaction) => {
        if (!(await authorize(transaction, careId, viewerUserId)))
          return { ok: false, error: "care-not-found" };
        await transaction.insert(careMessages).values({
          id: `care-message-${randomUUID()}`,
          careId,
          senderUserId: viewerUserId,
          text: text.trim(),
          sentAt: new Date(),
        });
        return { ok: true, value: null };
      });
    },
    async markRead(
      careId: string,
      viewerUserId: string,
      throughMessageId: string,
    ): Promise<Result<null>> {
      return database.transaction(async (transaction) => {
        if (!(await authorize(transaction, careId, viewerUserId)))
          return { ok: false, error: "care-not-found" };
        const [message] = await transaction
          .select({ sequence: careMessages.sequence })
          .from(careMessages)
          .where(
            and(
              eq(careMessages.careId, careId),
              eq(careMessages.id, throughMessageId),
            ),
          )
          .limit(1);
        if (!message) return { ok: false, error: "care-not-found" };
        await transaction
          .insert(careMessageReads)
          .values({
            careId,
            readerUserId: viewerUserId,
            lastReadSequence: message.sequence,
          })
          .onConflictDoUpdate({
            target: [careMessageReads.careId, careMessageReads.readerUserId],
            set: {
              lastReadSequence: sql`greatest(${careMessageReads.lastReadSequence}, ${message.sequence})`,
            },
          });
        return { ok: true, value: null };
      });
    },
    async unread(viewerUserId: string) {
      return database
        .select({
          careId: cares.id,
          unreadCount: sql<number>`count(${careMessages.id})::integer`.mapWith(
            Number,
          ),
        })
        .from(cares)
        .leftJoin(
          careMessageReads,
          and(
            eq(careMessageReads.careId, cares.id),
            eq(careMessageReads.readerUserId, viewerUserId),
          ),
        )
        .leftJoin(
          careMessages,
          and(
            eq(careMessages.careId, cares.id),
            ne(careMessages.senderUserId, viewerUserId),
            sql`${careMessages.sequence} > coalesce(${careMessageReads.lastReadSequence}, 0)`,
          ),
        )
        .where(careConversationEligibility(viewerUserId))
        .groupBy(cares.id);
    },
  };
}

export type CareConversationRepository = ReturnType<
  typeof createCareConversationRepository
>;
