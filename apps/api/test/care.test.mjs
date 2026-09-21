import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app.ts";

const people = {
  "user-a": { personId: "person-a", displayName: "River" },
  "user-b": { personId: "person-b", displayName: "Nia" },
  "user-c": { personId: "person-c", displayName: "Sol" },
};

function createRepository() {
  let nextId = 1;
  let cares = [];

  const visibleTo = (viewerUserId) =>
    cares.filter(
      (care) =>
        care.originatorUserId === viewerUserId ||
        care.participantUserId === viewerUserId ||
        care.status === "open",
    );

  return {
    async listVisible(viewerUserId) {
      return visibleTo(viewerUserId);
    },
    async create(input) {
      const originator = people[input.originatorUserId];
      const id = `care-${nextId++}`;
      cares = [
        {
          id,
          originatorUserId: input.originatorUserId,
          participantUserId: null,
          direction: input.direction,
          category: input.category ?? "food",
          subtype: input.subtype ?? "",
          days: input.days ?? [],
          times: input.times ?? [],
          timeNote: input.timeNote ?? "",
          location: input.location ?? "Not specified",
          requirements: input.requirements ?? "",
          sensitivities: input.sensitivities ?? "",
          audience: input.audience ?? "party",
          status: "open",
          claimedAt: null,
          originatorCompletedAt: null,
          participantCompletedAt: null,
          completedAt: null,
          expiresAt: new Date(input.now.getTime() + 60 * 60 * 1_000),
          expiredAt: null,
          notCompletedAt: null,
          createdAt: input.now,
          originator,
          participant: null,
          gratitude: null,
          apology: null,
        },
        ...cares,
      ];
      return id;
    },
    async pass({ careId }) {
      cares = cares.filter((care) => care.id !== careId);
      return { ok: true, value: null };
    },
    async claim({ careId, participantUserId, now }) {
      const care = cares.find(({ id }) => id === careId);
      if (!care) return { ok: false, error: "care-not-found" };
      if (care.status !== "open") {
        return { ok: false, error: "care-already-claimed" };
      }
      care.status = "claimed";
      care.participantUserId = participantUserId;
      care.claimedAt = now;
      care.participant = people[participantUserId];
      return { ok: true, value: null };
    },
    async recordCompletion({ careId, participantUserId, now }) {
      const care = cares.find(({ id }) => id === careId);
      if (
        !care ||
        care.status !== "claimed" ||
        (care.originatorUserId !== participantUserId &&
          care.participantUserId !== participantUserId)
      ) {
        return { ok: false, error: "care-not-found" };
      }
      if (care.originatorUserId === participantUserId) {
        care.originatorCompletedAt = now;
      } else {
        care.participantCompletedAt = now;
      }
      if (care.originatorCompletedAt && care.participantCompletedAt) {
        care.status = "completed";
        care.completedAt = now;
      }
      return { ok: true, value: null };
    },
    async withdraw({ careId, participantUserId, statementId, message, now }) {
      const care = cares.find(({ id }) => id === careId);
      if (
        !care ||
        care.status !== "claimed" ||
        (care.originatorUserId !== participantUserId &&
          care.participantUserId !== participantUserId)
      ) {
        return { ok: false, error: "care-not-found" };
      }
      care.status = "not_completed";
      care.notCompletedAt = now;
      care.apology = { statementId, message, createdAt: now };
      return { ok: true, value: null };
    },
    async recordGratitude({
      careId,
      receiverUserId,
      statementId,
      message,
      now,
    }) {
      const care = cares.find(({ id }) => id === careId);
      if (!care || care.originatorUserId !== receiverUserId) {
        return { ok: false, error: "care-not-found" };
      }
      if (care.gratitude) {
        return { ok: false, error: "care-gratitude-already-recorded" };
      }
      care.gratitude = { statementId, message, createdAt: now };
      return { ok: true, value: null };
    },
  };
}

function serverFor(repository) {
  return buildApi({
    careRepository: repository,
    sessionResolver: {
      async resolve(request) {
        const userId = Object.entries({
          "session=user-a": "user-a",
          "session=user-b": "user-b",
          "session=user-c": "user-c",
        }).find(([cookie]) => request.headers.cookie === cookie)?.[1];
        return userId ? { userId, ...people[userId] } : null;
      },
      async logout() {},
    },
  });
}

