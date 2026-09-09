import { eq, inArray } from "drizzle-orm";

import type { DatabaseClient } from "./client.ts";
import { createPartyRepository } from "./partyRepository.ts";
import {
  accounts,
  accountPeople,
  curatedPersons,
  invitations,
  partyMemberships,
  people,
  personProfiles,
  timelineItems,
  users,
} from "./schema.ts";

export const fictionalPartyOwnerId = "person-fictional-owner";
export const fictionalPartyOwnerUserId = "account-fictional-owner";
export const fictionalPartyOwnerEmail = "river@example.test";
export const fictionalPartyOwnerPassword = "cloud-forest-local-password";
export const fictionalEmptyUserPersonId = "person-fictional-empty-user";
export const fictionalEmptyUserId = "account-fictional-empty-user";
export const fictionalEmptyUserEmail = "empty@example.test";
export const fictionalEmptyUserPassword = fictionalPartyOwnerPassword;
export const fictionalPartyInvitationId = "invite-fictional-party";
export const fictionalPartyMobileInvitationId = "invite-fictional-party-mobile";
export const fictionalEmptyUserInvitationId = "invite-fictional-empty-user";
export const fictionalPartyMemberIds = Array.from(
  { length: 3 },
  (_, index) => `person-fictional-member-${index + 1}`,
);
export const fictionalPartyPersonIds = [
  fictionalPartyOwnerId,
  ...fictionalPartyMemberIds,
];
const fictionalPartyCleanupPersonIds = [
  fictionalPartyOwnerId,
  fictionalEmptyUserPersonId,
  ...Array.from(
    { length: 5 },
    (_, index) => `person-fictional-member-${index + 1}`,
  ),
];

const fictionalCuratedPeople = [
  ["mira", "Mira Vale", "Friend", "my calm in the storm"],
  ["sol", "Sol Arden", "Closest friend", "always in my corner"],
  ["anya", "Anya Reed", "Sibling", "keeps me grounded"],
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
        fictionalEmptyUserInvitationId,
      ]),
    );
  await database
    .delete(accountPeople)
    .where(
      inArray(accountPeople.accountId, [
        fictionalPartyOwnerUserId,
        fictionalEmptyUserId,
      ]),
    );
  await database
    .delete(users)
    .where(
      inArray(users.id, [fictionalPartyOwnerUserId, fictionalEmptyUserId]),
    );
  await database
    .delete(partyMemberships)
    .where(inArray(partyMemberships.ownerPersonId, [fictionalPartyOwnerId]));
  await database
    .delete(personProfiles)
    .where(inArray(personProfiles.personId, fictionalPartyCleanupPersonIds));
  await database
    .delete(people)
    .where(inArray(people.id, fictionalPartyCleanupPersonIds));
  await database.insert(people).values(
    [...fictionalPartyPersonIds, fictionalEmptyUserPersonId].map((id) => ({
      id,
      createdAt: now,
    })),
  );
  await database.insert(users).values({
    id: fictionalPartyOwnerUserId,
    name: "River Okafor",
    email: fictionalPartyOwnerEmail,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  await database
    .insert(timelineItems)
    .values({
      id: "timeline-item-mira-soup-001",
      ownerUserId: fictionalPartyOwnerUserId,
      actorId: "mira",
      actorDisplayName: "Mira",
      actorLayer: "party",
      actorInitials: "M",
      actorAvatarUrl: null,
      content:
        "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?",
      publishedAt: new Date("2026-05-30T17:00:00.000Z"),
    })
    .onConflictDoUpdate({
      target: timelineItems.id,
      set: { ownerUserId: fictionalPartyOwnerUserId },
    });
  await database.insert(accounts).values({
    id: "credential-account-fictional-owner",
    accountId: fictionalPartyOwnerUserId,
    providerId: "credential",
    userId: fictionalPartyOwnerUserId,
    password:
      "c8321f0b7f8389975696254cbeb722fa:bd86b554b6287cd7b4fc20ffa12efe0deddc0ebea8e892e3109ba76b142ea714836218031dce68d9bd2b72cb98777ad1f5361bb9fb9d8965e1d7f00ddbfefb3b",
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(users).values({
    id: fictionalEmptyUserId,
    name: "Empty User",
    email: fictionalEmptyUserEmail,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(accounts).values({
    id: "credential-account-fictional-empty-user",
    accountId: fictionalEmptyUserId,
    providerId: "credential",
    userId: fictionalEmptyUserId,
    password:
      "c8321f0b7f8389975696254cbeb722fa:bd86b554b6287cd7b4fc20ffa12efe0deddc0ebea8e892e3109ba76b142ea714836218031dce68d9bd2b72cb98777ad1f5361bb9fb9d8965e1d7f00ddbfefb3b",
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(accountPeople).values({
    accountId: fictionalPartyOwnerUserId,
    personId: fictionalPartyOwnerId,
    createdAt: now,
  });
  await database.insert(accountPeople).values({
    accountId: fictionalEmptyUserId,
    personId: fictionalEmptyUserPersonId,
    createdAt: now,
  });
  await database.insert(invitations).values(
    [fictionalPartyInvitationId, fictionalPartyMobileInvitationId].map(
      (id) => ({
        id,
        email: fictionalPartyOwnerEmail,
        personId: fictionalPartyOwnerId,
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
        createdAt: now,
      }),
    ),
  );
  await database.insert(invitations).values({
    id: fictionalEmptyUserInvitationId,
    email: fictionalEmptyUserEmail,
    personId: fictionalEmptyUserPersonId,
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    createdAt: now,
  });

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
  await repository.createProfile({
    personId: fictionalEmptyUserPersonId,
    displayName: "Empty User",
    now,
  });
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
