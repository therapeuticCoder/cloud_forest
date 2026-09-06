import { asc, eq, sql } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import { partyMemberships, people, personProfiles } from "./schema.ts";

const partyCapacity = 5;

export type PartyRepositoryError =
  | "person-not-found"
  | "party-self-membership"
  | "party-duplicate-member"
  | "party-capacity-exceeded";

export type PartyRepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: PartyRepositoryError };

export function createPartyRepository(database: DatabaseClient) {
  return {
    async createProfile(input: {
      personId: string;
      displayName: string;
      now: Date;
    }) {
      await database.insert(personProfiles).values({
        personId: input.personId,
        displayName: input.displayName,
        createdAt: input.now,
        updatedAt: input.now,
      });
    },

    async findProfile(personId: string) {
      const [profile] = await database
        .select()
        .from(personProfiles)
        .where(eq(personProfiles.personId, personId))
        .limit(1);
      return profile;
    },

    async listOwned(ownerPersonId: string) {
      return database
        .select()
        .from(partyMemberships)
        .where(eq(partyMemberships.ownerPersonId, ownerPersonId))
        .orderBy(asc(partyMemberships.position));
    },

    async addMember(input: {
      ownerPersonId: string;
      memberPersonId: string;
      relationshipLabel: string;
      privateNote: string;
      now: Date;
    }): Promise<PartyRepositoryResult<{ position: number }>> {
      if (input.ownerPersonId === input.memberPersonId) {
        return { ok: false, error: "party-self-membership" };
      }
      return database.transaction(async (transaction) => {
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtext(${input.ownerPersonId}))`,
        );
        const [owner, member] = await Promise.all([
          transaction
            .select({ id: people.id })
            .from(people)
            .where(eq(people.id, input.ownerPersonId))
            .limit(1),
          transaction
            .select({ id: people.id })
            .from(people)
            .where(eq(people.id, input.memberPersonId))
            .limit(1),
        ]);
        if (owner[0] === undefined || member[0] === undefined)
          return { ok: false, error: "person-not-found" };
        const existing = await transaction
          .select({ memberPersonId: partyMemberships.memberPersonId })
          .from(partyMemberships)
          .where(eq(partyMemberships.ownerPersonId, input.ownerPersonId));
        if (
          existing.some(
            (membership) => membership.memberPersonId === input.memberPersonId,
          )
        ) {
          return { ok: false, error: "party-duplicate-member" };
        }
        if (existing.length >= partyCapacity)
          return { ok: false, error: "party-capacity-exceeded" };
        const position = existing.length;
        await transaction.insert(partyMemberships).values({
          ownerPersonId: input.ownerPersonId,
          memberPersonId: input.memberPersonId,
          relationshipLabel: input.relationshipLabel,
          privateNote: input.privateNote,
          position,
          createdAt: input.now,
          updatedAt: input.now,
        });
        return { ok: true, value: { position } };
      });
    },
  };
}

export type PartyRepository = ReturnType<typeof createPartyRepository>;
