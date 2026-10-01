import assert from "node:assert/strict";
import test from "node:test";
import process from "node:process";
import { eq, inArray } from "drizzle-orm";
import {
  createDatabaseClient,
  getTestDatabaseUrl,
  createCareRepository,
  createCareConversationRepository,
  users,
  people,
  personProfiles,
  accountPeople,
  cares,
  connections,
  curatedPersons,
  relationshipBlocks,
  careMessages,
  careMessageReads,
} from "../src/index.ts";

const accounts = ["convo-a", "convo-b", "convo-outsider"];
const personIds = accounts.map((id) => `person-${id}`);
const now = new Date();
async function cleanup(database) {
  await database.delete(cares).where(inArray(cares.originatorUserId, accounts));
  await database
    .delete(curatedPersons)
    .where(inArray(curatedPersons.ownerUserId, accounts));
  await database
    .delete(relationshipBlocks)
    .where(inArray(relationshipBlocks.blockerUserId, accounts));
  await database.delete(connections).where(eq(connections.id, "convo-pair"));
  await database
    .delete(accountPeople)
    .where(inArray(accountPeople.accountId, accounts));
  await database
    .delete(personProfiles)
    .where(inArray(personProfiles.personId, personIds));
  await database.delete(people).where(inArray(people.id, personIds));
  await database.delete(users).where(inArray(users.id, accounts));
}

