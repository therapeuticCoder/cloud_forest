import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  careGratitudes,
  careRequests,
  careRequestPasses,
  connections,
  curatedPersons,
  personProfiles,
  relationshipBlocks,
  type CareExpiration,
  type CareGratitudeStatementId,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

export type CareRequestRepositoryError =
  | "care-request-not-found"
  | "care-request-already-claimed"
  | "care-gratitude-invalid"
  | "care-gratitude-already-recorded";

export type CareRequestRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CareRequestRepositoryError };

function orderedUsers(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? ([firstUserId, secondUserId] as const)
    : ([secondUserId, firstUserId] as const);
}

function currentCareConnection(viewerUserId: string) {
  const currentConnection = sql`exists (
    select 1
    from ${connections}
    where ${connections.firstUserId} = least(${careRequests.originatorUserId}, ${viewerUserId})
      and ${connections.secondUserId} = greatest(${careRequests.originatorUserId}, ${viewerUserId})
  )`;
  const notBlocked = sql`not exists (
    select 1
    from ${relationshipBlocks}
    where (
      ${relationshipBlocks.blockerUserId} = ${careRequests.originatorUserId}
      and ${relationshipBlocks.blockedUserId} = ${viewerUserId}
    ) or (
      ${relationshipBlocks.blockerUserId} = ${viewerUserId}
      and ${relationshipBlocks.blockedUserId} = ${careRequests.originatorUserId}
    )
  )`;
  const currentPlacement = sql`exists (
    select 1
    from ${curatedPersons}
    where ${curatedPersons.ownerUserId} = ${careRequests.originatorUserId}
      and ${curatedPersons.linkedUserId} = ${viewerUserId}
      and ${curatedPersons.placement} = ${careRequests.audience}
  )`;
  return and(currentConnection, notBlocked, currentPlacement);
}

function eligibleCareConnection(viewerUserId: string) {
  return and(
    currentCareConnection(viewerUserId),
    sql`not exists (
      select 1
      from ${careRequestPasses}
      where ${careRequestPasses.careRequestId} = ${careRequests.id}
        and ${careRequestPasses.originatorUserId} = ${careRequests.originatorUserId}
        and ${careRequestPasses.viewerUserId} = ${viewerUserId}
        and ${careRequestPasses.audience} = ${careRequests.audience}
    )`,
  );
}

