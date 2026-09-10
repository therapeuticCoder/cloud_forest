import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app.ts";

const people = [
  {
    id: "curated-person-owner-1",
    nickname: "Mira",
    relationshipShape: "Friend",
    privateDescription: "A steady place.",
    placement: "party",
    linkedUserId: null,
    version: 1,
    createdAt: new Date("2026-09-07T12:00:00.000Z"),
    updatedAt: new Date("2026-09-07T12:00:00.000Z"),
  },
];

function createRepository() {
  return {
    async listOwned(ownerUserId) {
      return ownerUserId === "user-owner" ? people : [];
    },
    async create(input) {
      assert.equal(input.ownerUserId, "user-owner");
      return { ok: true, value: { ...people[0], id: "created-person" } };
    },
    async update(input) {
      assert.equal(input.ownerUserId, "user-owner");
      return { ok: true, value: people[0] };
    },
    async remove(input) {
      assert.equal(input.ownerUserId, "user-owner");
      return { ok: true, value: null };
    },
  };
}

function serverFor(cookie = "session=owner") {
  return buildApi({
    curatedPersonRepository: createRepository(),
    sessionResolver: {
      async resolve(request) {
        return request.headers.cookie === cookie
          ? { userId: "user-owner", personId: "canonical-owner" }
          : null;
      },
      async logout() {},
    },
  });
}

test("curated Person API derives the owner from the trusted session", async (t) => {
  const server = serverFor();
  t.after(() => server.close());

  const unauthenticated = await server.inject({
    method: "GET",
    url: "/api/v1/curated-persons",
  });
  assert.equal(unauthenticated.statusCode, 401);

  const listed = await server.inject({
    method: "GET",
    url: "/api/v1/curated-persons",
    headers: { cookie: "session=owner" },
  });
  assert.equal(listed.statusCode, 200);
  assert.deepEqual(listed.json().data, {
    people: [
      {
        ...people[0],
        createdAt: people[0].createdAt.toISOString(),
        updatedAt: people[0].updatedAt.toISOString(),
      },
    ],
    changedPersonId: null,
  });

  const created = await server.inject({
    method: "POST",
    url: "/api/v1/curated-persons",
    headers: { cookie: "session=owner" },
    payload: {
      nickname: "Someone dear",
      relationshipShape: "Chosen Family",
      privateDescription: "Private meaning",
      placement: "party",
    },
  });
  assert.equal(created.statusCode, 200);
  assert.equal(created.json().data.changedPersonId, "created-person");

  const callerSuppliedOwner = await server.inject({
    method: "POST",
    url: "/api/v1/curated-persons",
    headers: { cookie: "session=owner" },
    payload: {
      ownerUserId: "user-other",
      nickname: "No owner switch",
      relationshipShape: "Friend",
      privateDescription: "",
      placement: "party",
    },
  });
  assert.equal(callerSuppliedOwner.statusCode, 400);
  assert.equal(callerSuppliedOwner.json().error.code, "VALIDATION_ERROR");
});

test("curated Person API maps capacity, stale, and private deletion outcomes", async (t) => {
  const repository = {
    ...createRepository(),
    async create(input) {
      return {
        ok: false,
        error:
          input.placement === "tribe"
            ? "tribe-capacity-exceeded"
            : "party-capacity-exceeded",
      };
    },
    async update() {
      return { ok: false, error: "stale-write-conflict" };
    },
    async remove() {
      return { ok: false, error: "curated-person-not-found" };
    },
  };
  const server = buildApi({
    curatedPersonRepository: repository,
    sessionResolver: {
      async resolve() {
        return { userId: "user-owner", personId: "canonical-owner" };
      },
      async logout() {},
    },
  });
  t.after(() => server.close());

  const full = await server.inject({
    method: "POST",
    url: "/api/v1/curated-persons",
    payload: {
      nickname: "Full",
      relationshipShape: "Friend",
      privateDescription: "",
      placement: "party",
    },
  });
  assert.equal(full.statusCode, 409);
  assert.equal(full.json().error.code, "PARTY_FULL");

  const tribeFull = await server.inject({
    method: "POST",
    url: "/api/v1/curated-persons",
    payload: {
      nickname: "Full Tribe",
      relationshipShape: "Friend",
      privateDescription: "",
      placement: "tribe",
    },
  });
  assert.equal(tribeFull.statusCode, 409);
  assert.equal(tribeFull.json().error.code, "TRIBE_FULL");

  const stale = await server.inject({
    method: "PATCH",
    url: "/api/v1/curated-persons/curated-person-owner-1",
    payload: {
      nickname: "Updated",
      relationshipShape: "Friend",
      privateDescription: "",
      placement: "holding",
      expectedVersion: 1,
    },
  });
  assert.equal(stale.statusCode, 409);
  assert.equal(stale.json().error.code, "STALE_WRITE_CONFLICT");

  const missing = await server.inject({
    method: "DELETE",
    url: "/api/v1/curated-persons/curated-person-owner-1",
    payload: { expectedVersion: 1 },
  });
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.json().error.code, "NOT_FOUND");
});