test("private Care conversations use current eligibility for both participants and directions", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  t.after(async () => {
    await cleanup(database);
    await pool.end();
  });
  await cleanup(database);
  await database.insert(users).values(
    accounts.map((id) => ({
      id,
      name: id,
      email: `${id}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })),
  );
  await database
    .insert(people)
    .values(personIds.map((id) => ({ id, createdAt: now })));
  await database.insert(personProfiles).values(
    personIds.map((personId, index) => ({
      personId,
      displayName: accounts[index],
      createdAt: now,
      updatedAt: now,
    })),
  );
  await database.insert(accountPeople).values(
    accounts.map((accountId, index) => ({
      accountId,
      personId: personIds[index],
      createdAt: now,
    })),
  );
  await database.insert(connections).values({
    id: "convo-pair",
    firstUserId: accounts[0],
    secondUserId: accounts[1],
    createdAt: now,
  });
  await database.insert(curatedPersons).values(
    [0, 1].map((index) => ({
      id: `convo-character-${index}`,
      ownerUserId: accounts[index],
      linkedUserId: accounts[1 - index],
      nickname: "Conversation partner",
      relationshipShape: "Friend",
      placement: "party",
      createdAt: now,
      updatedAt: now,
    })),
  );
  const careRepository = createCareRepository(database);
  const conversationRepository = createCareConversationRepository(database);
  const claimedCare = async (
    originatorUserId = accounts[0],
    direction = "give",
  ) => {
    const participantUserId = accounts.find(
      (id) => id !== originatorUserId && id !== accounts[2],
    );
    const careId = await careRepository.create({
      originatorUserId,
      direction,
      category: "food",
      subtype: "",
      expiresIn: "1w",
      now,
    });
    assert.equal(
      (await careRepository.claim({ careId, participantUserId, now })).ok,
      true,
    );
    return { careId, originatorUserId, participantUserId };
  };
  const available = async (viewer, careId) =>
    (await careRepository.listVisible(viewer)).find(
      (care) => care.id === careId,
    )?.conversationAvailable ?? false;

  for (const originator of accounts.slice(0, 2))
    for (const direction of ["give", "receive"]) {
      await t.test(
        `${originator} originates ${direction}: shared entry, unread markers, partial completion and closure`,
        async () => {
          const { careId, participantUserId } = await claimedCare(
            originator,
            direction,
          );
          for (const viewer of [originator, participantUserId]) {
            assert.equal(await available(viewer, careId), true);
            assert.deepEqual(
              (await conversationRepository.read(careId, viewer)).value,
              [],
            );
            assert.deepEqual(
              (await conversationRepository.unread(viewer)).find(
                (item) => item.careId === careId,
              ),
              { careId, unreadCount: 0 },
            );
          }
          assert.equal(
            (
              await conversationRepository.send(
                careId,
                accounts[2],
                "Unauthorized",
              )
            ).ok,
            false,
          );
          assert.equal(
            (await conversationRepository.send(careId, originator, " ")).ok,
            false,
          );
          assert.equal(
            (
              await conversationRepository.send(
                careId,
                originator,
                "x".repeat(2001),
              )
            ).ok,
            false,
          );
          assert.equal(
            (
              await conversationRepository.send(
                careId,
                originator,
                "First message",
              )
            ).ok,
            true,
          );
          assert.equal(
            (
              await conversationRepository.send(
                careId,
                participantUserId,
                "Reply",
              )
            ).ok,
            true,
          );
          for (const viewer of [originator, participantUserId]) {
            const messages = (await conversationRepository.read(careId, viewer))
              .value;
            assert.deepEqual(
              messages.map((item) => item.text),
              ["First message", "Reply"],
            );
            assert.equal(messages[0].sender.personId, `person-${originator}`);
            assert.equal(
              (await conversationRepository.unread(viewer)).find(
                (item) => item.careId === careId,
              ).unreadCount,
              1,
            );
            assert.equal(
              (
                await conversationRepository.markRead(
                  careId,
                  viewer,
                  messages[1].id,
                )
              ).ok,
              true,
            );
            assert.equal(
              (
                await conversationRepository.markRead(
                  careId,
                  viewer,
                  messages[0].id,
                )
              ).ok,
              true,
            );
            assert.equal(
              (await conversationRepository.unread(viewer)).find(
                (item) => item.careId === careId,
              ).unreadCount,
              0,
            );
          }
          await careRepository.recordCompletion({
            careId,
            participantUserId: originator,
            now,
          });
          assert.equal(await available(participantUserId, careId), true);
          assert.equal(
            (
              await conversationRepository.send(
                careId,
                participantUserId,
                "Still arranging Care",
              )
            ).ok,
            true,
          );
          await Promise.all([
            conversationRepository.send(careId, originator, "Concurrent send"),
            careRepository.recordCompletion({ careId, participantUserId, now }),
          ]);
          assert.deepEqual(
            await database
              .select()
              .from(careMessages)
              .where(eq(careMessages.careId, careId)),
            [],
          );
          assert.deepEqual(
            await database
              .select()
              .from(careMessageReads)
              .where(eq(careMessageReads.careId, careId)),
            [],
          );
          for (const viewer of [originator, participantUserId]) {
            assert.equal(await available(viewer, careId), false);
            assert.equal(
              (await conversationRepository.read(careId, viewer)).ok,
              false,
            );
            assert.equal(
              (await conversationRepository.send(careId, viewer, "Too late"))
                .ok,
              false,
            );
          }
          assert.equal(
            (await careRepository.listVisible(originator)).find(
              (care) => care.id === careId,
            ).status,
            "completed",
          );
        },
      );
    }

  await t.test(
    "current placement, blocking and Connection removal revoke both sides",
    async () => {
      const { careId } = await claimedCare();
      await database
        .update(curatedPersons)
        .set({ placement: "holding" })
        .where(eq(curatedPersons.id, "convo-character-0"));
      for (const viewer of accounts.slice(0, 2)) {
        assert.equal(await available(viewer, careId), false);
        assert.equal(
          (await conversationRepository.send(careId, viewer, "Revoked")).ok,
          false,
        );
      }
      await database
        .update(curatedPersons)
        .set({ placement: "party" })
        .where(eq(curatedPersons.id, "convo-character-0"));
      await database.insert(relationshipBlocks).values({
        blockerUserId: accounts[1],
        blockedUserId: accounts[0],
        createdAt: now,
      });
      for (const viewer of accounts.slice(0, 2))
        assert.equal(
          (await conversationRepository.read(careId, viewer)).ok,
          false,
        );
      await database
        .delete(relationshipBlocks)
        .where(eq(relationshipBlocks.blockerUserId, accounts[1]));
      await database
        .delete(connections)
        .where(eq(connections.id, "convo-pair"));
      for (const viewer of accounts.slice(0, 2))
        assert.equal(
          (await conversationRepository.send(careId, viewer, "Disconnected"))
            .ok,
          false,
        );
      await database.insert(connections).values({
        id: "convo-pair",
        firstUserId: accounts[0],
        secondUserId: accounts[1],
        createdAt: now,
      });
    },
  );

  for (const status of ["not_completed", "expired", "orphaned"])
    await t.test(
      `${status} deletes messages and markers inside the terminal transaction`,
      async () => {
        const { careId } = await claimedCare();
        await conversationRepository.send(
          careId,
          accounts[0],
          "Temporary coordination",
        );
        const [message] = (
          await conversationRepository.read(careId, accounts[1])
        ).value;
        await conversationRepository.markRead(careId, accounts[1], message.id);
        await database.transaction(async (transaction) => {
          const terminal =
            status === "not_completed"
              ? {
                  status,
                  withdrawnByUserId: accounts[0],
                  notCompletedAt: now,
                  withdrawalStatementId: "meal-something-changed",
                }
              : status === "expired"
                ? {
                    status,
                    participantUserId: null,
                    claimedAt: null,
                    expiredAt: now,
                  }
                : { status };
          await transaction
            .update(cares)
            .set(terminal)
            .where(eq(cares.id, careId));
          assert.deepEqual(
            await transaction
              .select()
              .from(careMessages)
              .where(eq(careMessages.careId, careId)),
            [],
          );
          assert.deepEqual(
            await transaction
              .select()
              .from(careMessageReads)
              .where(eq(careMessageReads.careId, careId)),
            [],
          );
        });
        assert.equal(
          (
            await conversationRepository.send(
              careId,
              accounts[0],
              "No resurrection",
            )
          ).ok,
          false,
        );
      },
    );
});