type CareRequestRecord = {
  id: string;
  originatorUserId?: string;
  requesterUserId?: string;
  kind: "meal";
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
  audience: "party" | "tribe";
  status: "open" | "claimed" | "orphaned" | "completed" | "expired";
  claimantUserId: string | null;
  claimedAt: Date | null;
  requesterCompletedAt: Date | null;
  claimantCompletedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  expiredAt: Date | null;
  createdAt: Date;
  requester: { personId: string; displayName: string };
  claimant: { personId: string; displayName: string } | null;
  gratitude: {
    statementId: CareGratitudeStatementId;
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

function expiresAtFor(now: Date, expiresIn: CareExpiration) {
  return new Date(now.getTime() + careExpirationMs[expiresIn]);
}

const careGratitudeStatementIds = new Set<CareGratitudeStatementId>([
  "meal-fed-when-needed",
  "meal-care-felt-easy",
  "meal-seen-and-supported",
]);

export function createCareRequestRepository(database: DatabaseClient) {
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

  async function lockCare(
    transaction: TransactionClient,
    careRequestId: string,
  ) {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`care-request:${careRequestId}`}))`,
    );
  }

  async function hasUnresolvedAudience(
    transaction: TransactionClient,
    input: {
      careRequestId: string;
      originatorUserId: string;
      audience: "party" | "tribe";
    },
  ) {
    const [candidate] = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, input.originatorUserId),
          eq(curatedPersons.placement, input.audience),
          sql`exists (
            select 1
            from ${connections}
            where (
              ${connections.firstUserId} = ${input.originatorUserId}
              and ${connections.secondUserId} = ${curatedPersons.linkedUserId}
            ) or (
              ${connections.firstUserId} = ${curatedPersons.linkedUserId}
              and ${connections.secondUserId} = ${input.originatorUserId}
            )
          )`,
          sql`not exists (
            select 1
            from ${relationshipBlocks}
            where (
              ${relationshipBlocks.blockerUserId} = ${input.originatorUserId}
              and ${relationshipBlocks.blockedUserId} = ${curatedPersons.linkedUserId}
            ) or (
              ${relationshipBlocks.blockerUserId} = ${curatedPersons.linkedUserId}
              and ${relationshipBlocks.blockedUserId} = ${input.originatorUserId}
            )
          )`,
          notExists(
            transaction
              .select({ id: careRequestPasses.id })
              .from(careRequestPasses)
              .where(
                and(
                  eq(careRequestPasses.careRequestId, input.careRequestId),
                  eq(
                    careRequestPasses.originatorUserId,
                    input.originatorUserId,
                  ),
                  sql`${careRequestPasses.viewerUserId} = ${curatedPersons.linkedUserId}`,
                  eq(careRequestPasses.audience, input.audience),
                ),
              ),
          ),
        ),
      )
      .limit(1);
    return candidate !== undefined;
  }

  async function reconcileRequest(
    transaction: TransactionClient,
    careRequestId: string,
    now: Date,
  ) {
    const [request] = await transaction
      .select({
        originatorUserId: careRequests.originatorUserId,
        audience: careRequests.audience,
        status: careRequests.status,
        expiresAt: careRequests.expiresAt,
      })
      .from(careRequests)
      .where(eq(careRequests.id, careRequestId))
      .limit(1);
    if (request === undefined || request.status !== "open") return;
    if (request.expiresAt !== null && request.expiresAt <= now) {
      await transaction
        .update(careRequests)
        .set({ status: "expired", expiredAt: now })
        .where(
          and(
            eq(careRequests.id, careRequestId),
            eq(careRequests.status, "open"),
          ),
        );
      return;
    }
    if (
      await hasUnresolvedAudience(transaction, {
        careRequestId,
        originatorUserId: request.originatorUserId,
        audience: request.audience,
      })
    ) {
      return;
    }

    if (request.audience === "party") {
      const [demoted] = await transaction
        .update(careRequests)
        .set({ audience: "tribe" })
        .where(
          and(
            eq(careRequests.id, careRequestId),
            eq(careRequests.status, "open"),
            eq(careRequests.audience, "party"),
          ),
        )
        .returning({ id: careRequests.id });
      if (demoted !== undefined) {
        await reconcileRequest(transaction, careRequestId, now);
        return;
      }
    }

    await transaction
      .update(careRequests)
      .set({ status: "expired", expiredAt: now })
      .where(
        and(
          eq(careRequests.id, careRequestId),
          eq(careRequests.status, "open"),
        ),
      );
  }

  async function reconcileAllRequests(
    transaction: TransactionClient,
    now: Date,
  ) {
    const openRequests = await transaction
      .select({ id: careRequests.id })
      .from(careRequests)
      .where(eq(careRequests.status, "open"));
    for (const request of openRequests) {
      await lockCare(transaction, request.id);
      await reconcileRequest(transaction, request.id, now);
    }
  }

  async function listVisible(viewerUserId: string, now: Date) {
    return database.transaction(async (transaction) => {
      await reconcileAllRequests(transaction, now);
      const requesterAccountPeople = alias(
        accountPeople,
        "care_requester_account_people",
      );
      const requesterProfiles = alias(
        personProfiles,
        "care_requester_profiles",
      );
      const claimantAccountPeople = alias(
        accountPeople,
        "care_claimant_account_people",
      );
      const claimantProfiles = alias(personProfiles, "care_claimant_profiles");

      const rows = await transaction
        .select({
          id: careRequests.id,
          originatorUserId: careRequests.originatorUserId,
          requesterUserId: careRequests.requesterUserId,
          kind: careRequests.kind,
          helpfulWhen: careRequests.helpfulWhen,
          foodWorks: careRequests.foodWorks,
          foodDoesNotWork: careRequests.foodDoesNotWork,
          handoffStyle: careRequests.handoffStyle,
          audience: careRequests.audience,
          status: careRequests.status,
          claimantUserId: careRequests.claimantUserId,
          claimedAt: careRequests.claimedAt,
          requesterCompletedAt: careRequests.requesterCompletedAt,
          claimantCompletedAt: careRequests.claimantCompletedAt,
          completedAt: careRequests.completedAt,
          expiresAt: careRequests.expiresAt,
          expiredAt: careRequests.expiredAt,
          createdAt: careRequests.createdAt,
          gratitudeStatementId: careGratitudes.statementId,
          gratitudeMessage: careGratitudes.message,
          gratitudeCreatedAt: careGratitudes.createdAt,
          requesterPersonId: requesterAccountPeople.personId,
          requesterDisplayName: requesterProfiles.displayName,
          claimantPersonId: claimantAccountPeople.personId,
          claimantDisplayName: claimantProfiles.displayName,
        })
        .from(careRequests)
        .innerJoin(
          requesterAccountPeople,
          eq(careRequests.requesterUserId, requesterAccountPeople.accountId),
        )
        .innerJoin(
          requesterProfiles,
          eq(requesterAccountPeople.personId, requesterProfiles.personId),
        )
        .leftJoin(
          claimantAccountPeople,
          eq(careRequests.claimantUserId, claimantAccountPeople.accountId),
        )
        .leftJoin(
          claimantProfiles,
          eq(claimantAccountPeople.personId, claimantProfiles.personId),
        )
        .leftJoin(
          careGratitudes,
          eq(careRequests.id, careGratitudes.careRequestId),
        )
        .where(
          or(
            eq(careRequests.requesterUserId, viewerUserId),
            eq(careRequests.originatorUserId, viewerUserId),
            and(
              eligibleCareConnection(viewerUserId),
              eq(careRequests.status, "open"),
            ),
            and(
              currentCareConnection(viewerUserId),
              eq(careRequests.status, "claimed"),
              eq(careRequests.claimantUserId, viewerUserId),
            ),
            and(
              or(
                eq(careRequests.status, "orphaned"),
                eq(careRequests.status, "completed"),
              ),
              eq(careRequests.claimantUserId, viewerUserId),
            ),
          ),
        )
        .orderBy(desc(careRequests.createdAt));

      return rows.map(
        (row): CareRequestRecord => ({
          id: row.id,
          originatorUserId: row.originatorUserId,
          requesterUserId: row.requesterUserId,
          kind: "meal",
          helpfulWhen: row.helpfulWhen,
          foodWorks: row.foodWorks,
          foodDoesNotWork: row.foodDoesNotWork,
          handoffStyle: row.handoffStyle,
          audience: row.audience,
          status: row.status,
          claimantUserId: row.claimantUserId,
          claimedAt: row.claimedAt,
          requesterCompletedAt: row.requesterCompletedAt,
          claimantCompletedAt: row.claimantCompletedAt,
          completedAt: row.completedAt,
          expiresAt: row.expiresAt,
          expiredAt: row.expiredAt,
          createdAt: row.createdAt,
          requester: {
            personId: row.requesterPersonId,
            displayName: row.requesterDisplayName,
          },
          claimant:
            row.claimantPersonId !== null && row.claimantDisplayName !== null
              ? {
                  personId: row.claimantPersonId,
                  displayName: row.claimantDisplayName,
                }
              : null,
          gratitude:
            row.gratitudeStatementId !== null &&
            row.gratitudeMessage !== null &&
            row.gratitudeCreatedAt !== null
              ? {
                  statementId: row.gratitudeStatementId,
                  message: row.gratitudeMessage,
                  createdAt: row.gratitudeCreatedAt,
                }
              : null,
        }),
      );
    });
  }

  async function canAccess(
    originatorUserId: string,
    viewerUserId: string,
    audience: "party" | "tribe",
    transaction: TransactionClient | DatabaseClient = database,
    careRequestId?: string,
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
    if (connection === undefined) return false;

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
    if (block !== undefined) return false;

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
    if (character === undefined) return false;
    if (careRequestId === undefined) return true;

    const [pass] = await transaction
      .select({ id: careRequestPasses.id })
      .from(careRequestPasses)
      .where(
        and(
          eq(careRequestPasses.careRequestId, careRequestId),
          eq(careRequestPasses.originatorUserId, originatorUserId),
          eq(careRequestPasses.viewerUserId, viewerUserId),
          eq(careRequestPasses.audience, audience),
        ),
      )
      .limit(1);
    return pass === undefined;
  }

  return {
    async listVisible(viewerUserId: string, now = new Date()) {
      return listVisible(viewerUserId, now);
    },

    async create(input: {
      requesterUserId: string;
      helpfulWhen: string;
      foodWorks: string;
      foodDoesNotWork: string;
      handoffStyle: string;
      expiresIn: CareExpiration;
      audience?: "party" | "tribe";
      now: Date;
    }) {
      return database.transaction(async (transaction) => {
        const id = `care-request-${randomUUID()}`;
        const [created] = await transaction
          .insert(careRequests)
          .values({
            id,
            requesterUserId: input.requesterUserId,
            originatorUserId: input.requesterUserId,
            helpfulWhen: input.helpfulWhen,
            foodWorks: input.foodWorks,
            foodDoesNotWork: input.foodDoesNotWork,
            handoffStyle: input.handoffStyle,
            audience: input.audience ?? "party",
            expiresAt: expiresAtFor(input.now, input.expiresIn),
            createdAt: input.now,
          })
          .returning({ id: careRequests.id });
        if (created === undefined)
          throw new Error("Care request creation did not return a record.");
        await lockCare(transaction, id);
        await reconcileRequest(transaction, id, input.now);
        return created.id;
      });
    },

    async pass(input: {
      careRequestId: string;
      viewerUserId: string;
      now: Date;
    }): Promise<CareRequestRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [request] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            originatorUserId: careRequests.originatorUserId,
            audience: careRequests.audience,
            status: careRequests.status,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (request === undefined) {
          return { ok: false, error: "care-request-not-found" };
        }
        await lockCare(transaction, input.careRequestId);
        await lockUsers(
          transaction,
          request.originatorUserId,
          input.viewerUserId,
        );
        await reconcileRequest(transaction, input.careRequestId, input.now);
        const [currentRequest] = await transaction
          .select({
            originatorUserId: careRequests.originatorUserId,
            audience: careRequests.audience,
            status: careRequests.status,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (currentRequest === undefined || currentRequest.status !== "open") {
          return { ok: false, error: "care-request-already-claimed" };
        }
        if (
          !(await canAccess(
            currentRequest.originatorUserId,
            input.viewerUserId,
            currentRequest.audience,
            transaction,
          ))
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        await transaction
          .insert(careRequestPasses)
          .values({
            id: `care-request-pass-${randomUUID()}`,
            careRequestId: input.careRequestId,
            originatorUserId: currentRequest.originatorUserId,
            viewerUserId: input.viewerUserId,
            audience: currentRequest.audience,
            passedAt: input.now,
          })
          .onConflictDoNothing();
        await reconcileRequest(transaction, input.careRequestId, input.now);
        return { ok: true, value: null };
      });
    },

    async claim(input: {
      careRequestId: string;
      claimantUserId: string;
      now: Date;
    }): Promise<CareRequestRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [foundRequest] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            originatorUserId: careRequests.originatorUserId,
            audience: careRequests.audience,
            status: careRequests.status,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (foundRequest === undefined) {
          return { ok: false, error: "care-request-not-found" };
        }
        await lockCare(transaction, input.careRequestId);
        await lockUsers(
          transaction,
          foundRequest.requesterUserId,
          input.claimantUserId,
        );
        await reconcileRequest(transaction, input.careRequestId, input.now);
        const [request] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            originatorUserId: careRequests.originatorUserId,
            audience: careRequests.audience,
            status: careRequests.status,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (request === undefined) {
          return { ok: false, error: "care-request-not-found" };
        }
        if (
          !(await canAccess(
            request.originatorUserId,
            input.claimantUserId,
            request.audience,
            transaction,
            input.careRequestId,
          )) ||
          request.requesterUserId === input.claimantUserId
        ) {
          return { ok: false, error: "care-request-not-found" };
        }
        if (request.status !== "open") {
          return { ok: false, error: "care-request-already-claimed" };
        }

        const claimed = await transaction
          .update(careRequests)
          .set({
            status: "claimed",
            claimantUserId: input.claimantUserId,
            claimedAt: input.now,
          })
          .where(
            and(
              eq(careRequests.id, input.careRequestId),
              eq(careRequests.status, "open"),
            ),
          )
          .returning({ id: careRequests.id });
        return claimed.length === 1
          ? { ok: true, value: null }
          : { ok: false, error: "care-request-already-claimed" };
      });
    },

    async recordCompletion(input: {
      careRequestId: string;
      participantUserId: string;
      now: Date;
    }): Promise<CareRequestRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [foundRequest] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            originatorUserId: careRequests.originatorUserId,
            claimantUserId: careRequests.claimantUserId,
            audience: careRequests.audience,
            status: careRequests.status,
            requesterCompletedAt: careRequests.requesterCompletedAt,
            claimantCompletedAt: careRequests.claimantCompletedAt,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (
          foundRequest === undefined ||
          foundRequest.status !== "claimed" ||
          foundRequest.claimantUserId === null
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        await lockCare(transaction, input.careRequestId);
        await lockUsers(
          transaction,
          foundRequest.requesterUserId,
          foundRequest.claimantUserId,
        );

        const [request] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            originatorUserId: careRequests.originatorUserId,
            claimantUserId: careRequests.claimantUserId,
            audience: careRequests.audience,
            status: careRequests.status,
            requesterCompletedAt: careRequests.requesterCompletedAt,
            claimantCompletedAt: careRequests.claimantCompletedAt,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (
          request === undefined ||
          request.status !== "claimed" ||
          request.claimantUserId === null
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        const isRequester = request.requesterUserId === input.participantUserId;
        const isClaimant = request.claimantUserId === input.participantUserId;
        if (!isRequester && !isClaimant) {
          return { ok: false, error: "care-request-not-found" };
        }
        const otherParticipantUserId =
          request.originatorUserId === request.requesterUserId
            ? request.claimantUserId
            : request.requesterUserId;
        const needsCurrentOriginatorAccess =
          isClaimant || request.originatorUserId !== request.requesterUserId;
        if (
          needsCurrentOriginatorAccess &&
          !(await canAccess(
            request.originatorUserId,
            otherParticipantUserId,
            request.audience,
            transaction,
          ))
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        if (isRequester) {
          if (request.requesterCompletedAt !== null) {
            return { ok: false, error: "care-request-not-found" };
          }
          const completed = request.claimantCompletedAt !== null;
          const updated = await transaction
            .update(careRequests)
            .set({
              requesterCompletedAt: input.now,
              ...(completed
                ? { status: "completed" as const, completedAt: input.now }
                : {}),
            })
            .where(
              and(
                eq(careRequests.id, input.careRequestId),
                eq(careRequests.status, "claimed"),
                isNull(careRequests.requesterCompletedAt),
              ),
            )
            .returning({ id: careRequests.id });
          return updated.length === 1
            ? { ok: true, value: null }
            : { ok: false, error: "care-request-not-found" };
        }

        if (request.claimantCompletedAt !== null) {
          return { ok: false, error: "care-request-not-found" };
        }
        const completed = request.requesterCompletedAt !== null;
        const updated = await transaction
          .update(careRequests)
          .set({
            claimantCompletedAt: input.now,
            ...(completed
              ? { status: "completed" as const, completedAt: input.now }
              : {}),
          })
          .where(
            and(
              eq(careRequests.id, input.careRequestId),
              eq(careRequests.status, "claimed"),
              isNull(careRequests.claimantCompletedAt),
            ),
          )
          .returning({ id: careRequests.id });
        return updated.length === 1
          ? { ok: true, value: null }
          : { ok: false, error: "care-request-not-found" };
      });
    },

    async recordGratitude(input: {
      careRequestId: string;
      receiverUserId: string;
      statementId: CareGratitudeStatementId;
      message: string;
      now: Date;
    }): Promise<CareRequestRepositoryResult<null>> {
      if (
        !careGratitudeStatementIds.has(input.statementId) ||
        typeof input.message !== "string" ||
        input.message.length > 1_000
      ) {
        return { ok: false, error: "care-gratitude-invalid" };
      }

      return database.transaction(async (transaction) => {
        const [request] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            claimantUserId: careRequests.claimantUserId,
            status: careRequests.status,
            requesterCompletedAt: careRequests.requesterCompletedAt,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (
          request === undefined ||
          request.claimantUserId === null ||
          request.requesterUserId !== input.receiverUserId ||
          (request.status !== "claimed" && request.status !== "completed") ||
          request.requesterCompletedAt === null
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        await lockUsers(
          transaction,
          request.requesterUserId,
          request.claimantUserId,
        );

        const [currentRequest] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            claimantUserId: careRequests.claimantUserId,
            status: careRequests.status,
            requesterCompletedAt: careRequests.requesterCompletedAt,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (
          currentRequest === undefined ||
          currentRequest.claimantUserId === null ||
          currentRequest.requesterUserId !== input.receiverUserId ||
          (currentRequest.status !== "claimed" &&
            currentRequest.status !== "completed") ||
          currentRequest.requesterCompletedAt === null
        ) {
          return { ok: false, error: "care-request-not-found" };
        }

        const [existingGratitude] = await transaction
          .select({ id: careGratitudes.id })
          .from(careGratitudes)
          .where(eq(careGratitudes.careRequestId, input.careRequestId))
          .limit(1);
        if (existingGratitude !== undefined) {
          return { ok: false, error: "care-gratitude-already-recorded" };
        }

        await transaction.insert(careGratitudes).values({
          id: `care-gratitude-${randomUUID()}`,
          careRequestId: input.careRequestId,
          receiverUserId: currentRequest.requesterUserId,
          giverUserId: currentRequest.claimantUserId,
          statementId: input.statementId,
          message: input.message,
          createdAt: input.now,
        });
        return { ok: true, value: null };
      });
    },
  };
}

export type CareRequestRepository = ReturnType<
  typeof createCareRequestRepository
>;
