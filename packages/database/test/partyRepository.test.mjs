import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import { inArray } from "drizzle-orm";

import {
  createDatabaseClient,
  createPartyRepository,
  getTestDatabaseUrl,
  partyMemberships,
  people,
  personProfiles,
} from "../src/index.ts";

const owner = "person-fictional-owner";
const members = Array.from(
  { length: 6 },
  (_, index) => `person-fictional-member-${index + 1}`,
);
const now = new Date("2026-09-06T18:00:00.000Z");
const fixturePeople = [owner, ...members];

async function removeFixture(database) {
  await database
    .delete(partyMemberships)
    .where(inArray(partyMemberships.ownerPersonId, fixturePeople));
  await database
    .delete(personProfiles)
    .where(inArray(personProfiles.personId, fixturePeople));
  await database.delete(people).where(inArray(people.id, fixturePeople));
}

test("owned Party membership is ordered and atomically protects its five slots", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createPartyRepository(database);
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });
  await removeFixture(database);
  await database
    .insert(people)
    .values([
      { id: owner, createdAt: now },
      ...members.map((id) => ({ id, createdAt: now })),
    ]);
  await Promise.all(
    fixturePeople.map((personId, index) =>
      repository.createProfile({
        personId,
        displayName: index === 0 ? "River Okafor" : `Fictional Member ${index}`,
        now,
      }),
    ),
  );
  assert.equal(
    (await repository.findProfile(owner))?.displayName,
    "River Okafor",
  );
  const additions = await Promise.all(
    members.map((memberPersonId) =>
      repository.addMember({
        ownerPersonId: owner,
        memberPersonId,
        relationshipLabel: "Friend",
        privateNote: "Fictional fixture",
        now,
      }),
    ),
  );
  assert.equal(additions.filter((result) => result.ok).length, 5);
  assert.equal(
    additions.filter(
      (result) => !result.ok && result.error === "party-capacity-exceeded",
    ).length,
    1,
  );
  const existingMember = (await repository.listOwned(owner))[0].memberPersonId;
  const duplicate = await repository.addMember({
    ownerPersonId: owner,
    memberPersonId: existingMember,
    relationshipLabel: "Friend",
    privateNote: "Fictional fixture",
    now,
  });
  assert.deepEqual(duplicate, { ok: false, error: "party-duplicate-member" });
  const self = await repository.addMember({
    ownerPersonId: owner,
    memberPersonId: owner,
    relationshipLabel: "Self",
    privateNote: "",
    now,
  });
  assert.deepEqual(self, { ok: false, error: "party-self-membership" });
  assert.deepEqual(
    (await repository.listOwned(owner)).map((row) => row.position),
    [0, 1, 2, 3, 4],
  );
});

test("a failed profile transaction leaves no partial fictional fixture", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const rollbackPersonId = "person-fictional-rollback";
  t.after(async () => {
    await database
      .delete(personProfiles)
      .where(inArray(personProfiles.personId, [rollbackPersonId]));
    await database.delete(people).where(inArray(people.id, [rollbackPersonId]));
    await pool.end();
  });
  await database.delete(people).where(inArray(people.id, [rollbackPersonId]));
  await assert.rejects(
    database.transaction(async (transaction) => {
      await transaction
        .insert(people)
        .values({ id: rollbackPersonId, createdAt: now });
      await transaction.insert(personProfiles).values({
        personId: rollbackPersonId,
        displayName: "Rollback Fixture",
        createdAt: now,
        updatedAt: now,
      });
      throw new Error("fictional rollback");
    }),
    /fictional rollback/,
  );
  const [persisted] = await database
    .select()
    .from(people)
    .where(inArray(people.id, [rollbackPersonId]));
  assert.equal(persisted, undefined);
});
