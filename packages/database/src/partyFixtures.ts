import { inArray } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import { createPartyRepository } from "./partyRepository.ts";
import { partyMemberships, people, personProfiles } from "./schema.ts";

export const fictionalPartyOwnerId = "person-fictional-owner";
export const fictionalPartyMemberIds = Array.from(
  { length: 5 },
  (_, index) => `person-fictional-member-${index + 1}`,
);
export const fictionalPartyPersonIds = [
  fictionalPartyOwnerId,
  ...fictionalPartyMemberIds,
];

export async function seedFictionalPartyFixture(
  database: DatabaseClient,
  now = new Date("2026-09-06T18:00:00.000Z"),
) {
  await database
    .delete(partyMemberships)
    .where(inArray(partyMemberships.ownerPersonId, [fictionalPartyOwnerId]));
  await database
    .delete(personProfiles)
    .where(inArray(personProfiles.personId, fictionalPartyPersonIds));
  await database
    .delete(people)
    .where(inArray(people.id, fictionalPartyPersonIds));
  await database
    .insert(people)
    .values(fictionalPartyPersonIds.map((id) => ({ id, createdAt: now })));

  const repository = createPartyRepository(database);
  await Promise.all(
    fictionalPartyPersonIds.map((personId, index) =>
      repository.createProfile({
        personId,
        displayName: index === 0 ? "River Okafor" : `Fictional Member ${index}`,
        now,
      }),
    ),
  );
  for (const memberPersonId of fictionalPartyMemberIds) {
    const result = await repository.addMember({
      ownerPersonId: fictionalPartyOwnerId,
      memberPersonId,
      relationshipLabel: "Friend",
      privateNote: "Fictional E2E fixture",
      now,
    });
    if (!result.ok) {
      throw new Error(
        `Could not seed fictional Party fixture: ${result.error}`,
      );
    }
  }
}
