import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  type CareCategoryId,
  type CareDay,
  type CareDirection,
  type CareTime,
} from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  careGratitudes,
  carePasses,
  cares,
  connections,
  curatedPersons,
  personProfiles,
  relationshipBlocks,
  type CareAudience,
  type CareExpiration,
  type CareGratitudeStatementId,
  type CareWithdrawalStatementId,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

export type CareRepositoryError =
  | "care-not-found"
  | "care-already-claimed"
  | "care-gratitude-invalid"
  | "care-gratitude-already-recorded"
  | "care-withdrawal-invalid";

export type CareRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CareRepositoryError };

export type CareRecord = {
  id: string;
  originatorUserId: string;
  participantUserId: string | null;
  direction: CareDirection;
  category: CareCategoryId;
  subtype: string;
  days: CareDay[];
  times: CareTime[];
  timeNote: string;
  location: string;
  requirements: string;
  sensitivities: string;
  audience: CareAudience;
  status:
    | "open"
    | "claimed"
    | "orphaned"
    | "completed"
    | "expired"
    | "not_completed";
  claimedAt: Date | null;
  originatorCompletedAt: Date | null;
  participantCompletedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  expiredAt: Date | null;
  notCompletedAt: Date | null;
  createdAt: Date;
  originator: { personId: string; displayName: string };
  participant: { personId: string; displayName: string } | null;
  gratitude: {
    statementId: CareGratitudeStatementId;
    message: string;
    createdAt: Date;
  } | null;
  apology: {
    statementId: CareWithdrawalStatementId;
    message: string;
    createdAt: Date;
  } | null;
};

const careExpirationMs: Record<CareExpiration, number> = {
  "1h": 60 * 60 * 1_000,
  "4h": 4 * 60 * 60 * 1_000,
  "1d": 24 * 60 * 60 * 1_000,
  "1w": 7 * 24 * 60 * 60 * 1_000,
};

const gratitudeStatements = new Set<CareGratitudeStatementId>([
  "meal-fed-when-needed",
  "meal-care-felt-easy",
  "meal-seen-and-supported",
]);
const withdrawalStatements = new Set<CareWithdrawalStatementId>([
  "meal-sorry-cant-follow-through",
  "meal-something-changed",
  "meal-sorry-committed",
]);

function orderedUsers(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? ([firstUserId, secondUserId] as const)
    : ([secondUserId, firstUserId] as const);
}

function expiresAtFor(now: Date, expiresIn: CareExpiration) {
  return new Date(now.getTime() + careExpirationMs[expiresIn]);
}

function currentCareConnection(viewerUserId: string, careTable = cares) {
  const currentConnection = sql`exists (
    select 1 from ${connections}
    where ${connections.firstUserId} = least(${careTable.originatorUserId}, ${viewerUserId})
      and ${connections.secondUserId} = greatest(${careTable.originatorUserId}, ${viewerUserId})
  )`;
  const notBlocked = sql`not exists (
    select 1 from ${relationshipBlocks}
    where (${relationshipBlocks.blockerUserId} = ${careTable.originatorUserId} and ${relationshipBlocks.blockedUserId} = ${viewerUserId})
       or (${relationshipBlocks.blockerUserId} = ${viewerUserId} and ${relationshipBlocks.blockedUserId} = ${careTable.originatorUserId})
  )`;
  const currentPlacement = sql`exists (
    select 1 from ${curatedPersons}
    where ${curatedPersons.ownerUserId} = ${careTable.originatorUserId}
      and ${curatedPersons.linkedUserId} = ${viewerUserId}
      and ${curatedPersons.placement} = ${careTable.audience}
  )`;
  return and(currentConnection, notBlocked, currentPlacement);
}

