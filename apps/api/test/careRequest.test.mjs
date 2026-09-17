import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app.ts";

function createRepository() {
  let nextId = 1;
  let requests = [];

  return {
    async listVisible(viewerUserId) {
      return requests.filter(
        (request) =>
          request.requesterUserId === viewerUserId ||
          request.status === "open" ||
          request.claimantUserId === viewerUserId,
      );
    },
    async create(input) {
      const id = `care-request-${nextId++}`;
      requests = [
        {
          id,
          kind: "meal",
          helpfulWhen: input.helpfulWhen,
          foodWorks: input.foodWorks,
          foodDoesNotWork: input.foodDoesNotWork,
          handoffStyle: input.handoffStyle,
          audience: "party",
          status: "open",
          claimantUserId: null,
          claimedAt: null,
          requesterCompletedAt: null,
          claimantCompletedAt: null,
          completedAt: null,
          createdAt: input.now,
          originatorUserId: input.requesterUserId,
          requesterUserId: input.requesterUserId,
          requester: { personId: "person-a", displayName: "River" },
          claimant: null,
        },
        ...requests,
      ];
      return id;
    },
    async claim({ careRequestId, claimantUserId, now }) {
      const request = requests.find(({ id }) => id === careRequestId);
      if (!request) return { ok: false, error: "care-request-not-found" };
      if (request.status !== "open") {
        return { ok: false, error: "care-request-already-claimed" };
      }
      requests = requests.map((candidate) =>
        candidate.id === careRequestId
          ? {
              ...candidate,
              status: "claimed",
              claimantUserId,
              claimedAt: now,
              claimant: { personId: "person-b", displayName: "Nia" },
            }
          : candidate,
      );
      return { ok: true, value: null };
    },
    async recordCompletion({ careRequestId, participantUserId, now }) {
      const request = requests.find(({ id }) => id === careRequestId);
      if (
        !request ||
        request.status !== "claimed" ||
        (request.requesterUserId !== participantUserId &&
          request.claimantUserId !== participantUserId)
      ) {
        return { ok: false, error: "care-request-not-found" };
      }
      if (request.requesterUserId === participantUserId) {
        if (request.requesterCompletedAt) {
          return { ok: false, error: "care-request-not-found" };
        }
        requests = requests.map((candidate) =>
          candidate.id === careRequestId
            ? {
                ...candidate,
                requesterCompletedAt: now,
                ...(candidate.claimantCompletedAt
                  ? { status: "completed", completedAt: now }
                  : {}),
              }
            : candidate,
        );
      } else {
        if (request.claimantCompletedAt) {
          return { ok: false, error: "care-request-not-found" };
        }
        requests = requests.map((candidate) =>
          candidate.id === careRequestId
            ? {
                ...candidate,
                claimantCompletedAt: now,
                ...(candidate.requesterCompletedAt
                  ? { status: "completed", completedAt: now }
                  : {}),
              }
            : candidate,
        );
      }
      return { ok: true, value: null };
    },
    async withdraw({
      careRequestId,
      participantUserId,
      statementId,
      message,
      now,
    }) {
      const request = requests.find(({ id }) => id === careRequestId);
      if (
        !request ||
        request.status !== "claimed" ||
        (request.requesterUserId !== participantUserId &&
          request.claimantUserId !== participantUserId)
      ) {
        return { ok: false, error: "care-request-not-found" };
      }
      requests = requests.map((candidate) =>
        candidate.id === careRequestId
          ? {
              ...candidate,
              status: "not_completed",
              notCompletedAt: now,
              apology: { statementId, message, createdAt: now },
            }
          : candidate,
      );
      return { ok: true, value: null };
    },
    async recordGratitude({
      careRequestId,
      receiverUserId,
      statementId,
      message,
      now,
    }) {
      const request = requests.find(({ id }) => id === careRequestId);
      if (
        !request ||
        request.requesterUserId !== receiverUserId ||
        request.requesterCompletedAt === undefined
      ) {
        return { ok: false, error: "care-request-not-found" };
      }
      if (request.gratitude) {
        return { ok: false, error: "care-gratitude-already-recorded" };
      }
      requests = requests.map((candidate) =>
        candidate.id === careRequestId
          ? {
              ...candidate,
              gratitude: { statementId, message, createdAt: now },
            }
          : candidate,
      );
      return { ok: true, value: null };
    },
  };
}

function serverFor(repository) {
  return buildApi({
    careRequestRepository: repository,
    sessionResolver: {
      async resolve(request) {
        if (request.headers.cookie === "session=user-a") {
          return {
            userId: "user-a",
            personId: "person-a",
            displayName: "River",
          };
        }
        if (request.headers.cookie === "session=user-b") {
          return {
            userId: "user-b",
            personId: "person-b",
            displayName: "Nia",
          };
        }
        if (request.headers.cookie === "session=user-c") {
          return {
            userId: "user-c",
            personId: "person-c",
            displayName: "Sol",
          };
        }
        return null;
      },
      async logout() {},
    },
  });
}