function createPayload(direction = "receive") {
  return {
    direction,
    category: "food",
    subtype: "",
    days: ["thursday"],
    times: ["evening"],
    timeNote: "Tonight",
    location: "Leave it at my door",
    requirements: "Soup",
    sensitivities: "Nothing spicy",
    expiresIn: "1w",
  };
}

test("the unified Care API preserves one identity through claim and completion", async (t) => {
  const repository = createRepository();
  const server = serverFor(repository);
  t.after(() => server.close());

  const unauthenticated = await server.inject({
    method: "GET",
    url: "/api/v1/cares",
  });
  assert.equal(unauthenticated.statusCode, 401);

  const malformed = await server.inject({
    method: "POST",
    url: "/api/v1/cares",
    headers: { cookie: "session=user-a" },
    payload: { category: "food", expiresIn: "1w" },
  });
  assert.equal(malformed.statusCode, 400);

  const created = await server.inject({
    method: "POST",
    url: "/api/v1/cares",
    headers: { cookie: "session=user-a" },
    payload: createPayload(),
  });
  assert.equal(created.statusCode, 200);
  const createdCare = created.json().data.cares[0];
  assert.equal(createdCare.direction, "receive");
  assert.equal(createdCare.status, "open");
  assert.equal(createdCare.originator.displayName, "River");
  assert.equal("requester" in createdCare, false);
  assert.equal("claimant" in createdCare, false);

  const claimed = await server.inject({
    method: "POST",
    url: `/api/v1/cares/${createdCare.id}/claim`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(claimed.statusCode, 200);
  const claimedCare = claimed.json().data.cares[0];
  assert.equal(claimedCare.id, createdCare.id);
  assert.equal(claimedCare.status, "claimed");
  assert.deepEqual(claimedCare.participant, {
    personId: "person-b",
    displayName: "Nia",
  });

  const originatorCompleted = await server.inject({
    method: "POST",
    url: `/api/v1/cares/${createdCare.id}/complete`,
    headers: { cookie: "session=user-a" },
  });
  assert.equal(originatorCompleted.statusCode, 200);
  assert.equal(originatorCompleted.json().data.cares[0].status, "claimed");

  const gratitude = await server.inject({
    method: "POST",
    url: `/api/v1/cares/${createdCare.id}/gratitude`,
    headers: { cookie: "session=user-a" },
    payload: {
      statementId: "meal-care-felt-easy",
      message: "The soup made tonight possible.",
    },
  });
  assert.equal(gratitude.statusCode, 200);
  assert.equal(
    gratitude.json().data.cares[0].gratitude.message,
    "The soup made tonight possible.",
  );

  const participantCompleted = await server.inject({
    method: "POST",
    url: `/api/v1/cares/${createdCare.id}/complete`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(participantCompleted.statusCode, 200);
  assert.equal(participantCompleted.json().data.cares[0].status, "completed");

  const nonparticipant = await server.inject({
    method: "GET",
    url: "/api/v1/cares",
    headers: { cookie: "session=user-c" },
  });
  assert.deepEqual(nonparticipant.json().data.cares, []);

  const oldPath = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
  });
  assert.equal(oldPath.statusCode, 404);
});

test("the unified Care API closes claimed Care with a private apology", async (t) => {
  const repository = createRepository();
  const server = serverFor(repository);
  t.after(() => server.close());

  const created = await server.inject({
    method: "POST",
    url: "/api/v1/cares",
    headers: { cookie: "session=user-a" },
    payload: createPayload("give"),
  });
  const careId = created.json().data.cares[0].id;
  await server.inject({
    method: "POST",
    url: `/api/v1/cares/${careId}/claim`,
    headers: { cookie: "session=user-b" },
  });

  const withdrawn = await server.inject({
    method: "POST",
    url: `/api/v1/cares/${careId}/withdraw`,
    headers: { cookie: "session=user-b" },
    payload: {
      statementId: "meal-something-changed",
      message: "I need to step back this time.",
    },
  });
  assert.equal(withdrawn.statusCode, 200);
  const withdrawnCare = withdrawn.json().data.cares[0];
  assert.equal(withdrawnCare.id, careId);
  assert.equal(withdrawnCare.direction, "give");
  assert.equal(withdrawnCare.status, "not_completed");
  assert.equal(withdrawnCare.apology.message, "I need to step back this time.");
});
