import { and, eq, or, sql, type SQL } from "drizzle-orm";
import {
  cares,
  connections,
  curatedPersons,
  relationshipBlocks,
} from "./schema.ts";

export function currentCareConnection(
  participantUserId: string | SQL,
  careTable = cares,
) {
  return and(
    sql`exists (select 1 from ${connections}
      where ${connections.firstUserId} = least(${careTable.originatorUserId}, ${participantUserId})
        and ${connections.secondUserId} = greatest(${careTable.originatorUserId}, ${participantUserId}))`,
    sql`not exists (select 1 from ${relationshipBlocks}
      where (${relationshipBlocks.blockerUserId} = ${careTable.originatorUserId} and ${relationshipBlocks.blockedUserId} = ${participantUserId})
        or (${relationshipBlocks.blockerUserId} = ${participantUserId} and ${relationshipBlocks.blockedUserId} = ${careTable.originatorUserId}))`,
    sql`exists (select 1 from ${curatedPersons}
      where ${curatedPersons.ownerUserId} = ${careTable.originatorUserId}
        and ${curatedPersons.linkedUserId} = ${participantUserId}
        and ${curatedPersons.placement} = ${careTable.audience})`,
  );
}

// The same predicate supplies Care's entry point and authorizes every message action.
export function careConversationEligibility(viewerUserId: string) {
  return and(
    eq(cares.status, "claimed"),
    or(
      eq(cares.originatorUserId, viewerUserId),
      eq(cares.participantUserId, viewerUserId),
    ),
    currentCareConnection(sql`${cares.participantUserId}`),
  );
}