export function createCareRepository(database: DatabaseClient) {
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

  async function lockCare(transaction: TransactionClient, careId: string) {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`care:${careId}`}))`,
    );
  }

  async function canAccess(
    originatorUserId: string,
    viewerUserId: string,
    audience: CareAudience,
    transaction: TransactionClient | DatabaseClient = database,
    careId?: string,
  ) {
    const [firstUserId, secondUserId] = orderedUsers(
      originatorUserId,
      viewerUserId,
    );
    const [connection] = await transaction
      .select({ id: connections.id })
      .from(connections)
      .where(
        and(
          eq(connections.firstUserId, firstUserId),
          eq(connections.secondUserId, secondUserId),
        ),
      )
      .limit(1);
    if (!connection) return false;
    const [block] = await transaction
      .select({ blockerUserId: relationshipBlocks.blockerUserId })
      .from(relationshipBlocks)
      .where(
        or(
          and(
            eq(relationshipBlocks.blockerUserId, originatorUserId),
            eq(relationshipBlocks.blockedUserId, viewerUserId),
          ),
          and(
            eq(relationshipBlocks.blockerUserId, viewerUserId),
            eq(relationshipBlocks.blockedUserId, originatorUserId),
          ),
        ),
      )
      .limit(1);
    if (block) return false;
    const [character] = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, originatorUserId),
          eq(curatedPersons.linkedUserId, viewerUserId),
          eq(curatedPersons.placement, audience),
        ),
      )
      .limit(1);
    if (!character || careId === undefined) return character !== undefined;
    const [pass] = await transaction
      .select({ id: carePasses.id })
      .from(carePasses)
      .where(
        and(
          eq(carePasses.careId, careId),
          eq(carePasses.originatorUserId, originatorUserId),
          eq(carePasses.viewerUserId, viewerUserId),
          eq(carePasses.audience, audience),
        ),
      )
      .limit(1);
    return pass === undefined;
  }

  async function hasUnresolvedAudience(
    transaction: TransactionClient,
    careId: string,
    originatorUserId: string,
    audience: CareAudience,
  ) {
    const currentConnection = sql`exists (
      select 1 from ${connections}
      where ${connections.firstUserId} = least(${originatorUserId}, ${curatedPersons.linkedUserId})
        and ${connections.secondUserId} = greatest(${originatorUserId}, ${curatedPersons.linkedUserId})
    )`;
    const notBlocked = sql`not exists (
      select 1 from ${relationshipBlocks}
      where (${relationshipBlocks.blockerUserId} = ${originatorUserId} and ${relationshipBlocks.blockedUserId} = ${curatedPersons.linkedUserId})
         or (${relationshipBlocks.blockerUserId} = ${curatedPersons.linkedUserId} and ${relationshipBlocks.blockedUserId} = ${originatorUserId})
    )`;
    const [candidate] = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, originatorUserId),
          eq(curatedPersons.placement, audience),
          currentConnection,
          notBlocked,
          notExists(
            transaction
              .select({ id: carePasses.id })
              .from(carePasses)
              .where(
                and(
                  eq(carePasses.careId, careId),
                  eq(carePasses.originatorUserId, originatorUserId),
                  sql`${carePasses.viewerUserId} = ${curatedPersons.linkedUserId}`,
                  eq(carePasses.audience, audience),
                ),
              ),
          ),
        ),
      )
      .limit(1);
    return candidate !== undefined;
  }

  async function reconcileCare(
    transaction: TransactionClient,
    careId: string,
    now: Date,
  ) {
    const [care] = await transaction
      .select({
        originatorUserId: cares.originatorUserId,
        audience: cares.audience,
        status: cares.status,
        expiresAt: cares.expiresAt,
      })
      .from(cares)
      .where(eq(cares.id, careId))
      .limit(1);
    if (!care || care.status !== "open") return;
    if (care.expiresAt !== null && care.expiresAt <= now) {
      await transaction
        .update(cares)
        .set({ status: "expired", expiredAt: now })
        .where(and(eq(cares.id, careId), eq(cares.status, "open")));
      return;
    }
    if (
      await hasUnresolvedAudience(
        transaction,
        careId,
        care.originatorUserId,
        care.audience,
      )
    ) {
      return;
    }
    if (care.audience === "party") {
      const [demoted] = await transaction
        .update(cares)
        .set({ audience: "tribe" })
        .where(
          and(
            eq(cares.id, careId),
            eq(cares.status, "open"),
            eq(cares.audience, "party"),
          ),
        )
        .returning({ id: cares.id });
      if (demoted) return reconcileCare(transaction, careId, now);
    }
    await transaction
      .update(cares)
      .set({ status: "expired", expiredAt: now })
      .where(and(eq(cares.id, careId), eq(cares.status, "open")));
  }

  async function reconcileAll(transaction: TransactionClient, now: Date) {
    const openCares = await transaction
      .select({ id: cares.id })
      .from(cares)
      .where(eq(cares.status, "open"));
    for (const care of openCares) {
      await lockCare(transaction, care.id);
      await reconcileCare(transaction, care.id, now);
    }
  }

  async function listVisible(viewerUserId: string, now: Date) {
    return database.transaction(async (transaction) => {
      await reconcileAll(transaction, now);
      const originatorAccountPeople = alias(
        accountPeople,
        "care_originator_account_people",
      );
      const originatorProfiles = alias(
        personProfiles,
        "care_originator_profiles",
      );
      const participantAccountPeople = alias(
        accountPeople,
        "care_participant_account_people",
      );
      const participantProfiles = alias(
        personProfiles,
        "care_participant_profiles",
      );
      const rows = await transaction
        .select({
          id: cares.id,
          originatorUserId: cares.originatorUserId,
          participantUserId: cares.participantUserId,
          direction: cares.direction,
          category: cares.category,
          subtype: cares.subtype,
          days: cares.days,
          times: cares.times,
          timeNote: cares.timeNote,
          location: cares.location,
          requirements: cares.requirements,
          sensitivities: cares.sensitivities,
          audience: cares.audience,
          status: cares.status,
          claimedAt: cares.claimedAt,
          originatorCompletedAt: cares.originatorCompletedAt,
          participantCompletedAt: cares.participantCompletedAt,
          completedAt: cares.completedAt,
          expiresAt: cares.expiresAt,
          expiredAt: cares.expiredAt,
          notCompletedAt: cares.notCompletedAt,
          createdAt: cares.createdAt,
          gratitudeStatementId: careGratitudes.statementId,
          gratitudeMessage: careGratitudes.message,
          gratitudeCreatedAt: careGratitudes.createdAt,
          apologyStatementId: cares.withdrawalStatementId,
          apologyMessage: cares.withdrawalMessage,
          apologyCreatedAt: cares.notCompletedAt,
          originatorPersonId: originatorAccountPeople.personId,
          originatorDisplayName: originatorProfiles.displayName,
          participantPersonId: participantAccountPeople.personId,
          participantDisplayName: participantProfiles.displayName,
        })
        .from(cares)
        .innerJoin(
          originatorAccountPeople,
          eq(cares.originatorUserId, originatorAccountPeople.accountId),
        )
        .innerJoin(
          originatorProfiles,
          eq(originatorAccountPeople.personId, originatorProfiles.personId),
        )
        .leftJoin(
          participantAccountPeople,
          eq(cares.participantUserId, participantAccountPeople.accountId),
        )
        .leftJoin(
          participantProfiles,
          eq(participantAccountPeople.personId, participantProfiles.personId),
        )
        .leftJoin(careGratitudes, eq(cares.id, careGratitudes.careId))
        .where(
          or(
            eq(cares.originatorUserId, viewerUserId),
            and(
              currentCareConnection(viewerUserId),
              eq(cares.status, "open"),
              notExists(
                transaction
                  .select({ id: carePasses.id })
                  .from(carePasses)
                  .where(
                    and(
                      eq(carePasses.careId, cares.id),
                      eq(carePasses.originatorUserId, cares.originatorUserId),
                      eq(carePasses.viewerUserId, viewerUserId),
                      eq(carePasses.audience, cares.audience),
                    ),
                  ),
              ),
            ),
            and(
              eq(cares.participantUserId, viewerUserId),
              or(
                and(
                  eq(cares.status, "claimed"),
                  currentCareConnection(viewerUserId),
                ),
                or(
                  eq(cares.status, "orphaned"),
                  eq(cares.status, "completed"),
                  eq(cares.status, "not_completed"),
                ),
              ),
            ),
          ),
        )
        .orderBy(desc(cares.createdAt));

      return rows.map(
        (row): CareRecord => ({
          id: row.id,
          originatorUserId: row.originatorUserId,
          participantUserId: row.participantUserId,
          direction: row.direction,
          category: row.category,
          subtype: row.subtype,
          days: row.days,
          times: row.times,
          timeNote: row.timeNote,
          location: row.location,
          requirements: row.requirements,
          sensitivities: row.sensitivities,
          audience: row.audience,
          status: row.status,
          claimedAt: row.claimedAt,
          originatorCompletedAt: row.originatorCompletedAt,
          participantCompletedAt: row.participantCompletedAt,
          completedAt: row.completedAt,
          expiresAt: row.expiresAt,
          expiredAt: row.expiredAt,
          notCompletedAt: row.notCompletedAt,
          createdAt: row.createdAt,
          originator: {
            personId: row.originatorPersonId,
            displayName: row.originatorDisplayName,
          },
          participant:
            row.participantPersonId && row.participantDisplayName
              ? {
                  personId: row.participantPersonId,
                  displayName: row.participantDisplayName,
                }
              : null,
          gratitude:
            row.gratitudeStatementId &&
            row.gratitudeMessage !== null &&
            row.gratitudeCreatedAt
              ? {
                  statementId: row.gratitudeStatementId,
                  message: row.gratitudeMessage,
                  createdAt: row.gratitudeCreatedAt,
                }
              : null,
          apology:
            row.apologyStatementId &&
            row.apologyMessage !== null &&
            row.apologyCreatedAt
              ? {
                  statementId: row.apologyStatementId,
                  message: row.apologyMessage,
                  createdAt: row.apologyCreatedAt,
                }
              : null,
        }),
      );
    });
  }

  return {
    listVisible(viewerUserId: string, now = new Date()) {
      return listVisible(viewerUserId, now);
    },

    async create(input: {
      originatorUserId: string;
      direction: CareDirection;
      category?: CareCategoryId;
      subtype?: string;
      days?: CareDay[];
      times?: CareTime[];
      timeNote?: string;
      location?: string;
      requirements?: string;
      sensitivities?: string;
      expiresIn: CareExpiration;
      audience?: CareAudience;
      now: Date;
    }) {
      return database.transaction(async (transaction) => {
        const id = `care-${randomUUID()}`;
        const category = input.category ?? "food";
        const [created] = await transaction
          .insert(cares)
          .values({
            id,
            originatorUserId: input.originatorUserId,
            direction: input.direction,
            category,
            subtype: input.subtype?.trim() ?? "",
            days: input.days ?? [],
            times: input.times ?? [],
            timeNote: input.timeNote?.trim() ?? "",
            location: input.location?.trim() || "Not specified",
            requirements: input.requirements?.trim() ?? "",
            sensitivities: input.sensitivities?.trim() ?? "",
            audience: input.audience ?? "party",
            expiresAt: expiresAtFor(input.now, input.expiresIn),
            createdAt: input.now,
          })
          .returning({ id: cares.id });
        if (!created) throw new Error("Care creation did not return a record.");
        await lockCare(transaction, id);
        await reconcileCare(transaction, id, input.now);
        return created.id;
      });
    },

    async pass(input: {
      careId: string;
      viewerUserId: string;
      now: Date;
    }): Promise<CareRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [care] = await transaction
          .select({
            originatorUserId: cares.originatorUserId,
            audience: cares.audience,
            status: cares.status,
          })
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!care) return { ok: false, error: "care-not-found" };
        await lockCare(transaction, input.careId);
        await lockUsers(transaction, care.originatorUserId, input.viewerUserId);
        await reconcileCare(transaction, input.careId, input.now);
        const [current] = await transaction
          .select({
            originatorUserId: cares.originatorUserId,
            audience: cares.audience,
            status: cares.status,
          })
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!current) return { ok: false, error: "care-not-found" };
        if (current.status !== "open") {
          return { ok: false, error: "care-already-claimed" };
        }
        if (
          !(await canAccess(
            current.originatorUserId,
            input.viewerUserId,
            current.audience,
            transaction,
          ))
        ) {
          return { ok: false, error: "care-not-found" };
        }
        await transaction
          .insert(carePasses)
          .values({
            id: `care-pass-${randomUUID()}`,
            careId: input.careId,
            originatorUserId: current.originatorUserId,
            viewerUserId: input.viewerUserId,
            audience: current.audience,
            passedAt: input.now,
          })
          .onConflictDoNothing();
        await reconcileCare(transaction, input.careId, input.now);
        return { ok: true, value: null };
      });
    },

    async claim(input: {
      careId: string;
      participantUserId: string;
      now: Date;
    }): Promise<CareRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [care] = await transaction
          .select({
            originatorUserId: cares.originatorUserId,
            audience: cares.audience,
            status: cares.status,
          })
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!care) return { ok: false, error: "care-not-found" };
        await lockCare(transaction, input.careId);
        await lockUsers(
          transaction,
          care.originatorUserId,
          input.participantUserId,
        );
        await reconcileCare(transaction, input.careId, input.now);
        const [current] = await transaction
          .select({
            originatorUserId: cares.originatorUserId,
            audience: cares.audience,
            status: cares.status,
          })
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!current) return { ok: false, error: "care-not-found" };
        if (
          current.status !== "open" ||
          current.originatorUserId === input.participantUserId
        ) {
          return { ok: false, error: "care-already-claimed" };
        }
        if (
          !(await canAccess(
            current.originatorUserId,
            input.participantUserId,
            current.audience,
            transaction,
            input.careId,
          ))
        ) {
          return { ok: false, error: "care-not-found" };
        }
        const claimed = await transaction
          .update(cares)
          .set({
            status: "claimed",
            participantUserId: input.participantUserId,
            claimedAt: input.now,
          })
          .where(and(eq(cares.id, input.careId), eq(cares.status, "open")))
          .returning({ id: cares.id });
        return claimed.length === 1
          ? { ok: true, value: null }
          : { ok: false, error: "care-already-claimed" };
      });
    },

    async recordCompletion(input: {
      careId: string;
      participantUserId: string;
      now: Date;
    }): Promise<CareRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [found] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!found || found.status !== "claimed" || !found.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        await lockCare(transaction, input.careId);
        await lockUsers(
          transaction,
          found.originatorUserId,
          found.participantUserId,
        );
        const [care] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!care || care.status !== "claimed" || !care.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        const isOriginator = care.originatorUserId === input.participantUserId;
        const isParticipant =
          care.participantUserId === input.participantUserId;
        if (!isOriginator && !isParticipant) {
          return { ok: false, error: "care-not-found" };
        }
        const otherUserId = isOriginator
          ? care.participantUserId
          : care.originatorUserId;
        const requiresCurrentAccess =
          care.direction === "give" || isParticipant;
        if (
          requiresCurrentAccess &&
          !(await canAccess(
            care.originatorUserId,
            otherUserId,
            care.audience,
            transaction,
          ))
        ) {
          return { ok: false, error: "care-not-found" };
        }
        const completedAt =
          (isOriginator
            ? care.participantCompletedAt
            : care.originatorCompletedAt) !== null
            ? input.now
            : undefined;
        const updated = await transaction
          .update(cares)
          .set(
            isOriginator
              ? {
                  originatorCompletedAt: input.now,
                  ...(completedAt
                    ? { status: "completed" as const, completedAt }
                    : {}),
                }
              : {
                  participantCompletedAt: input.now,
                  ...(completedAt
                    ? { status: "completed" as const, completedAt }
                    : {}),
                },
          )
          .where(
            and(
              eq(cares.id, input.careId),
              eq(cares.status, "claimed"),
              isOriginator
                ? isNull(cares.originatorCompletedAt)
                : isNull(cares.participantCompletedAt),
            ),
          )
          .returning({ id: cares.id });
        return updated.length === 1
          ? { ok: true, value: null }
          : { ok: false, error: "care-not-found" };
      });
    },

    async withdraw(input: {
      careId: string;
      participantUserId: string;
      statementId: CareWithdrawalStatementId;
      message: string;
      now: Date;
    }): Promise<CareRepositoryResult<null>> {
      if (
        !withdrawalStatements.has(input.statementId) ||
        typeof input.message !== "string" ||
        input.message.length > 1_000
      ) {
        return { ok: false, error: "care-withdrawal-invalid" };
      }
      return database.transaction(async (transaction) => {
        const [found] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!found) {
          return { ok: false, error: "care-not-found" };
        }
        await lockCare(transaction, input.careId);

        const [care] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!care) {
          return { ok: false, error: "care-not-found" };
        }
        if (
          care.status === "open" &&
          care.participantUserId === null &&
          care.originatorUserId === input.participantUserId
        ) {
          const removed = await transaction
            .delete(cares)
            .where(and(eq(cares.id, input.careId), eq(cares.status, "open")))
            .returning({ id: cares.id });
          return removed.length === 1
            ? { ok: true, value: null }
            : { ok: false, error: "care-not-found" };
        }
        if (care.status !== "claimed" || !care.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        await lockUsers(
          transaction,
          care.originatorUserId,
          care.participantUserId,
        );
        const [current] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (
          !current ||
          current.status !== "claimed" ||
          !current.participantUserId
        ) {
          return { ok: false, error: "care-not-found" };
        }
        if (
          input.participantUserId !== current.originatorUserId &&
          input.participantUserId !== current.participantUserId
        ) {
          return { ok: false, error: "care-not-found" };
        }
        const otherUserId =
          input.participantUserId === current.originatorUserId
            ? current.participantUserId
            : current.originatorUserId;
        if (
          !(await canAccess(
            current.originatorUserId,
            otherUserId,
            current.audience,
            transaction,
          ))
        ) {
          return { ok: false, error: "care-not-found" };
        }
        const updated = await transaction
          .update(cares)
          .set({
            status: "not_completed",
            withdrawnByUserId: input.participantUserId,
            notCompletedAt: input.now,
            withdrawalStatementId: input.statementId,
            withdrawalMessage: input.message.trim(),
          })
          .where(and(eq(cares.id, input.careId), eq(cares.status, "claimed")))
          .returning({ id: cares.id });
        if (updated.length !== 1) return { ok: false, error: "care-not-found" };
        await transaction
          .delete(careGratitudes)
          .where(eq(careGratitudes.careId, input.careId));
        return { ok: true, value: null };
      });
    },

    async recordGratitude(input: {
      careId: string;
      receiverUserId: string;
      statementId: CareGratitudeStatementId;
      message: string;
      now: Date;
    }): Promise<CareRepositoryResult<null>> {
      if (
        !gratitudeStatements.has(input.statementId) ||
        typeof input.message !== "string" ||
        input.message.length > 1_000
      ) {
        return { ok: false, error: "care-gratitude-invalid" };
      }
      return database.transaction(async (transaction) => {
        const [found] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!found || !found.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        await lockCare(transaction, input.careId);
        const [care] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!care || !care.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        await lockUsers(
          transaction,
          care.originatorUserId,
          care.participantUserId,
        );
        const [current] = await transaction
          .select()
          .from(cares)
          .where(eq(cares.id, input.careId))
          .limit(1);
        if (!current || !current.participantUserId) {
          return { ok: false, error: "care-not-found" };
        }
        const receiverUserId =
          current.direction === "receive"
            ? current.originatorUserId
            : current.participantUserId;
        const giverUserId =
          current.direction === "receive"
            ? current.participantUserId
            : current.originatorUserId;
        const receiverCompletedAt =
          current.direction === "receive"
            ? current.originatorCompletedAt
            : current.participantCompletedAt;
        if (
          receiverUserId !== input.receiverUserId ||
          receiverCompletedAt === null ||
          (current.status !== "claimed" && current.status !== "completed")
        ) {
          return { ok: false, error: "care-not-found" };
        }
        const [existing] = await transaction
          .select({ id: careGratitudes.id })
          .from(careGratitudes)
          .where(eq(careGratitudes.careId, input.careId))
          .limit(1);
        if (existing) {
          return { ok: false, error: "care-gratitude-already-recorded" };
        }
        await transaction.insert(careGratitudes).values({
          id: `care-gratitude-${randomUUID()}`,
          careId: input.careId,
          receiverUserId,
          giverUserId,
          statementId: input.statementId,
          message: input.message,
          createdAt: input.now,
        });
        return { ok: true, value: null };
      });
    },
  };
}

export type CareRepository = ReturnType<typeof createCareRepository>;
