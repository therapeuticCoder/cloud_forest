import { and, asc, eq, sql } from "drizzle-orm";

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

    async updateProfile(input: {
      personId: string;
      displayName: string;
      now: Date;
    }) {
      const updated = await database
        .update(personProfiles)
        .set({ displayName: input.displayName, updatedAt: input.now })
        .where(eq(personProfiles.personId, input.personId))
        .returning({
          personId: personProfiles.personId,
          displayName: personProfiles.displayName,
        });
      return updated[0] ?? null;
    },

    async isOwnedMember(ownerPersonId: string, memberPersonId: string) {
      const [membership] = await database
        .select({ memberPersonId: partyMemberships.memberPersonId })
        .from(partyMemberships)
        .where(
          and(
            eq(partyMemberships.ownerPersonId, ownerPersonId),
            eq(partyMemberships.memberPersonId, memberPersonId),
          ),
        )
        .limit(1);
      return membership !== undefined;
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

    async updateMember(input: {
      ownerPersonId: string;
      memberPersonId: string;
      relationshipLabel: string;
      privateNote: string;
      expectedVersion: number;
      now: Date;
    }) {
      const updated = await database
        .update(partyMemberships)
        .set({
          relationshipLabel: input.relationshipLabel,
          privateNote: input.privateNote,
          version: sql`${partyMemberships.version} + 1`,
          updatedAt: input.now,
        })
        .where(
          and(
            eq(partyMemberships.ownerPersonId, input.ownerPersonId),
            eq(partyMemberships.memberPersonId, input.memberPersonId),
            eq(partyMemberships.version, input.expectedVersion),
          ),
        )
        .returning();
      return updated[0] ?? null;
    },

    async removeMember(input: {
      ownerPersonId: string;
      memberPersonId: string;
      expectedVersion: number;
    }) {
      return database.transaction(async (transaction) => {
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtext(${input.ownerPersonId}))`,
        );
        const deleted = await transaction
          .delete(partyMemberships)
          .where(
            and(
              eq(partyMemberships.ownerPersonId, input.ownerPersonId),
              eq(partyMemberships.memberPersonId, input.memberPersonId),
              eq(partyMemberships.version, input.expectedVersion),
            ),
          )
          .returning({ position: partyMemberships.position });
        if (deleted[0] === undefined) return null;
        await transaction.execute(sql`
          update ${partyMemberships}
          set position = position - 1, version = version + 1
          where ${partyMemberships.ownerPersonId} = ${input.ownerPersonId}
            and ${partyMemberships.position} > ${deleted[0].position}
        `);
        return deleted[0];
      });
    },

    async reorderMembers(input: {
      ownerPersonId: string;
      members: readonly { memberPersonId: string; expectedVersion: number }[];
      now: Date;
    }) {
      return database.transaction(async (transaction) => {
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtext(${input.ownerPersonId}))`,
        );
        const existing = await transaction
          .select({
            memberPersonId: partyMemberships.memberPersonId,
            version: partyMemberships.version,
          })
          .from(partyMemberships)
          .where(eq(partyMemberships.ownerPersonId, input.ownerPersonId));
        if (
          existing.length !== input.members.length ||
          new Set(input.members.map((member) => member.memberPersonId)).size !==
            input.members.length ||
          !input.members.every((member) =>
            existing.some(
              (row) =>
                row.memberPersonId === member.memberPersonId &&
                row.version === member.expectedVersion,
            ),
          )
        )
          return null;
        const cases = input.members.map(
          (member, position) =>
            sql`when ${partyMemberships.memberPersonId} = ${member.memberPersonId} then ${position}`,
        );
        await transaction.execute(sql`
          update ${partyMemberships}
          set position = case ${sql.join(cases, sql.raw(" "))} end,
              version = version + 1,
              updated_at = ${input.now}
          where ${partyMemberships.ownerPersonId} = ${input.ownerPersonId}
        `);
        return true;
      });
    },
  };
}

export type PartyRepository = ReturnType<typeof createPartyRepository>;
