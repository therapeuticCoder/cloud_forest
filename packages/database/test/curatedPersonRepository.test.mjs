import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import { eq } from "drizzle-orm";

import {
  createCuratedPersonRepository,
  createDatabaseClient,
  curatedPersons,
  getTestDatabaseUrl,
  relationshipBlocks,
  users,
} from "../src/index.ts";

const now = new Date("2026-09-07T12:00:00.000Z");
const owner = "user-curation-owner";
const otherOwner = "user-curation-other";

async function removeFixture(database) {
  await database
    .delete(curatedPersons)
    .where(eq(curatedPersons.ownerUserId, owner));
  await database
    .delete(curatedPersons)
    .where(eq(curatedPersons.ownerUserId, otherOwner));
  await database.delete(users).where(eq(users.id, owner));
  await database.delete(users).where(eq(users.id, otherOwner));
}

function input(placement = "party", nickname = "Mira") {
  return {
    ownerUserId: owner,
    nickname,
    relationshipShape: "Friend",
    privateDescription: "A steady place in my life.",
    placement,
    now,
  };
}

test("curated Persons are owner-scoped and Party and Tribe capacity are atomic", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createCuratedPersonRepository(database);
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });
  await removeFixture(database);
  await database.insert(users).values([
    {
      id: owner,
      name: "Curation Owner",
      email: "curation-owner@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: otherOwner,
      name: "Other Owner",
      email: "curation-other@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const additions = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      repository.create(input("party", `Person ${index + 1}`)),
    ),
  );
  assert.equal(additions.filter((result) => result.ok).length, 5);
  assert.equal(
    additions.filter(
      (result) => !result.ok && result.error === "party-capacity-exceeded",
    ).length,
    1,
  );
  assert.equal((await repository.listOwned(owner)).length, 5);

  const tribeAdditions = await Promise.all(
    Array.from({ length: 101 }, (_, index) =>
      repository.create(input("tribe", `Tribe person ${index + 1}`)),
    ),
  );
  assert.equal(tribeAdditions.filter((result) => result.ok).length, 100);
  assert.equal(
    tribeAdditions.filter(
      (result) => !result.ok && result.error === "tribe-capacity-exceeded",
    ).length,
    1,
  );
  assert.equal((await repository.listOwned(owner)).length, 105);
  assert.deepEqual(await repository.listOwned(otherOwner), []);
});

test("curated Persons support holding placement, versioned edits, and deletion", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createCuratedPersonRepository(database);
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });
  await removeFixture(database);
  await database.insert(users).values([
    {
      id: owner,
      name: "Curation Owner",
      email: "curation-owner@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: otherOwner,
      name: "Other Owner",
      email: "curation-other@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const created = await repository.create(input("holding", "Ari"));
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const updated = await repository.update({
    ownerUserId: owner,
    curatedPersonId: created.value.id,
    nickname: "Ari at home",
    relationshipShape: "Chosen Family",
    privateDescription: "A relationship I keep gently held.",
    placement: "holding",
    expectedVersion: created.value.version,
    now: new Date(now.getTime() + 1_000),
  });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  assert.equal(updated.value.version, 2);
  assert.deepEqual(
    await repository.update({
      ...input("holding", "Ari at home"),
      curatedPersonId: created.value.id,
      expectedVersion: 1,
    }),
    { ok: false, error: "stale-write-conflict" },
  );
  await database
    .update(curatedPersons)
    .set({ linkedUserId: otherOwner })
    .where(eq(curatedPersons.id, created.value.id));
  await database.insert(relationshipBlocks).values({
    blockerUserId: owner,
    blockedUserId: otherOwner,
    contextCuratedPersonId: created.value.id,
    createdAt: now,
  });
  assert.deepEqual(
    await repository.remove({
      ownerUserId: owner,
      curatedPersonId: created.value.id,
      expectedVersion: updated.value.version,
    }),
    { ok: true, value: null },
  );
  assert.deepEqual(await repository.listOwned(owner), []);
  assert.deepEqual(
    await database
      .select()
      .from(relationshipBlocks)
      .where(eq(relationshipBlocks.blockerUserId, owner)),
    [],
  );
});

test("blocked Characters do not consume Party, Tribe, or Holding capacity", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createCuratedPersonRepository(database);
  t.after(async () => {
    await removeFixture(database);
    await pool.end();
  });
  await removeFixture(database);
  await database.insert(users).values([
    {
      id: owner,
      name: "Curation Owner",
      email: "curation-owner@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: otherOwner,
      name: "Other Owner",
      email: "curation-other@example.test",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const createMany = async (placement, count) => {
    const results = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        repository.create(input(placement, `${placement}-${index + 1}`)),
      ),
    );
    assert.equal(results.filter((result) => result.ok).length, count);
    return results.filter((result) => result.ok).map((result) => result.value);
  };
  const party = await createMany("party", 5);
  const tribe = await createMany("tribe", 100);
  const holding = await createMany("holding", 5);

  await database
    .update(curatedPersons)
    .set({ linkedUserId: otherOwner })
    .where(eq(curatedPersons.id, party[0].id));
  await database.insert(relationshipBlocks).values({
    blockerUserId: owner,
    blockedUserId: otherOwner,
    contextCuratedPersonId: party[0].id,
    createdAt: now,
  });
  for (const person of [tribe[0], holding[0]]) {
    await database
      .update(curatedPersons)
      .set({ linkedUserId: otherOwner })
      .where(eq(curatedPersons.id, person.id));
  }

  assert.equal(
    (await repository.create(input("party", "party-open"))).ok,
    true,
  );
  assert.equal(
    (await repository.create(input("tribe", "tribe-open"))).ok,
    true,
  );
  assert.equal(
    (await repository.create(input("holding", "holding-open"))).ok,
    true,
  );
});
