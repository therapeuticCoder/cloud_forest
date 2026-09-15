import { randomUUID } from "node:crypto";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  careRequests,
  connections,
  curatedPersons,
  personProfiles,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

export type CareRequestRepositoryError =
  | "care-request-not-found"
  | "care-request-already-claimed";

export type CareRequestRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CareRequestRepositoryError };

function orderedUsers(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? ([firstUserId, secondUserId] as const)
    : ([secondUserId, firstUserId] as const);
}

function eligiblePartyConnection(viewerUserId: string) {
  const currentConnection = sql`exists (
    select 1
    from ${connections}
    where ${connections.firstUserId} = least(${careRequests.requesterUserId}, ${viewerUserId})
      and ${connections.secondUserId} = greatest(${careRequests.requesterUserId}, ${viewerUserId})
  )`;
  const partyPlacement = sql`exists (
    select 1
    from ${curatedPersons}
    where ${curatedPersons.ownerUserId} = ${careRequests.requesterUserId}
      and ${curatedPersons.linkedUserId} = ${viewerUserId}
      and ${curatedPersons.placement} = 'party'
  )`;
  return and(currentConnection, partyPlacement);
}

type CareRequestRecord = {
  id: string;
  kind: "meal";
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
  audience: "party";
  status: "open" | "claimed" | "orphaned";
  claimantUserId: string | null;
  claimedAt: Date | null;
  createdAt: Date;
  requester: { personId: string; displayName: string };
  claimant: { personId: string; displayName: string } | null;
};

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

  async function listVisible(viewerUserId: string) {
    const requesterAccountPeople = alias(
      accountPeople,
      "care_requester_account_people",
    );
    const requesterProfiles = alias(personProfiles, "care_requester_profiles");
    const claimantAccountPeople = alias(
      accountPeople,
      "care_claimant_account_people",
    );
    const claimantProfiles = alias(personProfiles, "care_claimant_profiles");

    const rows = await database
      .select({
        id: careRequests.id,
        kind: careRequests.kind,
        helpfulWhen: careRequests.helpfulWhen,
        foodWorks: careRequests.foodWorks,
        foodDoesNotWork: careRequests.foodDoesNotWork,
        handoffStyle: careRequests.handoffStyle,
        audience: careRequests.audience,
        status: careRequests.status,
        claimantUserId: careRequests.claimantUserId,
        claimedAt: careRequests.claimedAt,
        createdAt: careRequests.createdAt,
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
      .where(
        or(
          eq(careRequests.requesterUserId, viewerUserId),
          and(
            eligiblePartyConnection(viewerUserId),
            or(
              eq(careRequests.status, "open"),
              and(
                eq(careRequests.status, "claimed"),
                eq(careRequests.claimantUserId, viewerUserId),
              ),
            ),
          ),
          and(
            eq(careRequests.status, "orphaned"),
            eq(careRequests.claimantUserId, viewerUserId),
          ),
        ),
      )
      .orderBy(desc(careRequests.createdAt));

    return rows.map(
      (row): CareRequestRecord => ({
        id: row.id,
        kind: "meal",
        helpfulWhen: row.helpfulWhen,
        foodWorks: row.foodWorks,
        foodDoesNotWork: row.foodDoesNotWork,
        handoffStyle: row.handoffStyle,
        audience: "party",
        status: row.status,
        claimantUserId: row.claimantUserId,
        claimedAt: row.claimedAt,
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
      }),
    );
  }

  async function canAccess(
    requesterUserId: string,
    viewerUserId: string,
    transaction: TransactionClient | DatabaseClient = database,
  ) {
    if (requesterUserId === viewerUserId) return true;
    const [firstUserId, secondUserId] = orderedUsers(
      requesterUserId,
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

    const [partyCharacter] = await transaction
      .select({ id: curatedPersons.id })
      .from(curatedPersons)
      .where(
        and(
          eq(curatedPersons.ownerUserId, requesterUserId),
          eq(curatedPersons.linkedUserId, viewerUserId),
          eq(curatedPersons.placement, "party"),
        ),
      )
      .limit(1);
    return partyCharacter !== undefined;
  }

  return {
    async listVisible(viewerUserId: string) {
      return listVisible(viewerUserId);
    },

    async create(input: {
      requesterUserId: string;
      helpfulWhen: string;
      foodWorks: string;
      foodDoesNotWork: string;
      handoffStyle: string;
      now: Date;
    }) {
      const [created] = await database
        .insert(careRequests)
        .values({
          id: `care-request-${randomUUID()}`,
          requesterUserId: input.requesterUserId,
          helpfulWhen: input.helpfulWhen,
          foodWorks: input.foodWorks,
          foodDoesNotWork: input.foodDoesNotWork,
          handoffStyle: input.handoffStyle,
          createdAt: input.now,
        })
        .returning({ id: careRequests.id });
      if (created === undefined)
        throw new Error("Care request creation did not return a record.");
      return created.id;
    },

    async claim(input: {
      careRequestId: string;
      claimantUserId: string;
      now: Date;
    }): Promise<CareRequestRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [request] = await transaction
          .select({
            requesterUserId: careRequests.requesterUserId,
            status: careRequests.status,
          })
          .from(careRequests)
          .where(eq(careRequests.id, input.careRequestId))
          .limit(1);
        if (request === undefined) {
          return { ok: false, error: "care-request-not-found" };
        }
        await lockUsers(
          transaction,
          request.requesterUserId,
          input.claimantUserId,
        );
        if (
          !(await canAccess(
            request.requesterUserId,
            input.claimantUserId,
            transaction,
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
  };
}

export type CareRequestRepository = ReturnType<
  typeof createCareRequestRepository
>;
