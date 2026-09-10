import { and, eq, isNull, sql } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import {
  accountPeople,
  invitations,
  people,
  personProfiles,
  signupCodes,
  users,
} from "./schema.ts";

export type AccountIdentity = {
  displayName: string;
  personId: string;
  role: "admin" | "user";
};

export function createIdentityRepository(database: DatabaseClient) {
  return {
    async findPersonIdForAccount(accountId: string): Promise<string | null> {
      const [mapping] = await database
        .select({ personId: accountPeople.personId })
        .from(accountPeople)
        .where(eq(accountPeople.accountId, accountId))
        .limit(1);
      return mapping?.personId ?? null;
    },

    async findIdentityForAccount(
      accountId: string,
    ): Promise<AccountIdentity | null> {
      const [identity] = await database
        .select({
          displayName: sql<string>`coalesce(
            ${personProfiles.displayName},
            ${users.name}
          )`,
          personId: accountPeople.personId,
          role: users.role,
        })
        .from(accountPeople)
        .innerJoin(users, eq(accountPeople.accountId, users.id))
        .leftJoin(
          personProfiles,
          eq(accountPeople.personId, personProfiles.personId),
        )
        .where(eq(accountPeople.accountId, accountId))
        .limit(1);
      return identity ?? null;
    },

    async findAccountIdByUsername(username: string): Promise<string | null> {
      const [user] = await database
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      return user?.id ?? null;
    },

    async createPersonForAccount(input: {
      accountId: string;
      personId: string;
      displayName: string;
      now: Date;
    }): Promise<void> {
      await database.transaction(async (transaction) => {
        await transaction.insert(people).values({
          id: input.personId,
          createdAt: input.now,
        });
        await transaction.insert(accountPeople).values({
          accountId: input.accountId,
          personId: input.personId,
          createdAt: input.now,
        });
        await transaction.insert(personProfiles).values({
          personId: input.personId,
          displayName: input.displayName,
          createdAt: input.now,
          updatedAt: input.now,
        });
      });
    },

    async deleteAccountForSignup(input: {
      accountId: string | null;
      personId: string;
      username: string;
    }): Promise<void> {
      await database.transaction(async (transaction) => {
        const accountId =
          input.accountId ??
          (
            await transaction
              .select({ id: users.id })
              .from(users)
              .where(eq(users.username, input.username))
              .limit(1)
          )[0]?.id;
        if (accountId === undefined) return;

        await transaction
          .delete(accountPeople)
          .where(
            and(
              eq(accountPeople.accountId, accountId),
              eq(accountPeople.personId, input.personId),
            ),
          );
        await transaction
          .delete(personProfiles)
          .where(eq(personProfiles.personId, input.personId));
        await transaction.delete(people).where(eq(people.id, input.personId));
        await transaction.delete(users).where(eq(users.id, accountId));
      });
    },

    async createSignupCode(input: {
      id: string;
      code: string;
      createdByUserId: string;
      now: Date;
    }): Promise<void> {
      await database.insert(signupCodes).values({
        id: input.id,
        code: input.code,
        createdByUserId: input.createdByUserId,
        createdAt: input.now,
      });
    },

    async consumeSignupCode(code: string, now: Date): Promise<boolean> {
      const result = await database
        .update(signupCodes)
        .set({ usedAt: now })
        .where(and(eq(signupCodes.code, code), isNull(signupCodes.usedAt)))
        .returning({ id: signupCodes.id });
      return result.length === 1;
    },

    async consumeInvitation(invitationId: string, now: Date): Promise<boolean> {
      const result = await database
        .update(invitations)
        .set({ consumedAt: now })
        .where(
          and(
            eq(invitations.id, invitationId),
            isNull(invitations.consumedAt),
            isNull(invitations.revokedAt),
            sql`${invitations.expiresAt} > ${now}`,
          ),
        )
        .returning({ id: invitations.id });
      return result.length === 1;
    },
    async consumeInvitationForAccount(
      accountId: string,
      now: Date,
    ): Promise<boolean> {
      const personId = await this.findPersonIdForAccount(accountId);
      if (personId === null) return false;
      const [invitation] = await database
        .select({ id: invitations.id })
        .from(invitations)
        .where(
          and(
            eq(invitations.personId, personId),
            isNull(invitations.consumedAt),
            isNull(invitations.revokedAt),
            sql`${invitations.expiresAt} > ${now}`,
          ),
        )
        .limit(1);
      return invitation === undefined
        ? false
        : this.consumeInvitation(invitation.id, now);
    },
  };
}

export type IdentityRepository = ReturnType<typeof createIdentityRepository>;
