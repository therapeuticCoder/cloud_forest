import { randomUUID } from "node:crypto";
import { and, desc, eq, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  getCareCategory,
  type CareCategoryId,
  type CareDay,
  type CareTime,
} from "@cloud-forest/domain";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  careOffers,
  careOfferPasses,
  careRequests,
  connections,
  curatedPersons,
  personProfiles,
  relationshipBlocks,
  type CareExpiration,
} from "./schema.ts";

type TransactionClient = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

type CareOfferRecord = {
  id: string;
  kind: "meal";
  category: CareCategoryId;
  subtype: string;
  days: CareDay[];
  times: CareTime[];
  timeNote: string;
  location: string;
  requirements: string;
  sensitivities: string;
  mealDescription: string;
  availableWhen: string;
  handoffStyle: string;
  audience: "party" | "tribe";
  status: "available" | "expired";
  createdAt: Date;
  expiresAt: Date | null;
  expiredAt: Date | null;
  giver: { personId: string; displayName: string };
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

function currentCareConnection(viewerUserId: string) {
  const currentConnection = sql`exists (
    select 1
    from ${connections}
    where ${connections.firstUserId} = least(${careOffers.giverUserId}, ${viewerUserId})
      and ${connections.secondUserId} = greatest(${careOffers.giverUserId}, ${viewerUserId})
  )`;
  const notBlocked = sql`not exists (
    select 1
    from ${relationshipBlocks}
    where (
      ${relationshipBlocks.blockerUserId} = ${careOffers.giverUserId}
      and ${relationshipBlocks.blockedUserId} = ${viewerUserId}
    ) or (
      ${relationshipBlocks.blockerUserId} = ${viewerUserId}
      and ${relationshipBlocks.blockedUserId} = ${careOffers.giverUserId}
    )
  )`;
  const currentPlacement = sql`exists (
    select 1
    from ${curatedPersons}
    where ${curatedPersons.ownerUserId} = ${careOffers.giverUserId}
      and ${curatedPersons.linkedUserId} = ${viewerUserId}
      and ${curatedPersons.placement} = ${careOffers.audience}
  )`;
  return and(currentConnection, notBlocked, currentPlacement);
}

function eligibleCareConnection(viewerUserId: string) {
  return and(
    currentCareConnection(viewerUserId),
    sql`not exists (
      select 1
      from ${careOfferPasses}
      where ${careOfferPasses.careOfferId} = ${careOffers.id}
        and ${careOfferPasses.originatorUserId} = ${careOffers.giverUserId}
        and ${careOfferPasses.viewerUserId} = ${viewerUserId}
        and ${careOfferPasses.audience} = ${careOffers.audience}
    )`,
  );
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

async function lockCare(transaction: TransactionClient, careOfferId: string) {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(hashtext(${`care-offer:${careOfferId}`}))`,
  );
}

async function canClaim(
  transaction: TransactionClient,
  giverUserId: string,
  claimantUserId: string,
  audience: "party" | "tribe",
  careOfferId?: string,
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

  const [block] = await transaction
    .select({ blockerUserId: relationshipBlocks.blockerUserId })
    .from(relationshipBlocks)
    .where(
      or(
        and(
          eq(relationshipBlocks.blockerUserId, giverUserId),
          eq(relationshipBlocks.blockedUserId, claimantUserId),
        ),
        and(
          eq(relationshipBlocks.blockerUserId, claimantUserId),
          eq(relationshipBlocks.blockedUserId, giverUserId),
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
        eq(curatedPersons.ownerUserId, giverUserId),
        eq(curatedPersons.linkedUserId, claimantUserId),
        eq(curatedPersons.placement, audience),
      ),
    )
    .limit(1);
  if (character === undefined) return false;
  if (careOfferId === undefined) return true;

  const [pass] = await transaction
    .select({ id: careOfferPasses.id })
    .from(careOfferPasses)
    .where(
      and(
        eq(careOfferPasses.careOfferId, careOfferId),
        eq(careOfferPasses.originatorUserId, giverUserId),
        eq(careOfferPasses.viewerUserId, claimantUserId),
        eq(careOfferPasses.audience, audience),
      ),
    )
    .limit(1);
  return pass === undefined;
}

async function hasUnresolvedAudience(
  transaction: TransactionClient,
  input: {
    careOfferId: string;
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
            .select({ id: careOfferPasses.id })
            .from(careOfferPasses)
            .where(
              and(
                eq(careOfferPasses.careOfferId, input.careOfferId),
                eq(careOfferPasses.originatorUserId, input.originatorUserId),
                sql`${careOfferPasses.viewerUserId} = ${curatedPersons.linkedUserId}`,
                eq(careOfferPasses.audience, input.audience),
              ),
            ),
        ),
      ),
    )
    .limit(1);
  return candidate !== undefined;
}

async function reconcileOffer(
  transaction: TransactionClient,
  careOfferId: string,
  now: Date,
) {
  const [offer] = await transaction
    .select({
      giverUserId: careOffers.giverUserId,
      audience: careOffers.audience,
      status: careOffers.status,
      expiresAt: careOffers.expiresAt,
    })
    .from(careOffers)
    .where(eq(careOffers.id, careOfferId))
    .limit(1);
  if (offer === undefined || offer.status !== "available") return;
  if (offer.expiresAt !== null && offer.expiresAt <= now) {
    await transaction
      .update(careOffers)
      .set({ status: "expired", expiredAt: now })
      .where(
        and(eq(careOffers.id, careOfferId), eq(careOffers.status, "available")),
      );
    return;
  }
  if (
    await hasUnresolvedAudience(transaction, {
      careOfferId,
      originatorUserId: offer.giverUserId,
      audience: offer.audience,
    })
  ) {
    return;
  }

  if (offer.audience === "party") {
    const [demoted] = await transaction
      .update(careOffers)
      .set({ audience: "tribe" })
      .where(
        and(
          eq(careOffers.id, careOfferId),
          eq(careOffers.status, "available"),
          eq(careOffers.audience, "party"),
        ),
      )
      .returning({ id: careOffers.id });
    if (demoted !== undefined) {
      await reconcileOffer(transaction, careOfferId, now);
      return;
    }
  }

  await transaction
    .update(careOffers)
    .set({ status: "expired", expiredAt: now })
    .where(
      and(eq(careOffers.id, careOfferId), eq(careOffers.status, "available")),
    );
}

async function reconcileAllOffers(transaction: TransactionClient, now: Date) {
  const availableOffers = await transaction
    .select({ id: careOffers.id })
    .from(careOffers)
    .where(eq(careOffers.status, "available"));
  for (const offer of availableOffers) {
    await lockCare(transaction, offer.id);
    await reconcileOffer(transaction, offer.id, now);
  }
}

export type CareOfferRepositoryError =
  | "care-offer-not-found"
  | "care-offer-already-claimed";

export type CareOfferRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CareOfferRepositoryError };

export function createCareOfferRepository(database: DatabaseClient) {
  async function listVisible(viewerUserId: string, now: Date) {
    return database.transaction(async (transaction) => {
      await reconcileAllOffers(transaction, now);
      const giverAccountPeople = alias(
        accountPeople,
        "care_giver_account_people",
      );
      const giverProfiles = alias(personProfiles, "care_giver_profiles");

      const rows = await transaction
        .select({
          id: careOffers.id,
          kind: careOffers.kind,
          category: careOffers.category,
          subtype: careOffers.subtype,
          days: careOffers.days,
          times: careOffers.times,
          timeNote: careOffers.timeNote,
          location: careOffers.location,
          requirements: careOffers.requirements,
          sensitivities: careOffers.sensitivities,
          mealDescription: careOffers.mealDescription,
          availableWhen: careOffers.availableWhen,
          handoffStyle: careOffers.handoffStyle,
          audience: careOffers.audience,
          status: careOffers.status,
          expiresAt: careOffers.expiresAt,
          expiredAt: careOffers.expiredAt,
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
          or(
            eq(careOffers.giverUserId, viewerUserId),
            and(
              eq(careOffers.status, "available"),
              eligibleCareConnection(viewerUserId),
            ),
          ),
        )
        .orderBy(desc(careOffers.createdAt));

      return rows.map(
        (row): CareOfferRecord => ({
          id: row.id,
          kind: "meal",
          category: row.category,
          subtype: row.subtype,
          days: row.days,
          times: row.times,
          timeNote: row.timeNote,
          location: row.location,
          requirements: row.requirements,
          sensitivities: row.sensitivities,
          mealDescription: row.mealDescription,
          availableWhen: row.availableWhen,
          handoffStyle: row.handoffStyle,
          audience: row.audience,
          status: row.status,
          expiresAt: row.expiresAt,
          expiredAt: row.expiredAt,
          createdAt: row.createdAt,
          giver: {
            personId: row.giverPersonId,
            displayName: row.giverDisplayName,
          },
        }),
      );
    });
  }

  return {
    async listVisible(viewerUserId: string, now = new Date()) {
      return listVisible(viewerUserId, now);
    },

    async create(input: {
      giverUserId: string;
      category?: CareCategoryId;
      subtype?: string;
      days?: CareDay[];
      times?: CareTime[];
      timeNote?: string;
      location?: string;
      requirements?: string;
      sensitivities?: string;
      mealDescription?: string;
      availableWhen?: string;
      handoffStyle?: string;
      expiresIn: CareExpiration;
      audience?: "party" | "tribe";
      now: Date;
    }) {
      return database.transaction(async (transaction) => {
        const id = `care-offer-${randomUUID()}`;
        const category = input.category ?? "food";
        const subtype = input.subtype?.trim() ?? "";
        const days = input.days ?? [];
        const times = input.times ?? [];
        const timeNote = input.timeNote?.trim() ?? "";
        const availableWhen =
          input.availableWhen?.trim() || timeNote || "Flexible";
        const location =
          input.location?.trim() ||
          input.handoffStyle?.trim() ||
          "Not specified";
        const requirements =
          input.requirements?.trim() ?? input.mealDescription?.trim() ?? "";
        const sensitivities = input.sensitivities?.trim() ?? "";
        const categoryDescription = getCareCategory(category)?.name ?? "Care";
        const mealDescription =
          input.mealDescription?.trim() ||
          requirements ||
          subtype ||
          categoryDescription;
        const handoffStyle = input.handoffStyle?.trim() || location;
        const [created] = await transaction
          .insert(careOffers)
          .values({
            id,
            giverUserId: input.giverUserId,
            category,
            subtype,
            days,
            times,
            timeNote,
            location,
            requirements,
            sensitivities,
            mealDescription,
            availableWhen,
            handoffStyle,
            audience: input.audience ?? "party",
            expiresAt: expiresAtFor(input.now, input.expiresIn),
            createdAt: input.now,
          })
          .returning({ id: careOffers.id });
        if (created === undefined)
          throw new Error("Care offer creation did not return a record.");
        await lockCare(transaction, id);
        await reconcileOffer(transaction, id, input.now);
        return created.id;
      });
    },

    async pass(input: {
      careOfferId: string;
      viewerUserId: string;
      now: Date;
    }): Promise<CareOfferRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [offer] = await transaction
          .select({
            giverUserId: careOffers.giverUserId,
            audience: careOffers.audience,
            status: careOffers.status,
          })
          .from(careOffers)
          .where(eq(careOffers.id, input.careOfferId))
          .limit(1);
        if (offer === undefined) {
          return { ok: false, error: "care-offer-not-found" };
        }
        await lockCare(transaction, input.careOfferId);
        await lockUsers(transaction, offer.giverUserId, input.viewerUserId);
        await reconcileOffer(transaction, input.careOfferId, input.now);
        const [currentOffer] = await transaction
          .select({
            giverUserId: careOffers.giverUserId,
            audience: careOffers.audience,
            status: careOffers.status,
          })
          .from(careOffers)
          .where(eq(careOffers.id, input.careOfferId))
          .limit(1);
        if (currentOffer === undefined || currentOffer.status !== "available") {
          return { ok: false, error: "care-offer-already-claimed" };
        }
        if (
          !(await canClaim(
            transaction,
            currentOffer.giverUserId,
            input.viewerUserId,
            currentOffer.audience,
          ))
        ) {
          return { ok: false, error: "care-offer-not-found" };
        }

        await transaction
          .insert(careOfferPasses)
          .values({
            id: `care-offer-pass-${randomUUID()}`,
            careOfferId: input.careOfferId,
            originatorUserId: currentOffer.giverUserId,
            viewerUserId: input.viewerUserId,
            audience: currentOffer.audience,
            passedAt: input.now,
          })
          .onConflictDoNothing();
        await reconcileOffer(transaction, input.careOfferId, input.now);
        return { ok: true, value: null };
      });
    },

    async claim(input: {
      careOfferId: string;
      claimantUserId: string;
      now: Date;
    }): Promise<CareOfferRepositoryResult<null>> {
      return database.transaction(async (transaction) => {
        const [offer] = await transaction
          .select({
            giverUserId: careOffers.giverUserId,
            audience: careOffers.audience,
          })
          .from(careOffers)
          .where(eq(careOffers.id, input.careOfferId))
          .limit(1);
        if (offer === undefined) {
          return { ok: false, error: "care-offer-not-found" };
        }

        await lockCare(transaction, input.careOfferId);
        await lockUsers(transaction, offer.giverUserId, input.claimantUserId);
        await reconcileOffer(transaction, input.careOfferId, input.now);

        const [availableOffer] = await transaction
          .select({
            giverUserId: careOffers.giverUserId,
            audience: careOffers.audience,
            category: careOffers.category,
            subtype: careOffers.subtype,
            days: careOffers.days,
            times: careOffers.times,
            timeNote: careOffers.timeNote,
            location: careOffers.location,
            requirements: careOffers.requirements,
            sensitivities: careOffers.sensitivities,
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
        if (
          !(await canClaim(
            transaction,
            availableOffer.giverUserId,
            input.claimantUserId,
            availableOffer.audience,
            input.careOfferId,
          ))
        ) {
          return { ok: false, error: "care-offer-not-found" };
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
          category: availableOffer.category,
          subtype: availableOffer.subtype,
          days: availableOffer.days,
          times: availableOffer.times,
          timeNote: availableOffer.timeNote,
          location: availableOffer.location,
          requirements: availableOffer.requirements,
          sensitivities: availableOffer.sensitivities,
          helpfulWhen: availableOffer.availableWhen,
          foodWorks: availableOffer.mealDescription,
          foodDoesNotWork: availableOffer.sensitivities,
          handoffStyle: availableOffer.handoffStyle,
          audience: availableOffer.audience,
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
            eq(careOffers.status, "available"),
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
