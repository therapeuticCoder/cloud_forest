import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  careOffers,
  careRequests,
  connections,
  curatedPersons,
  personProfiles,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

type CareOfferRecord = {
  id: string;
  kind: "meal";
  mealDescription: string;
  availableWhen: string;
  handoffStyle: string;
  audience: "party";
  status: "available";
  createdAt: Date;
  giver: { personId: string; displayName: string };
};

function eligiblePartyConnection(viewerUserId: string) {
  const currentConnection = sql`exists (
    select 1
    from ${connections}
    where ${connections.firstUserId} = least(${careOffers.giverUserId}, ${viewerUserId})
      and ${connections.secondUserId} = greatest(${careOffers.giverUserId}, ${viewerUserId})
  )`;
  const partyPlacement = sql`exists (
    select 1
    from ${curatedPersons}
    where ${curatedPersons.ownerUserId} = ${careOffers.giverUserId}
      and ${curatedPersons.linkedUserId} = ${viewerUserId}
      and ${curatedPersons.placement} = 'party'
  )`;
  return and(currentConnection, partyPlacement);
}

function orderedUsers(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? ([firstUserId, secondUserId] as const)
    : ([secondUserId, firstUserId] as const);
}

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

async function canClaim(
  transaction: TransactionClient,
  giverUserId: string,
  claimantUserId: string,
) {
  if (giverUserId === claimantUserId) return false;
  const [firstUserId, secondUserId] = orderedUsers(giverUserId, claimantUserId);
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
        eq(curatedPersons.ownerUserId, giverUserId),
        eq(curatedPersons.linkedUserId, claimantUserId),
        eq(curatedPersons.placement, "party"),
      ),
    )
    .limit(1);
  return partyCharacter !== undefined;
}

export type CareOfferRepositoryError =
  | "care-offer-not-found"
  | "care-offer-already-claimed";

export type CareOfferRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CareOfferRepositoryError };

export function createCareOfferRepository(database: DatabaseClient) {
  async function listVisible(viewerUserId: string) {
    const giverAccountPeople = alias(
      accountPeople,
      "care_giver_account_people",
    );
    const giverProfiles = alias(personProfiles, "care_giver_profiles");

    const rows = await database
      .select({
        id: careOffers.id,
        kind: careOffers.kind,
        mealDescription: careOffers.mealDescription,
        availableWhen: careOffers.availableWhen,
        handoffStyle: careOffers.handoffStyle,
        audience: careOffers.audience,
        status: careOffers.status,
        createdAt: careOffers.createdAt,
        giverPersonId: giverAccountPeople.personId,
        giverDisplayName: giverProfiles.displayName,
      })
      .from(careOffers)
      .innerJoin(
        giverAccountPeople,
        eq(careOffers.giverUserId, giverAccountPeople.accountId),
      )
      .innerJoin(
        giverProfiles,
        eq(giverAccountPeople.personId, giverProfiles.personId),
      )
      .where(
        and(
          eq(careOffers.status, "available"),
          sql`(
            ${careOffers.giverUserId} = ${viewerUserId}
            or ${eligiblePartyConnection(viewerUserId)}
          )`,
        ),
      )
      .orderBy(desc(careOffers.createdAt));

    return rows.map(
      (row): CareOfferRecord => ({
        id: row.id,
        kind: "meal",
        mealDescription: row.mealDescription,
        availableWhen: row.availableWhen,
        handoffStyle: row.handoffStyle,
        audience: "party",
        status: "available",
        createdAt: row.createdAt,
        giver: {
          personId: row.giverPersonId,
          displayName: row.giverDisplayName,
        },
      }),
    );
  }

  return {
    async listVisible(viewerUserId: string) {
      return listVisible(viewerUserId);
    },

    async create(input: {
      giverUserId: string;
      mealDescription: string;
      availableWhen: string;
      handoffStyle: string;
      now: Date;
    }) {
      const [created] = await database
        .insert(careOffers)
        .values({
          id: `care-offer-${randomUUID()}`,
          giverUserId: input.giverUserId,
          mealDescription: input.mealDescription,
          availableWhen: input.availableWhen,
          handoffStyle: input.handoffStyle,
          createdAt: input.now,
        })
        .returning({ id: careOffers.id });
      if (created === undefined)
        throw new Error("Care offer creation did not return a record.");
      return created.id;
    },

    async claim(input: {
      careOfferId: string;
      claimantUserId: string;
      now: Date;
    }): Promise<CareOfferRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [offer] = await transaction
          .select({ giverUserId: careOffers.giverUserId })
          .from(careOffers)
          .where(eq(careOffers.id, input.careOfferId))
          .limit(1);
        if (offer === undefined) {
          return { ok: false, error: "care-offer-not-found" };
        }

        await lockUsers(transaction, offer.giverUserId, input.claimantUserId);
        if (
          !(await canClaim(
            transaction,
            offer.giverUserId,
            input.claimantUserId,
          ))
        ) {
          return { ok: false, error: "care-offer-not-found" };
        }

        const [availableOffer] = await transaction
          .select({
            giverUserId: careOffers.giverUserId,
            mealDescription: careOffers.mealDescription,
            availableWhen: careOffers.availableWhen,
            handoffStyle: careOffers.handoffStyle,
            createdAt: careOffers.createdAt,
          })
          .from(careOffers)
          .where(
            and(
              eq(careOffers.id, input.careOfferId),
              eq(careOffers.status, "available"),
            ),
          )
          .limit(1);
        if (availableOffer === undefined) {
          return { ok: false, error: "care-offer-already-claimed" };
        }

        const deleted = await transaction
          .delete(careOffers)
          .where(
            and(
              eq(careOffers.id, input.careOfferId),
              eq(careOffers.status, "available"),
            ),
          )
          .returning({ id: careOffers.id });
        if (deleted.length !== 1) {
          return { ok: false, error: "care-offer-already-claimed" };
        }

        await transaction.insert(careRequests).values({
          id: `care-request-from-offer-${input.careOfferId}`,
          requesterUserId: input.claimantUserId,
          originatorUserId: availableOffer.giverUserId,
          claimantUserId: availableOffer.giverUserId,
          helpfulWhen: availableOffer.availableWhen,
          foodWorks: availableOffer.mealDescription,
          foodDoesNotWork: "",
          handoffStyle: availableOffer.handoffStyle,
          audience: "party",
          status: "claimed",
          claimedAt: input.now,
          createdAt: availableOffer.createdAt,
        });

        return { ok: true, value: null };
      });
    },

    async withdraw(input: {
      careOfferId: string;
      giverUserId: string;
    }): Promise<CareOfferRepositoryResult<null>> {
      const deleted = await database
        .delete(careOffers)
        .where(
          and(
            eq(careOffers.id, input.careOfferId),
            eq(careOffers.giverUserId, input.giverUserId),
          ),
        )
        .returning({ id: careOffers.id });
      return deleted.length === 1
        ? { ok: true, value: null }
        : { ok: false, error: "care-offer-not-found" };
    },
  };
}

export type CareOfferRepository = ReturnType<typeof createCareOfferRepository>;
