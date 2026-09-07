import { eq, inArray } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import { createPartyRepository } from "./partyRepository.ts";
import {
  accountPeople,
  curatedPersons,
  invitations,
  partyMemberships,
  people,
  personProfiles,
  users,
} from "./schema.ts";

export const fictionalPartyOwnerId = "person-fictional-owner";
export const fictionalPartyOwnerUserId = "account-fictional-owner";
export const fictionalPartyInvitationId = "invite-fictional-party";
export const fictionalPartyMobileInvitationId = "invite-fictional-party-mobile";
export const fictionalPartyMemberIds = Array.from(
  { length: 5 },
  (_, index) => `person-fictional-member-${index + 1}`,
);
export const fictionalPartyPersonIds = [
  fictionalPartyOwnerId,
  ...fictionalPartyMemberIds,
];

const fictionalCuratedPeople = [
  ["mira", "Mira Vale", "Friend", "my calm in the storm"],
  ["sol", "Sol Arden", "Closest friend", "always in my corner"],
  ["anya", "Anya Reed", "Sibling", "keeps me grounded"],
  ["dev", "Dev Rowan", "Partner", "my steady place"],
  ["ren", "Ren Ellis", "Oldest friend", "always makes me laugh"],
] as const;

export async function seedFictionalPartyFixture(
  database: DatabaseClient,
  now = new Date("2026-09-06T18:00:00.000Z"),
) {
  await database
    .delete(curatedPersons)
    .where(eq(curatedPersons.ownerUserId, fictionalPartyOwnerUserId));
  await database
    .delete(invitations)
    .where(
      inArray(invitations.id, [
        fictionalPartyInvitationId,
        fictionalPartyMobileInvitationId,
      ]),
    );
  await database
    .delete(accountPeople)
    .where(eq(accountPeople.accountId, fictionalPartyOwnerUserId));
  await database.delete(users).where(eq(users.id, fictionalPartyOwnerUserId));
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
  await database.insert(users).values({
    id: fictionalPartyOwnerUserId,
    name: "River Okafor",
    email: "river@example.test",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(accountPeople).values({
    accountId: fictionalPartyOwnerUserId,
    personId: fictionalPartyOwnerId,
    createdAt: now,
  });
  await database.insert(invitations).values(
    [fictionalPartyInvitationId, fictionalPartyMobileInvitationId].map(
      (id) => ({
        id,
        email: "river@example.test",
        personId: fictionalPartyOwnerId,
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
        createdAt: now,
      }),
    ),
  );

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
  await database.insert(curatedPersons).values(
    fictionalCuratedPeople.map(
      ([id, nickname, relationshipShape, privateDescription]) => ({
        id,
        ownerUserId: fictionalPartyOwnerUserId,
        nickname,
        relationshipShape,
        privateDescription,
        placement: "party" as const,
        linkedUserId: null,
        version: 1,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
}
