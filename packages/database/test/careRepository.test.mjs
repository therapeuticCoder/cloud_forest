import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import { eq, inArray } from "drizzle-orm";

import {
  accountPeople,
  cares,
  connections,
  createCareRepository,
  createDatabaseClient,
  curatedPersons,
  getTestDatabaseUrl,
  people,
  personProfiles,
  users,
} from "../src/index.ts";

const now = new Date("2026-09-15T15:00:00.000Z");
const ids = {
  owner: "user-care-owner",
  helper: "user-care-helper",
  stranger: "user-care-stranger",
  ownerPerson: "person-care-owner",
  helperPerson: "person-care-helper",
  strangerPerson: "person-care-stranger",
  connection: "connection-care",
  curatedPerson: "curated-care-helper",
};
const userIds = [ids.owner, ids.helper, ids.stranger];
const personIds = [ids.ownerPerson, ids.helperPerson, ids.strangerPerson];

async function removeFixture(database) {
  await database.delete(cares).where(eq(cares.originatorUserId, ids.owner));
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

function createInput(overrides = {}) {
  return {
    originatorUserId: ids.owner,
    direction: "receive",
    category: "food",
    subtype: "A warm meal",
    days: ["thursday"],
    times: ["evening"],
    timeNote: "Tonight",
    location: "Leave it at my door",
    requirements: "Soup",
    sensitivities: "Nothing spicy",
    expiresIn: "1w",
    now,
    ...overrides,
  };
}

test("the unified Care repository preserves lifecycle, identity, and privacy", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createCareRepository(database);
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

  const careId = await repository.create(createInput());
  assert.deepEqual(
    await repository.claim({
      careId,
      participantUserId: ids.helper,
      now,
    }),
    { ok: true, value: null },
  );

  const ownerCompletedAt = new Date(now.getTime() + 1_000);
  assert.deepEqual(
    await repository.recordCompletion({
      careId,
      participantUserId: ids.owner,
      now: ownerCompletedAt,
    }),
    { ok: true, value: null },
  );
  const helperViewBeforeCompletion = await repository.listVisible(ids.helper);
  assert.equal(helperViewBeforeCompletion[0].status, "claimed");
  assert.deepEqual(
    helperViewBeforeCompletion[0].originatorCompletedAt,
    ownerCompletedAt,
  );
  assert.equal(helperViewBeforeCompletion[0].participantCompletedAt, null);
  assert.deepEqual(await repository.listVisible(ids.stranger), []);

  const gratitudeAt = new Date(now.getTime() + 1_500);
  assert.deepEqual(
    await repository.recordGratitude({
      careId,
      receiverUserId: ids.owner,
      statementId: "meal-care-felt-easy",
      message: "The soup made tonight possible.",
      now: gratitudeAt,
    }),
    { ok: true, value: null },
  );
  const helperViewWithGratitude = await repository.listVisible(ids.helper);
  assert.deepEqual(helperViewWithGratitude[0].gratitude, {
    statementId: "meal-care-felt-easy",
    message: "The soup made tonight possible.",
    createdAt: gratitudeAt,
  });

  const completedAt = new Date(now.getTime() + 2_000);
  assert.deepEqual(
    await repository.recordCompletion({
      careId,
      participantUserId: ids.helper,
      now: completedAt,
    }),
    { ok: true, value: null },
  );
  const ownerHistory = await repository.listVisible(ids.owner);
  const helperHistory = await repository.listVisible(ids.helper);
  assert.equal(ownerHistory[0].status, "completed");
  assert.equal(helperHistory[0].status, "completed");
  assert.deepEqual(ownerHistory[0].completedAt, completedAt);
  assert.deepEqual(ownerHistory[0].originatorCompletedAt, ownerCompletedAt);
  assert.deepEqual(ownerHistory[0].participantCompletedAt, completedAt);
  assert.deepEqual(ownerHistory[0].gratitude, {
    statementId: "meal-care-felt-easy",
    message: "The soup made tonight possible.",
    createdAt: gratitudeAt,
  });
  assert.deepEqual(helperHistory[0].gratitude, ownerHistory[0].gratitude);
  assert.deepEqual(await repository.listVisible(ids.stranger), []);

  assert.deepEqual(
    await repository.recordGratitude({
      careId,
      receiverUserId: ids.owner,
      statementId: "meal-fed-when-needed",
      message: "Another note",
      now: completedAt,
    }),
    { ok: false, error: "care-gratitude-already-recorded" },
  );

  const withdrawnCareId = await repository.create(
    createInput({ now: completedAt }),
  );
  assert.deepEqual(
    await repository.claim({
      careId: withdrawnCareId,
      participantUserId: ids.helper,
      now: completedAt,
    }),
    { ok: true, value: null },
  );

  await database
    .update(curatedPersons)
    .set({ placement: "holding" })
    .where(eq(curatedPersons.id, ids.curatedPerson));
  assert.deepEqual(
    await repository.recordCompletion({
      careId: withdrawnCareId,
      participantUserId: ids.helper,
      now: completedAt,
    }),
    { ok: false, error: "care-not-found" },
  );
  assert.deepEqual(
    await repository.withdraw({
      careId: withdrawnCareId,
      participantUserId: ids.helper,
      statementId: "meal-something-changed",
      message: "I need to step back this time.",
      now: completedAt,
    }),
    { ok: false, error: "care-not-found" },
  );
  assert.deepEqual(
    await repository.withdraw({
      careId: withdrawnCareId,
      participantUserId: ids.owner,
      statementId: "meal-something-changed",
      message: "I need to step back this time.",
      now: completedAt,
    }),
    { ok: false, error: "care-not-found" },
  );
  await database
    .update(curatedPersons)
    .set({ placement: "party" })
    .where(eq(curatedPersons.id, ids.curatedPerson));

  const withdrawnAt = new Date(completedAt.getTime() + 1_000);
  assert.deepEqual(
    await repository.withdraw({
      careId: withdrawnCareId,
      participantUserId: ids.helper,
      statementId: "meal-something-changed",
      message: "I need to step back this time.",
      now: withdrawnAt,
    }),
    { ok: true, value: null },
  );
  const ownerWithdrawal = (await repository.listVisible(ids.owner)).find(
    (care) => care.id === withdrawnCareId,
  );
  const helperWithdrawal = (await repository.listVisible(ids.helper)).find(
    (care) => care.id === withdrawnCareId,
  );
  assert.equal(ownerWithdrawal?.status, "not_completed");
  assert.equal(helperWithdrawal?.status, "not_completed");
  assert.deepEqual(ownerWithdrawal?.notCompletedAt, withdrawnAt);
  assert.deepEqual(ownerWithdrawal?.apology, {
    statementId: "meal-something-changed",
    message: "I need to step back this time.",
    createdAt: withdrawnAt,
  });
  assert.deepEqual(helperWithdrawal?.apology, ownerWithdrawal?.apology);
  assert.equal(
    (await repository.listVisible(ids.stranger)).some(
      (care) => care.id === withdrawnCareId,
    ),
    false,
  );
  assert.deepEqual(
    await repository.recordCompletion({
      careId: withdrawnCareId,
      participantUserId: ids.owner,
      now: withdrawnAt,
    }),
    { ok: false, error: "care-not-found" },
  );
  assert.deepEqual(
    await repository.recordGratitude({
      careId: withdrawnCareId,
      receiverUserId: ids.owner,
      statementId: "meal-care-felt-easy",
      message: "This should not be recorded.",
      now: withdrawnAt,
    }),
    { ok: false, error: "care-not-found" },
  );
});
