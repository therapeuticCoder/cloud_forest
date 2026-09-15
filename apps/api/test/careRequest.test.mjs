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
          createdAt: input.now,
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

  const secondClaim = await server.inject({
    method: "POST",
    url: `/api/v1/care-requests/${createdRequest.id}/claim`,
    headers: { cookie: "session=user-b" },
  });
  assert.equal(secondClaim.statusCode, 409);
  assert.equal(secondClaim.json().error.code, "ALREADY_CLAIMED");
});
