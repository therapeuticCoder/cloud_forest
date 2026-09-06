import { and, eq, isNull, sql } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import { accountPeople, invitations } from "./schema.ts";

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
  };
}

export type IdentityRepository = ReturnType<typeof createIdentityRepository>;