test("Care API keeps create and claim responses durable and non-disclosing", async (t) => {
  const repository = createRepository();
  const server = serverFor(repository);
  t.after(() => server.close());

  const unauthenticated = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
  });
  assert.equal(unauthenticated.statusCode, 401);
  assert.equal(unauthenticated.json().error.code, "UNAUTHORIZED");

  const malformed = await server.inject({
    method: "POST",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
    payload: { helpfulWhen: "" },
  });
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.json().error.code, "VALIDATION_ERROR");

  const created = await server.inject({
    method: "POST",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
    payload: {
      helpfulWhen: "Tonight",
      foodWorks: "Soup",
      foodDoesNotWork: "Nothing spicy",
      handoffStyle: "Leave it at my door",
      expiresIn: "1w",
    },
  });
  assert.equal(created.statusCode, 200);
  const createdRequest = created.json().data.requests[0];
  assert.equal(createdRequest.status, "open");
  assert.equal(createdRequest.audience, "Party");
  assert.equal(createdRequest.requester.displayName, "River");

  const claimed = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/claim`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(claimed.statusCode, 200);
  assert.equal(claimed.json().data.requests[0].status, "claimed");
  assert.deepEqual(claimed.json().data.requests[0].claimant, {
    personId: "person-b",
    displayName: "Nia",
  });

  const requesterCompleted = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/complete`,
    headers: { cookie: "session=user-a" },
  });
  assert.equal(requesterCompleted.statusCode, 200);
  const requesterCompletedRequest = requesterCompleted.json().data.requests[0];
  assert.equal(requesterCompletedRequest.status, "claimed");
  assert.match(requesterCompletedRequest.requesterCompletedAt, /T/);
  const requesterCompletedAt = requesterCompletedRequest.requesterCompletedAt;
  assert.equal(requesterCompletedRequest.claimantCompletedAt, undefined);

  const claimantStillActive = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-b" },
  });
  assert.equal(claimantStillActive.statusCode, 200);
  assert.equal(claimantStillActive.json().data.requests[0].status, "claimed");
  assert.equal(
    claimantStillActive.json().data.requests[0].requesterCompletedAt,
    requesterCompletedAt,
  );

  const gratitude = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/gratitude`,
    headers: { cookie: "session=user-a" },
    payload: {
      statementId: "meal-care-felt-easy",
      message: "The soup made tonight possible.",
    },
  });
  assert.equal(gratitude.statusCode, 200);
  assert.deepEqual(gratitude.json().data.requests[0].gratitude, {
    statementId: "meal-care-felt-easy",
    message: "The soup made tonight possible.",
    createdAt: gratitude.json().data.requests[0].gratitude.createdAt,
  });

  const helperGratitude = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-b" },
  });
  assert.equal(
    helperGratitude.json().data.requests[0].gratitude.message,
    "The soup made tonight possible.",
  );

  const giverGratitude = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/gratitude`,
    headers: { cookie: "session=user-b" },
    payload: {
      statementId: "meal-fed-when-needed",
      message: "This should not be accepted from the giver.",
    },
  });
  assert.equal(giverGratitude.statusCode, 404);

  const duplicateGratitude = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/gratitude`,
    headers: { cookie: "session=user-a" },
    payload: {
      statementId: "meal-fed-when-needed",
      message: "Another note.",
    },
  });
  assert.equal(duplicateGratitude.statusCode, 409);

  const claimantCompleted = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/complete`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(claimantCompleted.statusCode, 200);
  const claimantCompletedRequest = claimantCompleted.json().data.requests[0];
  assert.equal(claimantCompletedRequest.status, "completed");
  assert.match(claimantCompletedRequest.claimantCompletedAt, /T/);
  assert.equal(
    claimantCompletedRequest.completedAt,
    claimantCompletedRequest.claimantCompletedAt,
  );

  const requesterHistory = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
  });
  assert.equal(requesterHistory.json().data.requests[0].status, "completed");
  assert.equal(
    requesterHistory.json().data.requests[0].gratitude.message,
    "The soup made tonight possible.",
  );

  const nonparticipantHistory = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-c" },
  });
  assert.deepEqual(nonparticipantHistory.json().data.requests, []);

  const nonparticipantCompletion = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/complete`,
    headers: { cookie: "session=user-c" },
  });
  assert.equal(nonparticipantCompletion.statusCode, 404);

  const secondClaim = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/claim`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(secondClaim.statusCode, 409);
  assert.equal(secondClaim.json().error.code, "ALREADY_CLAIMED");
});

test("Care API closes a claimed Care with a private apology", async (t) => {
  const repository = createRepository();
  const server = serverFor(repository);
  t.after(() => server.close());

  const created = await server.inject({
    method: "POST",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
    payload: {
      helpfulWhen: "Tonight",
      foodWorks: "Soup",
      foodDoesNotWork: "Nothing spicy",
      handoffStyle: "Leave it at my door",
      expiresIn: "1w",
    },
  });
  const requestId = created.json().data.requests[0].id;
  await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${requestId}/claim`,
    headers: { cookie: "session=user-b" },
  });

  const withdrawn = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${requestId}/withdraw`,
    headers: { cookie: "session=user-b" },
    payload: {
      statementId: "meal-something-changed",
      message: "I need to step back this time.",
    },
  });
  assert.equal(withdrawn.statusCode, 200);
  assert.equal(withdrawn.json().data.requests[0].status, "not_completed");
  assert.deepEqual(withdrawn.json().data.requests[0].apology, {
    statementId: "meal-something-changed",
    message: "I need to step back this time.",
    createdAt: withdrawn.json().data.requests[0].apology.createdAt,
  });

  const requesterHistory = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-a" },
  });
  assert.equal(requesterHistory.statusCode, 200);
  assert.equal(
    requesterHistory.json().data.requests[0].status,
    "not_completed",
  );
  assert.equal(
    requesterHistory.json().data.requests[0].apology.message,
    "I need to step back this time.",
  );

  const nonparticipantHistory = await server.inject({
    method: "GET",
    url: "/api/v1/care-requests",
    headers: { cookie: "session=user-c" },
  });
  assert.deepEqual(nonparticipantHistory.json().data.requests, []);
});
