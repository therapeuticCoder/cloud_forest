import type { GetCaresResponse } from "@cloud-forest/api-client";
import type { Care } from "@/types/care";
type CareRecord = GetCaresResponse["data"]["cares"][number];

export function toCare(record: CareRecord): Care {
  return {
    id: record.id,
    direction: record.direction,
    category: record.category,
    subtype: record.subtype,
    days: [...record.days],
    times: [...record.times],
    timeNote: record.timeNote,
    location: record.location,
    requirements: record.requirements,
    sensitivities: record.sensitivities,
    audience: record.audience,
    status: record.status,
    createdAt: record.createdAt,
    ...(record.claimedAt ? { claimedAt: record.claimedAt } : {}),
    ...(record.originatorCompletedAt
      ? { originatorCompletedAt: record.originatorCompletedAt }
      : {}),
    ...(record.participantCompletedAt
      ? { participantCompletedAt: record.participantCompletedAt }
      : {}),
    ...(record.completedAt ? { completedAt: record.completedAt } : {}),
    ...(record.notCompletedAt ? { notCompletedAt: record.notCompletedAt } : {}),
    ...(record.expiresAt ? { expiresAt: record.expiresAt } : {}),
    ...(record.expiredAt ? { expiredAt: record.expiredAt } : {}),
    ...(record.gratitude ? { gratitude: record.gratitude } : {}),
    ...(record.apology ? { apology: record.apology } : {}),
    originator: {
      id: record.originator.personId,
      displayName: record.originator.displayName,
    },
    ...(record.participant
      ? {
          participant: {
            id: record.participant.personId,
            displayName: record.participant.displayName,
          },
        }
      : {}),
  };
}
