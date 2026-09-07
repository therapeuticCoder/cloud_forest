import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app.ts";

function createRepository() {
  const members = [
    {
      memberPersonId: "person-member",
      position: 0,
      relationshipLabel: "Friend",
      privateNote: "Private",
      version: 1,
    },
  ];
  return {
    async findProfile(id) {
      return id === "person-missing"
        ? undefined
        : {
            personId: id,
            displayName: id === "person-owner" ? "River" : "Nia",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
    },
    async updateProfile({ personId, displayName }) {
      return { personId, displayName };
    },
    async isOwnedMember(owner, member) {
      return owner === "person-owner" && member === "person-member";
    },
    async listOwned() {
      return members;
    },
    async addMember(input) {
      if (input.memberPersonId === "person-missing")
        return { ok: false, error: "person-not-found" };
      if (input.memberPersonId === "person-member")
        return { ok: false, error: "party-duplicate-member" };
      return { ok: false, error: "party-capacity-exceeded" };
    },
    async updateMember(input) {
      return input.expectedVersion === 1 ? members[0] : null;
    },
    async removeMember(input) {
      return input.expectedVersion === 1 ? { position: 0 } : null;
    },
    async reorderMembers(input) {
      return (
        input.members.length === 1 && input.members[0].expectedVersion === 1
      );
    },
  };
}
function serverFor(cookie = "session=owner") {
  return buildApi({
    partyRepository: createRepository(),
    sessionResolver: {
      async resolve(request) {
        return request.headers.cookie === cookie
          ? { personId: "person-owner" }
          : null;
      },
      async logout() {},
    },
  });
}

test("Party API derives identity and returns typed denials and validation errors", async (t) => {
  const server = serverFor();
  t.after(() => server.close());
  const unauthenticated = await server.inject({
    method: "GET",
    url: "/api/v1/party",
  });
  assert.equal(unauthenticated.statusCode, 401);
  assert.equal(unauthenticated.json().error.code, "UNAUTHORIZED");
  const forbidden = await server.inject({
    method: "GET",
    url: "/api/v1/profiles/person-stranger",
    headers: { cookie: "session=owner" },
  });
  assert.equal(forbidden.statusCode, 403);
  assert.equal(forbidden.json().error.code, "FORBIDDEN");
  const malformed = await server.inject({
    method: "POST",
    url: "/api/v1/party",
    headers: { cookie: "session=owner" },
    payload: { memberPersonId: "", relationshipLabel: "", privateNote: "" },
  });
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.json().error.code, "VALIDATION_ERROR");
});

test("Party API maps duplicate, full, not-found, and stale writes without caller ownership", async (t) => {
  const server = serverFor();
  t.after(() => server.close());
  for (const [memberPersonId, code, status] of [
    ["person-member", "DUPLICATE_MEMBER", 409],
    ["person-full", "PARTY_FULL", 409],
    ["person-missing", "NOT_FOUND", 404],
  ]) {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/party",
      headers: { cookie: "session=owner" },
      payload: { memberPersonId, relationshipLabel: "Friend", privateNote: "" },
    });
    assert.equal(response.statusCode, status);
    assert.equal(response.json().error.code, code);
  }
  const stale = await server.inject({
    method: "PATCH",
    url: "/api/v1/party/person-member",
    headers: { cookie: "session=owner" },
    payload: {
      relationshipLabel: "Friend",
      privateNote: "",
      expectedVersion: 2,
    },
  });
  assert.equal(stale.statusCode, 409);
  assert.equal(stale.json().error.code, "STALE_WRITE_CONFLICT");
});
