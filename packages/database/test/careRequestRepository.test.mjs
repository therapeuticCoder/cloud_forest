import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import { eq, inArray } from "drizzle-orm";

import {
  accountPeople,
  careRequests,
  connections,
  createCareRequestRepository,
  createDatabaseClient,
  curatedPersons,
  getTestDatabaseUrl,
  people,
  personProfiles,
  users,
} from "../src/index.ts";

const now = new Date("2026-09-15T15:00:00.000Z");
const ids = {
  owner: "user-care-completion-owner",
  helper: "user-care-completion-helper",
  stranger: "user-care-completion-stranger",
  ownerPerson: "person-care-completion-owner",
  helperPerson: "person-care-completion-helper",
  strangerPerson: "person-care-completion-stranger",
  connection: "connection-care-completion",
  curatedPerson: "curated-care-completion-helper",
};
const userIds = [ids.owner, ids.helper, ids.stranger];
const personIds = [ids.ownerPerson, ids.helperPerson, ids.strangerPerson];

async function removeFixture(database) {
  await database
    .delete(careRequests)
    .where(eq(careRequests.requesterUserId, ids.owner));
  await database
    .delete(curatedPersons)
    .where(eq(curatedPersons.ownerUserId, ids.owner));
  await database.delete(connections).where(eq(connections.id, ids.connection));
  await database
    .delete(accountPeople)
    .where(inArray(accountPeople.accountId, userIds));
  await database
    .delete(personProfiles)
    .where(inArray(personProfiles.personId, personIds));
  await database.delete(people).where(inArray(people.id, personIds));
  await database.delete(users).where(inArray(users.id, userIds));
}

test("claimed Care completion is shared, terminal, and participant-private", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createCareRequestRepository(database);
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });

  await removeFixture(database);
  await database.insert(users).values(
    userIds.map((id, index) => ({
      id,
      name:
        index === 0
          ? "Care Owner"
          : index === 1
            ? "Care Helper"
            : "Care Stranger",
      email: `${id}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })),
  );
  await database
    .insert(people)
    .values(personIds.map((id) => ({ id, createdAt: now })));
  await database.insert(personProfiles).values([
    {
      personId: ids.ownerPerson,
      displayName: "Care Owner",
      createdAt: now,
      updatedAt: now,
    },
    {
      personId: ids.helperPerson,
      displayName: "Care Helper",
      createdAt: now,
      updatedAt: now,
    },
    {
      personId: ids.strangerPerson,
      displayName: "Care Stranger",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(accountPeople).values([
    { accountId: ids.owner, personId: ids.ownerPerson, createdAt: now },
    { accountId: ids.helper, personId: ids.helperPerson, createdAt: now },
    {
      accountId: ids.stranger,
      personId: ids.strangerPerson,
      createdAt: now,
    },
  ]);
  await database.insert(connections).values({
    id: ids.connection,
    firstUserId: ids.helper,
    secondUserId: ids.owner,
    createdAt: now,
  });
  await database.insert(curatedPersons).values({
    id: ids.curatedPerson,
    ownerUserId: ids.owner,
    nickname: "Care Helper",
    relationshipShape: "Friend",
    privateDescription: "Private connection detail.",
    placement: "party",
    linkedUserId: ids.helper,
    createdAt: now,
    updatedAt: now,
  });

  const requestId = await repository.create({
    requesterUserId: ids.owner,
    helpfulWhen: "Tonight",
    foodWorks: "Soup",
    foodDoesNotWork: "Nothing spicy",
    handoffStyle: "Leave it at my door",
    now,
  });
  assert.deepEqual(
    await repository.claim({
      careRequestId: requestId,
      claimantUserId: ids.helper,
      now,
    }),
    { ok: true, value: null },
  );

  const ownerCompletedAt = new Date(now.getTime() + 1_000);
  assert.deepEqual(
    await repository.recordCompletion({
      careRequestId: requestId,
      participantUserId: ids.owner,
      now: ownerCompletedAt,
    }),
    { ok: true, value: null },
  );
  const helperViewBeforeCompletion = await repository.listVisible(ids.helper);
  assert.equal(helperViewBeforeCompletion[0].status, "claimed");
  assert.equal(
    helperViewBeforeCompletion[0].requesterCompletedAt,
    ownerCompletedAt,
  );
  assert.equal(helperViewBeforeCompletion[0].claimantCompletedAt, null);
  assert.deepEqual(await repository.listVisible(ids.stranger), []);

  const completedAt = new Date(now.getTime() + 2_000);
  assert.deepEqual(
    await repository.recordCompletion({
      careRequestId: requestId,
      participantUserId: ids.helper,
      now: completedAt,
    }),
    { ok: true, value: null },
  );
  const ownerHistory = await repository.listVisible(ids.owner);
  const helperHistory = await repository.listVisible(ids.helper);
  assert.equal(ownerHistory[0].status, "completed");
  assert.equal(helperHistory[0].status, "completed");
  assert.equal(ownerHistory[0].completedAt, completedAt);
  assert.equal(helperHistory[0].completedAt, completedAt);
  assert.equal(ownerHistory[0].requesterCompletedAt, ownerCompletedAt);
  assert.equal(helperHistory[0].claimantCompletedAt, completedAt);
  assert.deepEqual(await repository.listVisible(ids.stranger), []);
});
